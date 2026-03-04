/**
 * Environment Detection Utility
 * 
 * Detects if the application is running in test environment
 * based on the hostname.
 */

export const isTestEnvironment = () => {
  return window.location.hostname === 'lwtest.lillco.de';
};

// Test environment color (complementary color to #76b332)
export const TEST_COLOR = '#6632b3';
export const PROD_COLOR = '#76b332';
