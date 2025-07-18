// components/about/about.js

/**
 * ABOUT COMPONENT - JavaScript Functionality
 * Handles about section animations, interactions, and responsive behavior
 */

class AboutComponent {
  constructor() {
    this.isInitialized = false;
    this.animationObserver = null;
    this.aboutElement = null;
    this.highlightItems = null;
    this.skillCategories = null;
    this.valueItems = null;
    this.eventListeners = [];
    this.isVisible = false;
  }

  /**
   * Initialize the about component
   */
  init() {
    if (this.isInitialized) {
      console.warn('About component already initialized');
      return;
    }

    try {
      // Cache DOM elements
      this.cacheElements();
      
      // Setup scroll-based animations
      this.setupScrollAnimations();
      
      // Setup hover interactions
      this.setupHoverInteractions();
      
      // Setup responsive handlers
      this.setupResponsiveHandlers();
      
      // Setup accessibility features
      this.setupAccessibility();
      
      // Setup counter animations
      this.setupCounterAnimations();
      
      this.isInitialized = true;
      console.log('About component initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize about component:', error);
    }
  }

  /**
   * Cache frequently used DOM elements
   */
  cacheElements() {
    this.aboutElement = document.querySelector('.about-section');
    this.highlightItems = document.querySelectorAll('.highlight-item');
    this.skillCategories = document.querySelectorAll('.skill-category');
    this.valueItems = document.querySelectorAll('.value-item');
    this.valueNumbers = document.querySelectorAll('.value-number');
    this.skillItems = document.querySelectorAll('.skill-item');
    
    if (!this.aboutElement) {
      throw new Error('About section element not found');
    }
  }

  /**
   * Setup scroll-based animations using Intersection Observer
   */
  setupScrollAnimations() {
    if (!window.IntersectionObserver) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    this.animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          this.animateElement(element);
          this.animationObserver.unobserve(element);
        }
      });
    }, observerOptions);

    // Observe main sections
    const animatedElements = [
      ...this.highlightItems,
      ...this.skillCategories,
      ...this.valueItems,
      document.querySelector('.about-intro'),
      document.querySelector('.about-cta')
    ].filter(Boolean);

    animatedElements.forEach(element => {
      // Set initial state
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
      element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      
      this.animationObserver.observe(element);
    });
  }

  /**
   * Animate element when it becomes visible
   */
  animateElement(element) {
    const delay = this.getAnimationDelay(element);
    
    setTimeout(() => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
      
      // Trigger counter animation if it's a value item
      if (element.classList.contains('value-item')) {
        this.animateCounter(element);
      }
      
      // Add stagger effect for skill items
      if (element.classList.contains('skill-category')) {
        this.animateSkillItems(element);
      }
    }, delay);
  }

  /**
   * Get animation delay based on element position
   */
  getAnimationDelay(element) {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const elementCenter = rect.top + rect.height / 2;
    const viewportCenter = viewportHeight / 2;
    
    // Elements closer to viewport center animate first
    const distance = Math.abs(elementCenter - viewportCenter);
    const maxDelay = 200;
    const delay = Math.min(distance / 10, maxDelay);
    
    return delay;
  }

  /**
   * Animate counter numbers
   */
  animateCounter(valueItem) {
    const numberElement = valueItem.querySelector('.value-number');
    if (!numberElement) return;

    const targetText = numberElement.textContent;
    const targetNumber = parseInt(targetText);
    
    if (isNaN(targetNumber)) return;

    const duration = 2000;
    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.round(startValue + (targetNumber - startValue) * easeOutQuart);
      
      numberElement.textContent = currentValue + (targetText.includes('+') ? '+' : '') + 
                                 (targetText.includes('%') ? '%' : '');
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        numberElement.textContent = targetText;
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Animate skill items with stagger effect
   */
  animateSkillItems(skillCategory) {
    const skillItems = skillCategory.querySelectorAll('.skill-item');
    
    skillItems.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-20px)';
      item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
      }, index * 100);
    });
  }

  /**
   * Setup hover interactions
   */
  setupHoverInteractions() {
    // Highlight items hover effect
    this.highlightItems.forEach(item => {
      const hoverHandler = () => {
        this.highlightItem(item);
      };
      
      const leaveHandler = () => {
        this.unhighlightItem(item);
      };
      
      item.addEventListener('mouseenter', hoverHandler);
      item.addEventListener('mouseleave', leaveHandler);
      
      this.eventListeners.push(
        { element: item, event: 'mouseenter', handler: hoverHandler },
        { element: item, event: 'mouseleave', handler: leaveHandler }
      );
    });

    // Skill category interactions
    this.skillCategories.forEach(category => {
      const clickHandler = (e) => {
        this.toggleSkillCategory(category);
        e.preventDefault();
      };
      
      category.addEventListener('click', clickHandler);
      this.eventListeners.push(
        { element: category, event: 'click', handler: clickHandler }
      );
    });
  }

  /**
   * Highlight a specific item
   */
  highlightItem(item) {
    const category = item.dataset.category;
    if (!category) return;

    // Add highlight class
    item.classList.add('highlighted');
    
    // Dim other items
    this.highlightItems.forEach(otherItem => {
      if (otherItem !== item) {
        otherItem.classList.add('dimmed');
      }
    });
  }

  /**
   * Remove highlight from item
   */
  unhighlightItem(item) {
    item.classList.remove('highlighted');
    
    // Remove dimmed class from all items
    this.highlightItems.forEach(otherItem => {
      otherItem.classList.remove('dimmed');
    });
  }

  /**
   * Toggle skill category expanded state
   */
  toggleSkillCategory(category) {
    const isExpanded = category.classList.contains('expanded');
    
    // Collapse all categories first
    this.skillCategories.forEach(cat => {
      cat.classList.remove('expanded');
      cat.setAttribute('aria-expanded', 'false');
    });
    
    // Expand clicked category if it wasn't expanded
    if (!isExpanded) {
      category.classList.add('expanded');
      category.setAttribute('aria-expanded', 'true');
    }
  }

  /**
   * Setup responsive handlers
   */
  setupResponsiveHandlers() {
    const resizeHandler = this.debounce(() => {
      this.handleResize();
    }, 250);
    
    window.addEventListener('resize', resizeHandler);
    this.eventListeners.push(
      { element: window, event: 'resize', handler: resizeHandler }
    );
    
    // Initial resize handling
    this.handleResize();
  }

  /**
   * Handle window resize
   */
  handleResize() {
    const isMobile = window.innerWidth <= 768;
    
    // Adjust animations for mobile
    if (isMobile) {
      this.aboutElement.classList.add('mobile-view');
    } else {
      this.aboutElement.classList.remove('mobile-view');
    }
    
    // Recalculate any position-dependent animations
    this.recalculateAnimations();
  }

  /**
   * Recalculate animations on resize
   */
  recalculateAnimations() {
    if (!this.isVisible) return;
    
    // Reset any animation states that depend on viewport size
    this.valueNumbers.forEach(numberElement => {
      if (numberElement.hasAttribute('data-animated')) {
        // Re-trigger counter animation if needed
        const valueItem = numberElement.closest('.value-item');
        if (valueItem) {
          this.animateCounter(valueItem);
        }
      }
    });
  }

  /**
   * Setup accessibility features
   */
  setupAccessibility() {
    // Add keyboard navigation
    this.highlightItems.forEach(item => {
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      
      const keyHandler = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          this.highlightItem(item);
          setTimeout(() => this.unhighlightItem(item), 2000);
          e.preventDefault();
        }
      };
      
      item.addEventListener('keydown', keyHandler);
      this.eventListeners.push(
        { element: item, event: 'keydown', handler: keyHandler }
      );
    });

    // Add ARIA labels and descriptions
    this.skillCategories.forEach((category, index) => {
      category.setAttribute('aria-expanded', 'false');
      category.setAttribute('aria-controls', `skills-${index}`);
      
      const skillList = category.querySelector('.skill-list');
      if (skillList) {
        skillList.setAttribute('id', `skills-${index}`);
      }
    });

    // Add focus indicators
    const focusableElements = this.aboutElement.querySelectorAll('[tabindex="0"], .btn, a');
    
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
   * Setup counter animations
   */
  setupCounterAnimations() {
    // Mark value numbers for animation tracking
    this.valueNumbers.forEach(numberElement => {
      numberElement.setAttribute('data-animated', 'false');
    });
  }

  /**
   * Update about content dynamically
   */
  updateContent(content) {
    if (!content) return;

    const { intro, highlights, skills, values } = content;
    
    if (intro) {
      this.updateIntroSection(intro);
    }
    
    if (highlights) {
      this.updateHighlights(highlights);
    }
    
    if (skills) {
      this.updateSkills(skills);
    }
    
    if (values) {
      this.updateValues(values);
    }
  }

  /**
   * Update intro section
   */
  updateIntroSection(intro) {
    const paragraphs = this.aboutElement.querySelectorAll('.about-paragraph');
    
    intro.forEach((text, index) => {
      if (paragraphs[index]) {
        paragraphs[index].textContent = text;
      }
    });
  }

  /**
   * Update highlights section
   */
  updateHighlights(highlights) {
    highlights.forEach((highlight, index) => {
      const item = this.highlightItems[index];
      if (!item) return;
      
      const title = item.querySelector('.highlight-title');
      const description = item.querySelector('.highlight-description');
      
      if (title) title.textContent = highlight.title;
      if (description) description.textContent = highlight.description;
    });
  }

  /**
   * Show/hide about section
   */
  setVisibility(visible) {
    if (!this.aboutElement) return;
    
    this.isVisible = visible;
    this.aboutElement.style.display = visible ? 'block' : 'none';
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
    this.aboutElement = null;
    this.highlightItems = null;
    this.skillCategories = null;
    this.valueItems = null;
    this.isVisible = false;

    console.log('About component destroyed');
  }

  /**
   * Get component state for debugging
   */
  getState() {
    return {
      isInitialized: this.isInitialized,
      isVisible: this.isVisible,
      hasAboutElement: !!this.aboutElement,
      hasAnimationObserver: !!this.animationObserver,
      eventListenerCount: this.eventListeners.length,
      highlightItemsCount: this.highlightItems ? this.highlightItems.length : 0
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AboutComponent;
} else {
  window.AboutComponent = AboutComponent;
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.about-section')) {
      const about = new AboutComponent();
      about.init();
      
      // Make available globally for debugging
      window.aboutComponent = about;
    }
  });
} else {
  // DOM already loaded
  if (document.querySelector('.about-section')) {
    const about = new AboutComponent();
    about.init();
    window.aboutComponent = about;
  }
}