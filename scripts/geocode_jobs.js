require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const fs = require('fs');

// --- Configuration ---
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_GEOCODING_API_KEY = process.env.GOOGLE_GEOCODING_API_KEY;
const GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const ERROR_LOG_FILE = 'geocode_errors.log';
const API_DELAY_MS = 200; // Delay between Google API calls

// --- Input Validation ---
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !GOOGLE_GEOCODING_API_KEY) {
    console.error('Error: Missing required environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GOOGLE_GEOCODING_API_KEY).');
    process.exit(1);
}

// --- Initialize Clients ---
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// --- Helper Functions ---

/**
 * Introduces a delay.
 * @param {number} ms - Milliseconds to wait.
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Appends an error message to the error log file.
 * @param {string} message - The error message to log.
 */
const logErrorToFile = (message) => {
    const timestamp = new Date().toISOString();
    fs.appendFile(ERROR_LOG_FILE, `${timestamp} - ${message}\n`, (err) => {
        if (err) {
            console.error(`Failed to write to error log file: ${err}`);
        }
    });
};

/**
 * Extracts structured address components from Google Geocoding API result.
 * @param {Array} addressComponents - The address_components array from the API response.
 * @returns {object|null} - An object with structured address fields or null if essential components are missing.
 */
const parseAddressComponents = (addressComponents) => {
    const components = {};
    addressComponents.forEach(component => {
        const type = component.types[0];
        // Map Google types to our database columns
        switch (type) {
            case 'street_number':
                components.street_number = component.long_name;
                break;
            case 'route': // Street name
                components.route = component.long_name;
                break;
            case 'locality': // City
                components.address_locality = component.long_name;
                break;
            case 'administrative_area_level_1': // State/Province
                components.address_region = component.short_name; // Use short name (e.g., 'CA')
                break;
            case 'country':
                components.address_country = component.short_name; // Use short name (e.g., 'US')
                break;
            case 'postal_code':
                components.postal_code = component.long_name;
                break;
        }
    });

    // Combine street number and route
    if (components.street_number && components.route) {
        components.street_address = `${components.street_number} ${components.route}`;
    } else {
        components.street_address = components.route || components.street_number || null; // Fallback if one part is missing
    }

    // Basic validation: Check if we got at least city, region, or country
    if (!components.address_locality && !components.address_region && !components.address_country) {
        return null; // Not enough data to be useful
    }

    return {
        street_address: components.street_address || null,
        address_locality: components.address_locality || null,
        address_region: components.address_region || null,
        postal_code: components.postal_code || null,
        address_country: components.address_country || null,
    };
};


// --- Main Processing Function ---
async function geocodeJobs() {
    console.log('Starting geocoding process...');

    // 1. Fetch jobs needing geocoding
    console.log('Fetching jobs from Supabase where street_address is NULL...');
    const { data: jobs, error: fetchError } = await supabase
        .from('jobs')
        .select('id, location')
        .is('street_address', null); // Fetch only jobs without a street address

    if (fetchError) {
        console.error('Error fetching jobs from Supabase:', fetchError.message);
        logErrorToFile(`Supabase fetch error: ${fetchError.message}`);
        return;
    }

    if (!jobs || jobs.length === 0) {
        console.log('No jobs found needing geocoding.');
        return;
    }

    console.log(`Found ${jobs.length} jobs to process.`);

    // 2. Process each job
    let successCount = 0;
    let errorCount = 0;

    for (const job of jobs) {
        if (!job.location || typeof job.location !== 'string' || job.location.trim() === '') {
            console.warn(`Skipping job ID ${job.id}: Invalid or empty location text.`);
            continue;
        }

        const locationText = job.location.trim();
        console.log(`\nProcessing Job ID: ${job.id}, Location: "${locationText}"`);

        try {
            // 3. Call Google Geocoding API
            const response = await axios.get(GEOCODING_API_URL, {
                params: {
                    address: locationText,
                    key: GOOGLE_GEOCODING_API_KEY,
                },
            });

            // 4. Handle API Response
            if (response.data.status === 'OK' && response.data.results.length > 0) {
                const result = response.data.results[0];
                const addressComponents = result.address_components;
                const structuredAddress = parseAddressComponents(addressComponents);

                if (structuredAddress) {
                    // 5. Update Supabase
                    console.log(`  Geocoding successful. Updating Supabase...`);
                    const { error: updateError } = await supabase
                        .from('jobs')
                        .update(structuredAddress)
                        .eq('id', job.id);

                    if (updateError) {
                        console.error(`  Error updating Supabase for job ID ${job.id}:`, updateError.message);
                        logErrorToFile(`Supabase update error for job ID ${job.id} (Location: "${locationText}"): ${updateError.message}`);
                        errorCount++;
                    } else {
                        console.log(`  Successfully updated job ID: ${job.id}`);
                        successCount++;
                    }
                } else {
                    console.warn(`  Could not parse sufficient address components for job ID ${job.id}. Skipping update.`);
                    logErrorToFile(`Parsing error for job ID ${job.id} (Location: "${locationText}"): Insufficient components found.`);
                    errorCount++;
                }

            } else {
                console.warn(`  Geocoding API status: ${response.data.status} for job ID ${job.id}. Skipping update.`);
                if (response.data.error_message) {
                    console.warn(`  API Error Message: ${response.data.error_message}`);
                    logErrorToFile(`Geocoding API error for job ID ${job.id} (Location: "${locationText}"): Status ${response.data.status}, Message: ${response.data.error_message}`);
                } else {
                    logErrorToFile(`Geocoding API error for job ID ${job.id} (Location: "${locationText}"): Status ${response.data.status}`);
                }
                errorCount++;
            }

        } catch (error) {
            console.error(`  An unexpected error occurred processing job ID ${job.id}:`, error.message);
            logErrorToFile(`Unexpected error for job ID ${job.id} (Location: "${locationText}"): ${error.message}`);
            errorCount++;
        }

        // 6. Delay before next API call
        await delay(API_DELAY_MS);
    }

    console.log('\n--- Geocoding Process Complete ---');
    console.log(`Successfully updated: ${successCount}`);
    console.log(`Errors/Skipped: ${errorCount}`);
    if (errorCount > 0) {
        console.log(`See ${ERROR_LOG_FILE} for detailed errors.`);
    }
    console.log('----------------------------------');
}

// --- Run the script ---
geocodeJobs();