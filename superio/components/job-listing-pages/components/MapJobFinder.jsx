'use client'
import GoogleMapReact from "google-map-react";
import { useState, useEffect } from 'react'; // Import hooks

// Basic marker component
const MarkerComponent = ({ text }) => <div style={{
    color: 'white',
    background: 'red',
    padding: '5px 10px',
    display: 'inline-flex',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '100%',
    transform: 'translate(-50%, -50%)'
}}>📍</div>; // Simple pin marker

// Renamed component and accept location prop
const MapJobFinder = ({ location }) => {
  // TODO: Implement Geocoding to get lat/lng from location string
  // This requires a Google Maps API key with Geocoding API enabled.
  // Store the key in .env.local as NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  // const [coords, setCoords] = useState(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  // const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // useEffect(() => {
  //   if (!location || !googleMapsApiKey) {
  //       setLoading(false);
  //       setError(!googleMapsApiKey ? "Google Maps API key not configured." : null);
  //       return; // Don't geocode if no location or key
  //   }

  //   const geocodeLocation = async () => {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //       const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${googleMapsApiKey}`);
  //       const data = await response.json();

  //       if (data.status === 'OK') {
  //         setCoords(data.results[0].geometry.location); // { lat: ..., lng: ... }
  //       } else {
  //         console.error('Geocoding failed:', data.status, data.error_message);
  //         setError(`Could not find coordinates for "${location}". Status: ${data.status}`);
  //         setCoords(null);
  //       }
  //     } catch (err) {
  //       console.error('Geocoding request failed:', err);
  //       setError('Failed to fetch coordinates.');
  //       setCoords(null);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   geocodeLocation();
  // }, [location, googleMapsApiKey]); // Re-run if location changes

  // --- Static Placeholder Implementation ---
  const defaultProps = {
    center: { lat: 40.7128, lng: -74.0060 }, // Default to New York City
    zoom: 11,
  };
  // --- End Static Placeholder ---


  // --- Conditional Rendering based on state (when dynamic) ---
  // if (loading) return <div>Loading map...</div>;
  // if (error) return <div className="text-danger">Map error: {error}</div>;
  // if (!coords && !loading) return <div>Map location not available.</div>

  return (
    // Important! Always set the container height explicitly
    <div style={{ height: '300px', width: '100%' }}>
      <GoogleMapReact
        // bootstrapURLKeys={{ key: googleMapsApiKey || "" }} // Pass API key here when ready
        bootstrapURLKeys={{ key: "" }} // Keep empty for now
        // Use fetched coords when available, otherwise default
        // center={coords || defaultProps.center}
        defaultCenter={defaultProps.center} // Keep default for now
        defaultZoom={defaultProps.zoom}
      >
        {/* Render marker at fetched coords when available */}
        {/* {coords && (
          <MarkerComponent
            lat={coords.lat}
            lng={coords.lng}
            text={location || "Job Location"}
          />
        )} */}
         {/* Static marker for now */}
         <MarkerComponent
            lat={defaultProps.center.lat}
            lng={defaultProps.center.lng}
            text={location || "Job Location"}
          />
      </GoogleMapReact>
    </div>
  );
}

export default MapJobFinder;
