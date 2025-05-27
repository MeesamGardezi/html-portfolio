/**
 * ENV-CONFIG.JS - Environment Configuration (FIXED VERSION)
 * This file provides configuration without requiring environment variables
 * that cause the "Missing required environment variables" error
 */

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Environment configuration object with safe defaults
const ENV_CONFIG = {
  // Application Configuration
  APP_NAME: 'Flutter Developer Portfolio',
  APP_VERSION: '1.0.0',
  APP_URL: window.location.origin || 'https://yourportfolio.com',
  
  // Contact Configuration  
  CONTACT_EMAIL: 'your.email@example.com',
  CONTACT_PHONE: '+1 (234) 567-890',
  CONTACT_LOCATION: 'Your City, Country',
  
  // Personal Information
  DEVELOPER_NAME: 'Your Name',
  DEVELOPER_TITLE: 'Flutter Developer',
  DEVELOPER_BIO: 'Passionate Flutter developer creating beautiful mobile applications',
  
  // Social Media Links
  GITHUB_URL: 'https://github.com/yourusername',
  LINKEDIN_URL: 'https://linkedin.com/in/yourusername', 
  TWITTER_URL: 'https://twitter.com/yourusername',
  PORTFOLIO_URL: window.location.origin || 'https://yourportfolio.com',
  
  // Feature Flags
  ENABLE_ANALYTICS: true,
  ENABLE_CONTACT_FORM: true,
  ENABLE_ADMIN_PANEL: true,
  ENABLE_PWA: false,
  ENABLE_DARK_MODE: false,
  
  // Performance Settings
  MAX_IMAGE_SIZE: 5242880, // 5MB
  MAX_IMAGES_PER_PROJECT: 10,
  PAGINATION_SIZE: 6,
  
  // Security Settings
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_RATE_LIMIT_WINDOW: 300000, // 5 minutes
  CONTACT_RATE_LIMIT: 3,
  CONTACT_RATE_LIMIT_WINDOW: 3600000, // 1 hour
  
  // Development/Debug Settings
  NODE_ENV: 'production',
  DEBUG_MODE: false,
  LOG_LEVEL: 'info',
  SHOW_CONSOLE_LOGS: false,
  
  // CDN and Asset URLs
  CDN_URL: '',
  ASSETS_URL: './assets',
  IMAGES_URL: './assets/images',
  
  // Build Information
  BUILD_DATE: new Date().toISOString(),
  BUILD_VERSION: '1.0.0',
  GIT_COMMIT: 'unknown'
};

// Get configuration value with type conversion
const getConfig = (key, defaultValue = null) => {
  const value = ENV_CONFIG[key];
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  return value;
};

// Get boolean configuration
const getBooleanConfig = (key, defaultValue = false) => {
  const value = getConfig(key, defaultValue);
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return defaultValue;
};

// Get numeric configuration
const getNumericConfig = (key, defaultValue = 0) => {
  const value = getConfig(key, defaultValue);
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// REMOVED: validateEnvironment function that was causing the error
// The hardcoded Firebase config in firebase-config.js will be used instead

// Export to global scope if in browser
if (isBrowser) {
  window.ENV = ENV_CONFIG;
  window.getConfig = getConfig;
  window.getBooleanConfig = getBooleanConfig;
  window.getNumericConfig = getNumericConfig;
  
  // Development helper (only log if explicitly enabled)
  if (ENV_CONFIG.DEBUG_MODE && ENV_CONFIG.SHOW_CONSOLE_LOGS) {
    document.addEventListener('DOMContentLoaded', () => {
      console.group('🔧 Environment Configuration');
      console.log('Environment:', ENV_CONFIG.NODE_ENV);
      console.log('Debug Mode:', ENV_CONFIG.DEBUG_MODE);
      console.log('App Version:', ENV_CONFIG.APP_VERSION);
      console.log('Build Date:', ENV_CONFIG.BUILD_DATE);
      console.log('Features:', {
        Analytics: ENV_CONFIG.ENABLE_ANALYTICS,
        ContactForm: ENV_CONFIG.ENABLE_CONTACT_FORM,
        AdminPanel: ENV_CONFIG.ENABLE_ADMIN_PANEL,
        PWA: ENV_CONFIG.ENABLE_PWA,
        DarkMode: ENV_CONFIG.ENABLE_DARK_MODE
      });
      console.groupEnd();
    });
  }
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ENV_CONFIG,
    getConfig,
    getBooleanConfig,
    getNumericConfig
  };
}