// components/hero/hero.js

/**
 * HERO COMPONENT - JavaScript Functionality
 * Handles hero section animations, interactions, and responsive behavior
 */

class HeroComponent {
  constructor() {
    this.isInitialized = false;
    this.animationObserver = null;
    this.heroElement = null;
    this.heroText = null;
    this.heroImage = null;
    this.scrollIndicator = null;
    this.eventListeners = [];
  }

  /**
   * Initialize the hero component
   */
  init() {
    if (this.isInitialized) {
      console.warn('Hero component already initialized');
      return;
    }

    try {
      // Cache DOM elements
      this.cacheElements();
      
      // Setup animations
      this.setupAnimations();
      
      // Setup scroll indicator
      this.setupScrollIndicator();
      
      // Setup responsive handlers
      this.setupResponsiveHandlers();
      
      // Setup accessibility features
      this.setupAccessibility();
      
      this.isInitialized = true;
      console.log('Hero component initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize hero component:', error);
    }
  }

  /**
   * Cache frequently used DOM elements
   */
  cacheElements() {
    this.heroElement = document.querySelector('.hero-section');
    this.heroText = document.querySelector('.hero-text');
    this.heroImage = document.querySelector('.hero-image');
    this.scrollIndicator = document.querySelector('.scroll-indicator');
    
    if (!this.heroElement) {
      throw new Error('Hero section element not found');
    }
  }

  /**
   * Setup entrance animations
   */
  setupAnimations() {
    if (!this.heroText || !this.heroImage) return;

    // Initial state for animations
    if (window.innerWidth > 768) {
      this.heroText.style.cssText = 'opacity: 0; transform: translateX(-30px);';
      this.heroImage.style.cssText = 'opacity: 0; transform: translateX(30px);';
      
      // Trigger animations after a brief delay
      setTimeout(() => {
        this.heroText.style.cssText += 'transition: opacity 0.8s ease, transform 0.8s ease; opacity: 1; transform: translateX(0);';
        this.heroImage.style.cssText += 'transition: opacity 0.8s ease, transform 0.8s ease; opacity: 1; transform: translateX(0);';
      }, 300);
    }

    // Setup intersection observer for scroll-triggered animations
    this.setupIntersectionObserver();
  }

  /**
   * Setup intersection observer for scroll animations
   */
  setupIntersectionObserver() {
    if (!window.IntersectionObserver) return;

    this.animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.triggerEntryAnimation(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe hero elements
    const animatedElements = this.heroElement.querySelectorAll('.hero-description, .hero-actions');
    animatedElements.forEach(el => this.animationObserver.observe(el));
  }

  /**
   * Trigger entry animation for elements
   */
  triggerEntryAnimation(element) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    
    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }, 100);
    
    this.animationObserver.unobserve(element);
  }

  /**
   * Setup scroll indicator functionality
   */
  setupScrollIndicator() {
    if (!this.scrollIndicator) return;

    const handleScrollClick = (e) => {
      e.preventDefault();
      const targetId = this.scrollIndicator.getAttribute('href').substring(1);
      this.smoothScrollTo(targetId);
    };

    const handleScrollKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const targetId = this.scrollIndicator.getAttribute('href').substring(1);
        this.smoothScrollTo(targetId);
      }
    };

    this.scrollIndicator.addEventListener('click', handleScrollClick);
    this.scrollIndicator.addEventListener('keydown', handleScrollKey);
    
    // Store for cleanup
    this.eventListeners.push(
      { element: this.scrollIndicator, event: 'click', handler: handleScrollClick },
      { element: this.scrollIndicator, event: 'keydown', handler: handleScrollKey }
    );
  }

  /**
   * Smooth scroll to target element
   */
  smoothScrollTo(targetId) {
    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;

    const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 70;
    const targetPosition = targetElement.offsetTop - navbarHeight;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });

    // Update URL hash after scroll completes
    setTimeout(() => {
      history.pushState(null, null, `#${targetId}`);
    }, 500);
  }

  /**
   * Setup responsive behavior handlers
   */
  setupResponsiveHandlers() {
    const handleResize = () => {
      this.updateResponsiveLayout();
    };

    const debouncedResize = this.debounce(handleResize, 250);
    window.addEventListener('resize', debouncedResize);
    
    this.eventListeners.push(
      { element: window, event: 'resize', handler: debouncedResize }
    );

    // Initial responsive setup
    this.updateResponsiveLayout();
  }

  /**
   * Update layout based on screen size
   */
  updateResponsiveLayout() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      // Ensure animations work properly on mobile
      if (this.heroText) {
        this.heroText.style.transform = 'translateX(0)';
        this.heroText.style.opacity = '1';
      }
      if (this.heroImage) {
        this.heroImage.style.transform = 'translateX(0)';
        this.heroImage.style.opacity = '1';
      }
    }
  }

  /**
   * Setup accessibility features
   */
  setupAccessibility() {
    // Ensure proper focus management
    const focusableElements = this.heroElement.querySelectorAll('a, button, [tabindex]');
    
    focusableElements.forEach(element => {
      element.addEventListener('focus', () => {
        element.style.outline = '2px solid var(--color-black)';
        element.style.outlineOffset = '2px';
      });
      
      element.addEventListener('blur', () => {
        element.style.outline = '';
        element.style.outlineOffset = '';
      });
    });

    // Add keyboard navigation hints
    const heroActions = this.heroElement.querySelector('.hero-actions');
    if (heroActions) {
      heroActions.setAttribute('role', 'group');
      heroActions.setAttribute('aria-label', 'Main actions');
    }
  }

  /**
   * Update hero content dynamically
   */
  updateContent(content) {
    if (!content) return;

    const { greeting, name, subtitle, description, actions } = content;
    
    if (greeting) {
      const greetingEl = this.heroElement.querySelector('.hero-greeting');
      if (greetingEl) greetingEl.textContent = greeting;
    }
    
    if (name) {
      const nameEl = this.heroElement.querySelector('.hero-name');
      if (nameEl) nameEl.textContent = name;
    }
    
    if (subtitle) {
      const subtitleEl = this.heroElement.querySelector('.hero-subtitle');
      if (subtitleEl) subtitleEl.textContent = subtitle;
    }
    
    if (description) {
      const descEl = this.heroElement.querySelector('.hero-description');
      if (descEl) descEl.textContent = description;
    }
    
    if (actions && Array.isArray(actions)) {
      this.updateActions(actions);
    }
  }

  /**
   * Update hero action buttons
   */
  updateActions(actions) {
    const actionsContainer = this.heroElement.querySelector('.hero-actions');
    if (!actionsContainer) return;

    actionsContainer.innerHTML = actions.map(action => 
      `<a href="${action.href}" class="btn ${action.type || 'btn-primary'}">${action.text}</a>`
    ).join('');
  }

  /**
   * Show/hide hero section
   */
  setVisibility(visible) {
    if (!this.heroElement) return;
    
    this.heroElement.style.display = visible ? 'flex' : 'none';
  }

  /**
   * Utility function to debounce function calls
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
    if (this.animationObserver) {
      this.animationObserver.disconnect();
      this.animationObserver = null;
    }

    // Reset state
    this.isInitialized = false;
    this.heroElement = null;
    this.heroText = null;
    this.heroImage = null;
    this.scrollIndicator = null;

    console.log('Hero component destroyed');
  }

  /**
   * Get component state for debugging
   */
  getState() {
    return {
      isInitialized: this.isInitialized,
      hasHeroElement: !!this.heroElement,
      hasAnimationObserver: !!this.animationObserver,
      eventListenerCount: this.eventListeners.length
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HeroComponent;
} else {
  window.HeroComponent = HeroComponent;
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.hero-section')) {
      const hero = new HeroComponent();
      hero.init();
      
      // Make available globally for debugging
      window.heroComponent = hero;
    }
  });
} else {
  // DOM already loaded
  if (document.querySelector('.hero-section')) {
    const hero = new HeroComponent();
    hero.init();
    window.heroComponent = hero;
  }
}