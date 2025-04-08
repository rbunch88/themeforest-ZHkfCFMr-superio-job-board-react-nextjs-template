// superio/supabase/seed/seed.js
import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });


// --- Configuration ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL environment variable is not set.');
  process.exit(1);
}
if (!supabaseServiceRoleKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is not set.');
  console.error('This key is required for write operations during seeding and should be kept secret.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// --- ABA-Specific Data Lists ---
const abaJobTitles = [
  "Registered Behavior Technician (RBT)", "Board Certified Behavior Analyst (BCBA)",
  "Board Certified Assistant Behavior Analyst (BCaBA)", "Clinical Supervisor (BCBA)",
  "ABA Therapist", "Special Education Teacher - ABA Focus", "Behavior Interventionist",
  "Program Manager (BCBA)",
];
const abaSkills = [
  "Functional Behavior Assessment (FBA)", "Discrete Trial Training (DTT)",
  "Natural Environment Teaching (NET)", "Verbal Behavior Milestones Assessment and Placement Program (VB-MAPP)",
  "Assessment of Basic Language and Learning Skills (ABLLS-R)", "Picture Exchange Communication System (PECS)",
  "Data Collection & Analysis", "Behavior Intervention Plan (BIP) Development & Implementation",
  "Parent Training", "Staff Training & Supervision", "Crisis Intervention",
];
const abaCompanyNames = [
  "Behavioral Innovations", "Hopebridge Autism Therapy Centers", "The Center for Autism and Related Disorders (CARD)",
  "BlueSprig Pediatrics", "Action Behavior Centers", "Butterfly Effects", "Proud Moments ABA",
  "Key Autism Services", "Acorn Health", "Golden Steps ABA",
];
const abaJobCategories = ["Clinical Services", "School-Based", "Early Intervention", "In-Home Services", "Supervisory"];
const abaJobTypes = ["Full-time", "Part-time", "Contract"];
const abaExperienceLevels = ["Entry-Level", "Mid-Level (1-3 years)", "Senior-Level (3-5 years)", "Lead/Supervisory (5+ years)"];
const abaCertificationTypes = ["RBT", "BCBA", "BCaBA", "LBA (State License)", "No Certification Required"];

// --- Global ID Storage ---
let createdUserIds = { employers: [], candidates: [] };
let createdCompanyIds = [];
let createdCandidateIds = []; // Stores profile IDs of candidates
let createdProfileIds = [];
let createdLookupIds = { categories: [], types: [], levels: [], certifications: [] };

// --- Helper Functions ---
async function seedLookupTable(tableName, dataArray, requiresSlug = false) {
  console.log(`Seeding ${tableName}...`);
  const recordsToInsert = dataArray.map(name => {
    const record = { name };
    if (requiresSlug) {
      record.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    return record;
  });

  const { data, error } = await supabase
    .from(tableName)
    .insert(recordsToInsert)
    .select('id, name');

  if (error) {
    console.error(`Error seeding ${tableName}:`, error.message);
    throw error;
  } else {
    console.log(`Successfully seeded ${data.length} records into ${tableName}.`);
    // Store IDs globally
    if (tableName === 'job_categories') createdLookupIds.categories = data.map(d => d.id);
    if (tableName === 'job_types') createdLookupIds.types = data.map(d => d.id);
    if (tableName === 'experience_levels') createdLookupIds.levels = data.map(d => d.id);
    if (tableName === 'certification_types') createdLookupIds.certifications = data.map(d => d.id);
    return data;
  }
}

// Helper to generate sample work history for candidates
function generateWorkHistory() {
    const history = [];
    const numEntries = faker.number.int({ min: 1, max: 2 }); // 1 or 2 past jobs
    let endDate = faker.date.past({ years: 1 }); // End date of the most recent job

    for (let i = 0; i < numEntries; i++) {
        const startDate = faker.date.past({ years: faker.number.int({ min: 1, max: 3 }), refDate: endDate }); // Start date before end date
        history.push({
            job_title: faker.helpers.arrayElement(abaJobTitles.filter(t => !t.includes('Manager') && !t.includes('Supervisor'))), // Avoid manager roles for simplicity
            company_name: faker.helpers.arrayElement(abaCompanyNames),
            start_date: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
            end_date: endDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
            description: faker.lorem.sentence()
        });
        // Ensure years is at least 1 for the next iteration's end date calculation
        endDate = faker.date.past({ years: faker.number.int({ min: 1, max: 2 }), refDate: startDate }); // Changed min: 0 to min: 1
    }
    return history;
}

// --- Seeding Functions ---
async function clearTables() {
  console.warn('--- Attempting to Clear Seeded Data ---');
  // No longer checking ALLOW_SEED_DELETION env var, always attempt cleanup

  try {
    // Delete in reverse order of dependency / creation
    console.log('Deleting jobs...');
    // Assuming jobs might reference companies/users seeded in *this run*
    // A safer approach might be to delete *all* jobs if this script owns seeding
    // For now, let's delete all jobs as a simple strategy. Add filters if needed.
    const { error: deleteJobsError } = await supabase.from('jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    if (deleteJobsError) console.error('Error deleting jobs:', deleteJobsError.message);
    else console.log('Jobs deleted.');

    console.log('Deleting companies...');
    // Fallback if IDs weren't tracked (e.g., previous failed run)
    const { error: deleteAllCompaniesError } = await supabase.from('companies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (deleteAllCompaniesError) console.error('Error deleting remaining companies:', deleteAllCompaniesError.message);
    else console.log('Attempted cleanup of any remaining companies.');


    // --- Robust User & Dependent Data Cleanup ---
    console.log('Fetching test users from auth.users...');
    const { data: users, error: listUsersError } = await supabase.auth.admin.listUsers({
        // Note: listUsers has a limit, might need pagination for >50 users
    });

    if (listUsersError) {
        console.error('Error listing users:', listUsersError);
    } else {
        const testUserIds = users.users.filter(user => user.email && user.email.endsWith('@seed.test')).map(user => user.id);
        console.log(`Found ${testUserIds.length} test users to delete.`);

        // Delete dependent public data first (user_roles, profiles, candidates)
        if (testUserIds.length > 0) {
            console.log('Deleting dependent user data (roles, profiles, candidates)...');
            // These can run in parallel
            try {
                await Promise.all([
                    supabase.from('user_roles').delete().in('user_id', testUserIds),
                    supabase.from('candidates').delete().in('profile_id', testUserIds), // candidates depends on profiles
                    supabase.from('profiles').delete().in('id', testUserIds) // profiles depends on auth.users
                ]);
                 console.log('Finished deleting dependent public data.');
            } catch(err) {
                console.error("Error deleting dependent public data:", err)
            }
        }

        // Now delete the auth users using Promise.all for better handling
        const deletePromises = testUserIds.map(async (userId) => { // Make the callback async
            console.log(`Deleting user ${userId}...`);
            // Use try-catch within the map to handle individual errors without stopping Promise.all
            try {
                const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userId, true); // true = hard delete
                if (deleteUserError) {
                    console.error(`Error deleting user ${userId}:`, deleteUserError.message);
                }
            } catch (individualError) {
                 console.error(`Caught error deleting user ${userId}:`, individualError);
            }
        });

        // Wait for all the async delete operations to complete
        try {
            await Promise.all(deletePromises);
            console.log('Finished deleting test users.');
        } catch (aggregateError) {
            // This catch might not be strictly necessary if individual errors are handled above,
            // but good practice for Promise.all
            console.error("Error during Promise.all for user deletion:", aggregateError);
        }
    }
    // --- End Robust User Cleanup ---

    // Delete lookup tables (assuming this script manages them)
    await clearLookupTable('certification_types');
    await clearLookupTable('experience_levels');
    await clearLookupTable('job_types');
    await clearLookupTable('job_categories');

    // Reset global ID trackers
    createdUserIds = { employers: [], candidates: [] };
    createdCompanyIds = [];
    createdCandidateIds = [];
    createdProfileIds = [];
    createdLookupIds = { categories: [], types: [], levels: [], certifications: [] };

    console.warn('--- Finished Clearing Seeded Data ---');

  } catch (error) {
      console.error('Error during table clearing:', error);
      // Decide if seeding should continue after a clearing error
  }
}

async function clearLookupTable(tableName) {
    console.log(`Deleting ${tableName}...`);
    // Delete all entries. Use with caution, assumes this script manages these entries.
    const { error } = await supabase.from(tableName).delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Target all rows
    if (error) console.error(`Error deleting ${tableName}:`, error.message);
    else console.log(`${tableName} deleted.`);
}

async function seedLookupTables() {
  console.log('--- Seeding Lookup Tables ---');
  try {
    // Assuming job_categories and job_types do NOT require slugs based on previous checks
    await seedLookupTable('job_categories', abaJobCategories, true);
    await seedLookupTable('job_types', abaJobTypes, false);
    // Assuming experience_levels and certification_types DO require slugs
    await seedLookupTable('experience_levels', abaExperienceLevels, true);
    await seedLookupTable('certification_types', abaCertificationTypes, true);
    console.log('--- Finished Seeding Lookup Tables ---');
  } catch (error) {
    console.error('Failed to seed one or more lookup tables. Aborting.');
    throw error;
  }
}

async function seedUsers() {
  console.log('--- Seeding Users and Roles ---');
  const numEmployers = 5;
  const numCandidates = 8;
  const totalUsers = numEmployers + numCandidates;

  console.log(`Attempting to create ${totalUsers} users (${numEmployers} employers, ${numCandidates} candidates)...`);

  // Reset createdUserIds at the start of seeding users
  createdUserIds = { employers: [], candidates: [] };

  for (let i = 0; i < totalUsers; i++) {
    const userRole = i < numEmployers ? 'employer' : 'job_seeker'; // Use correct enum value
    const email = faker.internet.email({ firstName: userRole, lastName: `${i + 1}`, provider: 'seed.test' });
    const password = 'password123';

    try {
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
      });

      if (userError) {
        // Don't stop the loop, just log and continue
        console.error(`Error creating user ${email}:`, userError.message);
        continue;
      }

      if (userData && userData.user) {
        const userId = userData.user.id;
        console.log(`Successfully created user: ${email} (ID: ${userId}, Role: ${userRole})`);

        // Assign role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: userRole });

        if (roleError) {
          console.error(`Error assigning role ${userRole} to user ${userId}:`, roleError.message);
          // Decide if you want to delete the user if role assignment fails
          // await supabase.auth.admin.deleteUser(userId);
        } else {
          console.log(`Successfully assigned role ${userRole} to user ${userId}`);
          // Add to the correct list *after* successful role assignment
          if (userRole === 'employer') {
            createdUserIds.employers.push(userId);
          } else {
            createdUserIds.candidates.push(userId);
          }
        }
      } else {
        console.warn(`User creation for ${email} did not return expected data.`);
      }
    } catch (error) {
      console.error(`Unexpected error creating user ${email}:`, error);
    }
  }
  console.log(`--- Finished Seeding Users and Roles (${createdUserIds.employers.length} employers, ${createdUserIds.candidates.length} candidates created in this run) ---`);
}

async function seedCompanies() {
  console.log('--- Seeding Companies ---');
  const numCompanies = faker.number.int({ min: 5, max: 10 });

  if (createdUserIds.employers.length === 0) {
    console.error('Cannot seed companies: No employer users were successfully created and tracked in this run.');
    // Decide if this should throw an error or just return
    return; // Exit function if no employers available
  }

  console.log(`Attempting to create ${numCompanies} companies...`);
  const companiesToInsert = [];
  createdCompanyIds = []; // Reset company IDs for this run

  for (let i = 0; i < numCompanies; i++) {
    let companyName = faker.helpers.arrayElement(abaCompanyNames.filter(name => !companiesToInsert.some(c => c.name === name)));
    if (!companyName) {
        companyName = `${faker.company.name()} ABA Services`;
        let attempt = 0;
        while (companiesToInsert.some(c => c.name === companyName) && attempt < 10) {
            companyName = `${faker.company.name()} ABA Services ${attempt + 1}`;
            attempt++;
        }
    }

    const employerUserId = createdUserIds.employers[i % createdUserIds.employers.length];
    const baseSlug = companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const slug = `${baseSlug}-${faker.string.alphanumeric(4)}`;

    companiesToInsert.push({
      name: companyName,
      description: faker.lorem.paragraphs(2),
      website: faker.internet.url(),
      logo_url: '/images/resource/company-logo/company_logo_placeholder.png', // Use local default logo
      headquarters_location: `${faker.location.city()}, ${faker.location.state({ abbreviated: true })}`,
      industry: 'Healthcare / Applied Behavior Analysis',
      company_type: faker.helpers.arrayElement(['Clinic', 'School-Based Provider', 'In-Home Provider', 'Center']),
      size: faker.helpers.arrayElement(['1-10 employees', '11-50 employees', '51-200 employees']),
      founded_year: faker.number.int({ min: 1990, max: 2023 }),
      slug: slug,
      user_id: employerUserId,
      status: 'approved' // Use lowercase 'approved' as per plan
    });
  }

  const { data, error } = await supabase
    .from('companies')
    .insert(companiesToInsert)
    .select('id');

  if (error) {
    console.error('Error seeding companies:', error.message);
    throw error; // Stop seeding if companies fail
  } else {
    createdCompanyIds = data.map(c => c.id);
    console.log(`Successfully seeded ${createdCompanyIds.length} companies.`);
    console.log('--- Finished Seeding Companies ---');
  }
}

async function seedCandidatesAndProfiles() {
  console.log('--- Seeding Candidates and Profiles ---');

  if (createdUserIds.candidates.length === 0) {
    console.warn('Skipping candidate/profile seeding: No candidate users were successfully created and tracked in this run.');
    return;
  }
  if (createdLookupIds.levels.length === 0) {
      console.error('Cannot seed candidates: No experience levels were found/created.');
      throw new Error('Experience levels seeding failed or produced no results.');
  }

  console.log(`Attempting to update profiles and create candidate records for ${createdUserIds.candidates.length} users...`);
  let updatedProfilesCount = 0;
  let createdCandidatesCount = 0;
  createdProfileIds = []; // Reset profile IDs for this run
  createdCandidateIds = []; // Reset candidate IDs for this run


  for (const userId of createdUserIds.candidates) {
    try {
      // 1. UPDATE the Profile created by the trigger
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const profileSlug = `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${faker.string.alphanumeric(4)}`;
      const profileDataToUpdate = {
        // id: userId, // Match condition, not update field
        first_name: firstName,
        last_name: lastName,
        avatar_url: faker.image.avatar(),
        // role: 'candidate', // Role should already be set by trigger/user seed
        phone: faker.phone.number(),
        contact_email: faker.internet.email({ firstName, lastName, provider: 'seed-profile.test' }),
        slug: profileSlug,
      };

      const { data: updatedProfile, error: profileUpdateError } = await supabase
        .from('profiles')
        .update(profileDataToUpdate)
        .eq('id', userId) // Find the profile by user ID
        .select('id')
        .single(); // Expecting one row to be updated

      if (profileUpdateError) {
        console.error(`Error updating profile for user ${userId}:`, profileUpdateError.message);
        // If update fails, maybe the profile wasn't created by the trigger? Log and continue.
        continue;
      }
      if (!updatedProfile) {
          console.warn(`Profile update for user ${userId} did not return expected data (maybe profile didn't exist?).`);
          continue;
      }

      updatedProfilesCount++;
      const profileId = updatedProfile.id; // Should be same as userId
      createdProfileIds.push(profileId); // Track successfully updated/found profiles
      console.log(`Successfully updated profile for user ${userId}`);

      // Generate work history
      const workHistory = generateWorkHistory();

      // 2. Create Candidate Record (this should be an INSERT)
      const candidateData = {
        profile_id: profileId, // Link to the profile ID (userId)
        bio: faker.lorem.paragraph(),
        skills: faker.helpers.arrayElements(abaSkills, faker.number.int({ min: 3, max: 7 })),
        location: `${faker.location.city()}, ${faker.location.state({ abbreviated: true })}`,
        designation: faker.helpers.arrayElement(['RBT', 'BCBA Candidate', 'BCaBA', 'Behavior Therapist']),
        experience_level_id: faker.helpers.arrayElement(createdLookupIds.levels),
        work_history: workHistory, // Add generated work history
      };

      // Use upsert for candidate data in case a previous partial run created it
      const { data: upsertedCandidate, error: candidateError } = await supabase
        .from('candidates')
        .upsert(candidateData, { onConflict: 'profile_id' }) // Insert or update based on profile_id
        .select('profile_id');

      if (candidateError) {
        console.error(`Error upserting candidate record for profile ${profileId}:`, candidateError.message);
      } else {
        createdCandidatesCount++;
        createdCandidateIds.push(profileId); // Track successfully created/updated candidates
        console.log(`Successfully upserted candidate record for profile ${profileId}`);
      }

    } catch (error) {
      console.error(`Unexpected error processing candidate user ${userId}:`, error);
    }
  }
  console.log(`--- Finished Seeding Candidates and Profiles (${updatedProfilesCount} profiles updated, ${createdCandidatesCount} candidates upserted) ---`);
}

async function seedJobs() {
  console.log('--- Seeding Jobs ---');
  const numJobs = faker.number.int({ min: 10, max: 20 });

  // Check prerequisites
  if (createdCompanyIds.length === 0) throw new Error('Cannot seed jobs: No companies found.');
  if (createdUserIds.employers.length === 0) throw new Error('Cannot seed jobs: No employer users found.');
  if (createdLookupIds.categories.length === 0) throw new Error('Cannot seed jobs: No job categories found.');
  if (createdLookupIds.types.length === 0) throw new Error('Cannot seed jobs: No job types found.');
  if (createdLookupIds.levels.length === 0) throw new Error('Cannot seed jobs: No experience levels found.');
  // Certifications are optional, so no check needed

  console.log(`Attempting to create ${numJobs} jobs...`);
  const jobsToInsert = [];

  for (let i = 0; i < numJobs; i++) {
    const jobTitle = faker.helpers.arrayElement(abaJobTitles);
    const companyId = faker.helpers.arrayElement(createdCompanyIds);
    const employerUserId = faker.helpers.arrayElement(createdUserIds.employers);
    const categoryId = faker.helpers.arrayElement(createdLookupIds.categories);
    const jobTypeId = faker.helpers.arrayElement(createdLookupIds.types);
    const experienceLevelId = faker.helpers.arrayElement(createdLookupIds.levels);
    // Optionally require a certification sometimes
    const certificationId = faker.datatype.boolean(0.4) ? faker.helpers.arrayElement(createdLookupIds.certifications) : null;
    const baseSlug = jobTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const slug = `${baseSlug}-${faker.string.alphanumeric(6)}`;
    const salaryMin = faker.number.int({ min: 35000, max: 80000 });
    const salaryMax = salaryMin + faker.number.int({ min: 5000, max: 30000 });

    jobsToInsert.push({
      title: jobTitle,
      description: faker.lorem.paragraphs(3),
      location: `${faker.location.city()}, ${faker.location.state({ abbreviated: true })}`,
      company_id: companyId,
      posted_by_user_id: employerUserId,
      category_id: categoryId,
      job_type_id: jobTypeId,
      experience_level_id: experienceLevelId,
      certification_required: certificationId,
      skills: faker.helpers.arrayElements(abaSkills, faker.number.int({ min: 4, max: 8 })),
      salary_min: salaryMin,
      salary_max: salaryMax,
      salary_currency: 'USD',
      salary_unit: 'YEAR', // Ensure uppercase
      date_posted: faker.date.past({ years: 1 }),
      valid_through: faker.date.future({ years: 0.5 }),
      status: 'active', // Use 'active' status as per constraint check
      slug: slug,
      supervision_provided: faker.datatype.boolean(0.6),
      continuing_education_provided: faker.datatype.boolean(0.4),
      direct_apply: faker.datatype.boolean(0.7),
      experience_in_place_of_education: faker.datatype.boolean(0.2),
      responsibilities: Array.from({ length: faker.number.int({ min: 3, max: 5 }) }, () => faker.lorem.sentence()),
      requirements: Array.from({ length: faker.number.int({ min: 2, max: 4 }) }, () => faker.lorem.sentence()),
      // preferred_qualifications: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => faker.lorem.sentence()), // Optional
      // application_url: faker.internet.url(), // Optional
      // application_instructions: faker.lorem.paragraph(), // Optional
      // education_requirements: { level: 'Bachelors', field: 'Psychology or related' }, // Example JSONB
      // experience_requirements: { years: 2, field: 'Direct ABA Therapy' } // Example JSONB
    });
  }

  const { data, error } = await supabase
    .from('jobs')
    .insert(jobsToInsert)
    .select('id');

  if (error) {
    console.error('Error seeding jobs:', error.message);
    throw error;
  } else {
    console.log(`Successfully seeded ${data.length} jobs.`);
    console.log('--- Finished Seeding Jobs ---');
  }
}



// --- Main Seeding Orchestration ---
async function seedDatabase() {
  console.log('Starting database seeding process...');
  try {
    await clearTables(); // Call clearTables first

    await seedLookupTables();
    await seedUsers(); // Seed users first
    await seedCompanies(); // Then companies (needs employer user IDs)
    await seedCandidatesAndProfiles(); // Then candidates/profiles (needs candidate user IDs & lookup IDs)
    await seedJobs(); // Now seeding jobs

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
}

// --- Run the Seeding ---
seedDatabase();