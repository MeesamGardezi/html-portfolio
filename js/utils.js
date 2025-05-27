/**
 * UTILS.JS - Utility Functions
 * Portfolio Website - Black & White Minimalistic Theme
 */

/**
 * Utility namespace to avoid global pollution
 */
const Utils = {
  // Animation and timing utilities
  animation: {},
  
  // DOM utilities
  dom: {},
  
  // String utilities
  string: {},
  
  // Array utilities
  array: {},
  
  // Date utilities
  date: {},
  
  // Storage utilities
  storage: {},
  
  // Validation utilities
  validation: {},
  
  // Performance utilities
  performance: {}
};

/* ==========================================================================
   ANIMATION UTILITIES
   ========================================================================== */

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately
 * @returns {Function} Debounced function
 */
Utils.animation.debounce = function(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

/**
 * Throttle function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
Utils.animation.throttle = function(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Request animation frame with fallback
 * @param {Function} callback - Callback function
 * @returns {number} Request ID
 */
Utils.animation.requestFrame = function(callback) {
  return window.requestAnimationFrame || 
         window.webkitRequestAnimationFrame || 
         window.mozRequestAnimationFrame || 
         function(callback) { window.setTimeout(callback, 1000 / 60); };
}(callback);

/**
 * Cancel animation frame with fallback
 * @param {number} id - Request ID
 */
Utils.animation.cancelFrame = function(id) {
  const cancel = window.cancelAnimationFrame || 
                 window.webkitCancelAnimationFrame || 
                 window.mozCancelAnimationFrame || 
                 window.clearTimeout;
  cancel(id);
};

/**
 * Smooth scroll to element
 * @param {Element|string} target - Target element or selector
 * @param {number} offset - Offset from top (default: 0)
 * @param {number} duration - Animation duration (default: 500)
 */
Utils.animation.smoothScroll = function(target, offset = 0, duration = 500) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;
  
  const targetPosition = element.offsetTop - offset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;
  
  function ease(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }
  
  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = ease(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }
  
  requestAnimationFrame(animation);
};

/* ==========================================================================
   DOM UTILITIES
   ========================================================================== */

/**
 * Check if element is in viewport
 * @param {Element} element - Element to check
 * @param {number} threshold - Visibility threshold (0-1)
 * @returns {boolean} True if element is visible
 */
Utils.dom.isInViewport = function(element, threshold = 0) {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
  const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
  const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);
  
  if (threshold === 0) {
    return vertInView && horInView;
  }
  
  const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
  const visibleWidth = Math.min(rect.right, windowWidth) - Math.max(rect.left, 0);
  const visibleArea = visibleHeight * visibleWidth;
  const totalArea = rect.height * rect.width;
  
  return (visibleArea / totalArea) >= threshold;
};

/**
 * Add class with animation delay
 * @param {Element|NodeList} elements - Element(s) to animate
 * @param {string} className - Class name to add
 * @param {number} delay - Delay between elements (default: 100ms)
 */
Utils.dom.addClassWithDelay = function(elements, className, delay = 100) {
  const elementList = elements.length ? elements : [elements];
  elementList.forEach((element, index) => {
    setTimeout(() => {
      element.classList.add(className);
    }, index * delay);
  });
};

/**
 * Create element with attributes
 * @param {string} tag - HTML tag name
 * @param {Object} attributes - Element attributes
 * @param {string} content - Element content
 * @returns {Element} Created element
 */
Utils.dom.createElement = function(tag, attributes = {}, content = '') {
  const element = document.createElement(tag);
  
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else {
      element.setAttribute(key, value);
    }
  });
  
  if (content) {
    element.innerHTML = content;
  }
  
  return element;
};

/**
 * Remove element with fade animation
 * @param {Element} element - Element to remove
 * @param {number} duration - Animation duration (default: 300ms)
 */
Utils.dom.removeWithAnimation = function(element, duration = 300) {
  element.style.transition = `opacity ${duration}ms ease-out`;
  element.style.opacity = '0';
  
  setTimeout(() => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }, duration);
};

/* ==========================================================================
   STRING UTILITIES
   ========================================================================== */

/**
 * Capitalize first letter of string
 * @param {string} str - Input string
 * @returns {string} Capitalized string
 */
Utils.string.capitalize = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Convert string to kebab-case
 * @param {string} str - Input string
 * @returns {string} Kebab-case string
 */
Utils.string.toKebabCase = function(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
};

/**
 * Convert string to camelCase
 * @param {string} str - Input string
 * @returns {string} CamelCase string
 */
Utils.string.toCamelCase = function(str) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
    .replace(/^[A-Z]/, c => c.toLowerCase());
};

/**
 * Truncate string with ellipsis
 * @param {string} str - Input string
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated string
 */
Utils.string.truncate = function(str, length, suffix = '...') {
  if (str.length <= length) return str;
  return str.substring(0, length - suffix.length) + suffix;
};

/**
 * Escape HTML characters
 * @param {string} str - Input string
 * @returns {string} Escaped string
 */
Utils.string.escapeHtml = function(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

/* ==========================================================================
   ARRAY UTILITIES
   ========================================================================== */

/**
 * Remove duplicates from array
 * @param {Array} arr - Input array
 * @returns {Array} Array without duplicates
 */
Utils.array.unique = function(arr) {
  return [...new Set(arr)];
};

/**
 * Chunk array into smaller arrays
 * @param {Array} arr - Input array
 * @param {number} size - Chunk size
 * @returns {Array} Array of chunks
 */
Utils.array.chunk = function(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

/**
 * Shuffle array (Fisher-Yates algorithm)
 * @param {Array} arr - Input array
 * @returns {Array} Shuffled array
 */
Utils.array.shuffle = function(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Group array by property
 * @param {Array} arr - Input array
 * @param {string|Function} key - Property name or function
 * @returns {Object} Grouped object
 */
Utils.array.groupBy = function(arr, key) {
  return arr.reduce((groups, item) => {
    const group = typeof key === 'function' ? key(item) : item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

/* ==========================================================================
   DATE UTILITIES
   ========================================================================== */

/**
 * Format date to readable string
 * @param {Date|string} date - Input date
 * @param {string} format - Format string (default: 'MMM DD, YYYY')
 * @returns {string} Formatted date string
 */
Utils.date.format = function(date, format = 'MMM DD, YYYY') {
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const replacements = {
    'YYYY': d.getFullYear(),
    'YY': d.getFullYear().toString().slice(-2),
    'MMM': months[d.getMonth()],
    'MM': String(d.getMonth() + 1).padStart(2, '0'),
    'DD': String(d.getDate()).padStart(2, '0'),
    'D': d.getDate()
  };
  
  return format.replace(/YYYY|YY|MMM|MM|DD|D/g, match => replacements[match]);
};

/**
 * Get relative time string (e.g., "2 days ago")
 * @param {Date|string} date - Input date
 * @returns {string} Relative time string
 */
Utils.date.getRelativeTime = function(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

/* ==========================================================================
   STORAGE UTILITIES
   ========================================================================== */

/**
 * Set item in localStorage with error handling
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} Success status
 */
Utils.storage.set = function(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
    return false;
  }
};

/**
 * Get item from localStorage with error handling
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Retrieved value or default
 */
Utils.storage.get = function(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Failed to read from localStorage:', error);
    return defaultValue;
  }
};

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
Utils.storage.remove = function(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error);
    return false;
  }
};

/**
 * Clear all localStorage
 * @returns {boolean} Success status
 */
Utils.storage.clear = function() {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
    return false;
  }
};

/* ==========================================================================
   VALIDATION UTILITIES
   ========================================================================== */

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
Utils.validation.isEmail = function(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
Utils.validation.isUrl = function(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate phone number (basic)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone
 */
Utils.validation.isPhone = function(phone) {
  const pattern = /^[\+]?[1-9][\d]{0,15}$/;
  return pattern.test(phone.replace(/[\s\-\(\)]/g, ''));
};

/**
 * Check if string is empty or whitespace
 * @param {string} str - String to check
 * @returns {boolean} True if empty
 */
Utils.validation.isEmpty = function(str) {
  return !str || str.trim().length === 0;
};

/* ==========================================================================
   PERFORMANCE UTILITIES
   ========================================================================== */

/**
 * Measure function execution time
 * @param {Function} func - Function to measure
 * @param {Array} args - Function arguments
 * @returns {Object} Result and execution time
 */
Utils.performance.measure = function(func, ...args) {
  const start = performance.now();
  const result = func(...args);
  const end = performance.now();
  
  return {
    result,
    executionTime: end - start
  };
};

/**
 * Create performance observer for monitoring
 * @param {string} type - Performance entry type
 * @param {Function} callback - Callback function
 * @returns {PerformanceObserver|null} Observer instance
 */
Utils.performance.observe = function(type, callback) {
  if (!window.PerformanceObserver) return null;
  
  const observer = new PerformanceObserver(callback);
  observer.observe({ entryTypes: [type] });
  return observer;
};

/**
 * Log performance metrics
 */
Utils.performance.logMetrics = function() {
  if (!window.performance) return;
  
  const navigation = performance.getEntriesByType('navigation')[0];
  if (navigation) {
    console.group('Performance Metrics');
    console.log('DOM Content Loaded:', `${navigation.domContentLoadedEventEnd - navigation.navigationStart}ms`);
    console.log('Page Load Complete:', `${navigation.loadEventEnd - navigation.navigationStart}ms`);
    console.log('First Paint:', `${navigation.responseStart - navigation.navigationStart}ms`);
    console.groupEnd();
  }
};

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

/**
 * Initialize utilities when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
  // Log performance metrics in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    Utils.performance.logMetrics();
  }
});

// Export Utils for global access
window.Utils = Utils;