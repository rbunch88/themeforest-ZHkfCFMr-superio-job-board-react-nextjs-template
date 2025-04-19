// /components/loading/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = () => {
  // Basic inline styles for a simple spinner
  const styles = {
    border: '4px solid rgba(0, 0, 0, 0.1)',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    borderLeftColor: '#09f', // Or use a theme color
    animation: 'spin 1s linear infinite',
  };

  // Keyframes need to be global or handled differently in JS (e.g., styled-components)
  // For simplicity, we'll rely on browser defaults or expect a global CSS definition for @keyframes spin
  // If needed, add this to your global CSS:
  /*
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  */

  return <div style={styles}></div>;
};

export default LoadingSpinner;
