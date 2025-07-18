// components/contact/contact.js

/**
 * CONTACT COMPONENT - JavaScript Functionality
 * Handles contact form validation, submission, and interactions
 */

class ContactComponent {
  constructor() {
    this.isInitialized = false;
    this.contactElement = null;
    this.contactForm = null;
    this.formFields = {};
    this.characterCounters = {};
    this.eventListeners = [];
    this.submitButton = null;
    this.isSubmitting = false;
    this.validationRules = {
      name: {
        required: true,
        minLength: 2,
        maxLength: 100,
        pattern: /^[a-zA-Z\s\-\.]+$/
      },
      email: {
        required: true,
        maxLength: 100,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      },
      subject: {
        required: true,
        minLength: 3,
        maxLength: 150
      },
      message: {
        required: true,
        minLength: 10,
        maxLength: 500
      }
    };
  }

  /**
   * Initialize the contact component
   */
  init() {
    if (this.isInitialized) {
      console.warn('Contact component already initialized');
      return;
    }

    try {
      // Cache DOM elements
      this.cacheElements();
      
      // Setup form validation
      this.setupFormValidation();
      
      // Setup character counters
      this.setupCharacterCounters();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Setup accessibility features
      this.setupAccessibility();
      
      // Setup scroll animations
      this.setupScrollAnimations();
      
      this.isInitialized = true;
      console.log('Contact component initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize contact component:', error);
    }
  }

  /**
   * Cache frequently used DOM elements
   */
  cacheElements() {
    this.contactElement = document.querySelector('.contact-section');
    this.contactForm = document.getElementById('contactForm');
    this.submitButton = document.getElementById('submitBtn');
    
    if (!this.contactElement || !this.contactForm) {
      throw new Error('Required contact elements not found');
    }

    // Cache form fields
    this.formFields = {
      name: document.getElementById('name'),
      email: document.getElementById('email'),
      subject: document.getElementById('subject'),
      message: document.getElementById('message')
    };

    // Cache character counters
    this.characterCounters = {
      name: document.getElementById('nameCounter'),
      email: document.getElementById('emailCounter'),
      subject: document.getElementById('subjectCounter'),
      message: document.getElementById('messageCounter')
    };

    // Cache error containers
    this.errorContainers = {
      name: document.getElementById('name-error'),
      email: document.getElementById('email-error'),
      subject: document.getElementById('subject-error'),
      message: document.getElementById('message-error')
    };
  }

  /**
   * Setup form validation
   */
  setupFormValidation() {
    // Add validation to each field
    Object.keys(this.formFields).forEach(fieldName => {
      const field = this.formFields[fieldName];
      if (!field) return;

      const validateHandler = () => {
        this.validateField(fieldName);
      };

      field.addEventListener('blur', validateHandler);
      field.addEventListener('input', this.debounce(validateHandler, 300));
      
      this.eventListeners.push(
        { element: field, event: 'blur', handler: validateHandler },
        { element: field, event: 'input', handler: this.debounce(validateHandler, 300) }
      );
    });
  }

  /**
   * Setup character counters
   */
  setupCharacterCounters() {
    Object.keys(this.formFields).forEach(fieldName => {
      const field = this.formFields[fieldName];
      const counter = this.characterCounters[fieldName];
      
      if (!field || !counter) return;

      const updateCounter = () => {
        this.updateCharacterCounter(fieldName);
      };

      field.addEventListener('input', updateCounter);
      this.eventListeners.push(
        { element: field, event: 'input', handler: updateCounter }
      );

      // Initial update
      updateCounter();
    });
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Form submission
    if (this.contactForm) {
      const submitHandler = (e) => {
        e.preventDefault();
        this.handleFormSubmission();
      };

      this.contactForm.addEventListener('submit', submitHandler);
      this.eventListeners.push(
        { element: this.contactForm, event: 'submit', handler: submitHandler }
      );
    }

    // Contact item hover effects
    const contactItems = this.contactElement.querySelectorAll('.contact-item');
    contactItems.forEach(item => {
      const hoverHandler = () => {
        this.animateContactItem(item);
      };

      item.addEventListener('mouseenter', hoverHandler);
      this.eventListeners.push(
        { element: item, event: 'mouseenter', handler: hoverHandler }
      );
    });

    // Window resize handler
    const resizeHandler = this.debounce(() => {
      this.handleResize();
    }, 250);

    window.addEventListener('resize', resizeHandler);
    this.eventListeners.push(
      { element: window, event: 'resize', handler: resizeHandler }
    );
  }

  /**
   * Validate individual field
   */
  validateField(fieldName) {
    const field = this.formFields[fieldName];
    const rules = this.validationRules[fieldName];
    const errorContainer = this.errorContainers[fieldName];
    
    if (!field || !rules) return true;

    const value = field.value.trim();
    const formGroup = field.closest('.form-group');
    let isValid = true;
    let errorMessage = '';

    // Required validation
    if (rules.required && !value) {
      isValid = false;
      errorMessage = `${this.capitalizeFirst(fieldName)} is required`;
    }
    // Length validation
    else if (rules.minLength && value.length < rules.minLength) {
      isValid = false;
      errorMessage = `${this.capitalizeFirst(fieldName)} must be at least ${rules.minLength} characters`;
    }
    else if (rules.maxLength && value.length > rules.maxLength) {
      isValid = false;
      errorMessage = `${this.capitalizeFirst(fieldName)} must not exceed ${rules.maxLength} characters`;
    }
    // Pattern validation
    else if (rules.pattern && value && !rules.pattern.test(value)) {
      isValid = false;
      if (fieldName === 'email') {
        errorMessage = 'Please enter a valid email address';
      } else if (fieldName === 'name') {
        errorMessage = 'Name can only contain letters, spaces, hyphens, and dots';
      } else {
        errorMessage = `${this.capitalizeFirst(fieldName)} format is invalid`;
      }
    }

    // Update UI
    if (isValid) {
      this.clearFieldError(fieldName);
      if (formGroup) {
        formGroup.classList.remove('error');
        formGroup.classList.add('success');
      }
    } else {
      this.showFieldError(fieldName, errorMessage);
      if (formGroup) {
        formGroup.classList.remove('success');
        formGroup.classList.add('error');
      }
    }

    return isValid;
  }

  /**
   * Show field error
   */
  showFieldError(fieldName, message) {
    const errorContainer = this.errorContainers[fieldName];
    const field = this.formFields[fieldName];
    
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.classList.add('show');
    }
    
    if (field) {
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', `${fieldName}-error`);
    }
  }

  /**
   * Clear field error
   */
  clearFieldError(fieldName) {
    const errorContainer = this.errorContainers[fieldName];
    const field = this.formFields[fieldName];
    
    if (errorContainer) {
      errorContainer.textContent = '';
      errorContainer.classList.remove('show');
    }
    
    if (field) {
      field.removeAttribute('aria-invalid');
    }
  }

  /**
   * Update character counter
   */
  updateCharacterCounter(fieldName) {
    const field = this.formFields[fieldName];
    const counter = this.characterCounters[fieldName];
    const rules = this.validationRules[fieldName];
    
    if (!field || !counter || !rules) return;

    const currentLength = field.value.length;
    const maxLength = rules.maxLength || 0;
    
    counter.textContent = `${currentLength}/${maxLength}`;
    
    // Update counter styling based on usage
    counter.classList.remove('warning', 'error');
    
    if (currentLength >= maxLength) {
      counter.classList.add('error');
    } else if (currentLength >= maxLength * 0.8) {
      counter.classList.add('warning');
    }
  }

  /**
   * Validate entire form
   */
  validateForm() {
    let isValid = true;
    
    Object.keys(this.formFields).forEach(fieldName => {
      const fieldValid = this.validateField(fieldName);
      if (!fieldValid) {
        isValid = false;
      }
    });
    
    return isValid;
  }

  /**
   * Handle form submission
   */
  async handleFormSubmission() {
    if (this.isSubmitting) return;
    
    // Validate form
    if (!this.validateForm()) {
      this.focusFirstError();
      return;
    }
    
    this.isSubmitting = true;
    this.setSubmitButtonState(true);
    
    try {
      // Collect form data
      const formData = this.collectFormData();
      
      // Submit form
      const result = await this.submitForm(formData);
      
      if (result.success) {
        this.showNotification('success', 'Message Sent!', 'Thank you for your message. I\'ll get back to you soon.');
        this.resetForm();
      } else {
        this.showNotification('error', 'Error', result.message || 'Failed to send message. Please try again.');
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
      this.showNotification('error', 'Error', 'Failed to send message. Please try again.');
    } finally {
      this.isSubmitting = false;
      this.setSubmitButtonState(false);
    }
  }

  /**
   * Collect form data
   */
  collectFormData() {
    const data = {};
    
    Object.keys(this.formFields).forEach(fieldName => {
      const field = this.formFields[fieldName];
      if (field) {
        data[fieldName] = field.value.trim();
      }
    });
    
    return data;
  }

  /**
   * Submit form data
   */
  async submitForm(formData) {
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real application, you would send the data to your server
    // For now, we'll simulate a successful submission
    return {
      success: true,
      message: 'Message sent successfully'
    };
  }

  /**
   * Set submit button state
   */
  setSubmitButtonState(isLoading) {
    if (!this.submitButton) return;
    
    const btnText = this.submitButton.querySelector('.btn-text');
    const btnLoading = this.submitButton.querySelector('.btn-loading');
    
    if (isLoading) {
      this.submitButton.disabled = true;
      if (btnText) btnText.style.display = 'none';
      if (btnLoading) btnLoading.style.display = 'flex';
    } else {
      this.submitButton.disabled = false;
      if (btnText) btnText.style.display = 'inline';
      if (btnLoading) btnLoading.style.display = 'none';
    }
  }

  /**
   * Reset form
   */
  resetForm() {
    if (this.contactForm) {
      this.contactForm.reset();
    }
    
    // Clear all errors and success states
    Object.keys(this.formFields).forEach(fieldName => {
      this.clearFieldError(fieldName);
      const formGroup = this.formFields[fieldName]?.closest('.form-group');
      if (formGroup) {
        formGroup.classList.remove('error', 'success');
      }
    });
    
    // Reset character counters
    Object.keys(this.characterCounters).forEach(fieldName => {
      this.updateCharacterCounter(fieldName);
    });
  }

  /**
   * Focus first error field
   */
  focusFirstError() {
    const firstErrorField = Object.keys(this.formFields).find(fieldName => {
      const formGroup = this.formFields[fieldName]?.closest('.form-group');
      return formGroup?.classList.contains('error');
    });
    
    if (firstErrorField && this.formFields[firstErrorField]) {
      this.formFields[firstErrorField].focus();
    }
  }

  /**
   * Show notification
   */
  showNotification(type, title, message) {
    const template = document.getElementById('notificationTemplate');
    if (!template) return;
    
    const notification = template.content.cloneNode(true);
    const notificationElement = notification.querySelector('.notification');
    
    // Set notification type
    notificationElement.classList.add(type);
    
    // Set content
    const titleElement = notification.querySelector('.notification-title');
    const messageElement = notification.querySelector('.notification-message');
    const iconElement = notification.querySelector('.notification-icon svg');
    
    if (titleElement) titleElement.textContent = title;
    if (messageElement) messageElement.textContent = message;
    
    // Set icon based on type
    if (iconElement) {
      if (type === 'success') {
        iconElement.innerHTML = '<polyline points="9,11 12,14 22,4"/>';
      } else if (type === 'error') {
        iconElement.innerHTML = '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>';
      }
    }
    
    // Add close handler
    const closeButton = notification.querySelector('.notification-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.hideNotification(notificationElement);
      });
    }
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
      notificationElement.classList.add('show');
    }, 100);
    
    // Auto-hide after 6 seconds
    setTimeout(() => {
      this.hideNotification(notificationElement);
    }, 6000);
  }

  /**
   * Hide notification
   */
  hideNotification(notificationElement) {
    if (!notificationElement) return;
    
    notificationElement.classList.remove('show');
    setTimeout(() => {
      if (notificationElement.parentNode) {
        notificationElement.parentNode.removeChild(notificationElement);
      }
    }, 300);
  }

  /**
   * Animate contact item
   */
  animateContactItem(item) {
    const icon = item.querySelector('.contact-icon');
    if (icon) {
      icon.style.transform = 'scale(1.1) rotate(5deg)';
      setTimeout(() => {
        icon.style.transform = '';
      }, 300);
    }
  }

  /**
   * Setup accessibility features
   */
  setupAccessibility() {
    // Add keyboard navigation for contact items
    const contactItems = this.contactElement.querySelectorAll('.contact-item');
    contactItems.forEach(item => {
      item.setAttribute('tabindex', '0');
      
      const keyHandler = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          this.animateContactItem(item);
          e.preventDefault();
        }
      };
      
      item.addEventListener('keydown', keyHandler);
      this.eventListeners.push(
        { element: item, event: 'keydown', handler: keyHandler }
      );
    });

    // Add focus indicators
    const focusableElements = this.contactElement.querySelectorAll('input, textarea, button, a, [tabindex]');
    focusableElements.forEach(element => {
      const focusHandler = () => {
        element.style.outline = '2px solid var(--color-black)';
        element.style.outlineOffset = '2px';
      };
      
      const blurHandler = () => {
        element.style.outline = '';
        element.style.outlineOffset = '';
      };
      
      element.addEventListener('focus', focusHandler);
      element.addEventListener('blur', blurHandler);
      
      this.eventListeners.push(
        { element: element, event: 'focus', handler: focusHandler },
        { element: element, event: 'blur', handler: blurHandler }
      );
    });
  }

  /**
   * Setup scroll animations
   */
  setupScrollAnimations() {
    if (!window.IntersectionObserver) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateElement(entry.target);
          this.intersectionObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe contact items
    const contactItems = this.contactElement.querySelectorAll('.contact-item');
    contactItems.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      item.style.animationDelay = `${index * 0.1}s`;
      
      this.intersectionObserver.observe(item);
    });
  }

  /**
   * Animate element when visible
   */
  animateElement(element) {
    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, 100);
  }

  /**
   * Handle window resize
   */
  handleResize() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      this.contactElement.classList.add('mobile-view');
    } else {
      this.contactElement.classList.remove('mobile-view');
    }
  }

  /**
   * Utility function to capitalize first letter
   */
  capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Debounce function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Cleanup component resources
   */
  destroy() {
    // Remove event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      if (element && typeof element.removeEventListener === 'function') {
        element.removeEventListener(event, handler);
      }
    });
    this.eventListeners = [];

    // Disconnect observers
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }

    // Reset state
    this.isInitialized = false;
    this.contactElement = null;
    this.contactForm = null;
    this.formFields = {};
    this.characterCounters = {};
    this.isSubmitting = false;

    console.log('Contact component destroyed');
  }

  /**
   * Get component state for debugging
   */
  getState() {
    return {
      isInitialized: this.isInitialized,
      isSubmitting: this.isSubmitting,
      hasContactElement: !!this.contactElement,
      hasContactForm: !!this.contactForm,
      formFieldsCount: Object.keys(this.formFields).length,
      eventListenerCount: this.eventListeners.length
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContactComponent;
} else {
  window.ContactComponent = ContactComponent;
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.contact-section')) {
      const contact = new ContactComponent();
      contact.init();
      
      // Make available globally for debugging
      window.contactComponent = contact;
    }
  });
} else {
  // DOM already loaded
  if (document.querySelector('.contact-section')) {
    const contact = new ContactComponent();
    contact.init();
    window.contactComponent = contact;
  }
}