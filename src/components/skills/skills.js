// components/skills/skills.js

/**
 * SKILLS COMPONENT - JavaScript Functionality
 * Handles skills section animations, progress bars, and interactions
 */

class SkillsComponent {
  constructor() {
    this.isInitialized = false;
    this.skillsElement = null;
    this.skillsCategories = null;
    this.skillItems = null;
    this.skillProgressBars = null;
    this.summaryItems = null;
    this.eventListeners = [];
    this.animationObserver = null;
    this.isVisible = false;
    this.animationsTriggered = false;
    this.skillsData = {
      mobile: [
        { name: 'Flutter', percentage: 95 },
        { name: 'Dart', percentage: 95 },
        { name: 'JavaScript', percentage: 75 },
        { name: 'Python', percentage: 65 }
      ],
      backend: [
        { name: 'Firebase', percentage: 90 },
        { name: 'REST APIs', percentage: 85 },
        { name: 'SQLite', percentage: 80 },
        { name: 'Node.js', percentage: 70 }
      ],
      tools: [
        { name: 'Git & GitHub', percentage: 90 },
        { name: 'Figma', percentage: 80 },
        { name: 'App Store Deployment', percentage: 85 },
        { name: 'CI/CD', percentage: 75 }
      ]
    };
  }

  /**
   * Initialize the skills component
   */
  init() {
    if (this.isInitialized) {
      console.warn('Skills component already initialized');
      return;
    }

    try {
      // Cache DOM elements
      this.cacheElements();
      
      // Setup scroll animations
      this.setupScrollAnimations();
      
      // Setup hover interactions
      this.setupHoverInteractions();
      
      // Setup responsive handlers
      this.setupResponsiveHandlers();
      
      // Setup accessibility features
      this.setupAccessibility();
      
      // Calculate summary stats
      this.calculateSummaryStats();
      
      this.isInitialized = true;
      console.log('Skills component initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize skills component:', error);
    }
  }

  /**
   * Cache frequently used DOM elements
   */
  cacheElements() {
    this.skillsElement = document.querySelector('.skills-section');
    this.skillsCategories = document.querySelectorAll('.skills-category');
    this.skillItems = document.querySelectorAll('.skill-item');
    this.skillProgressBars = document.querySelectorAll('.skill-progress');
    this.summaryItems = document.querySelectorAll('.summary-item');
    
    if (!this.skillsElement) {
      throw new Error('Skills section element not found');
    }

    // Cache summary number elements
    this.summaryNumbers = {
      totalSkills: document.getElementById('totalSkills'),
      avgProficiency: document.getElementById('avgProficiency'),
      yearsExperience: document.getElementById('yearsExperience')
    };
  }

  /**
   * Setup scroll-based animations using Intersection Observer
   */
  setupScrollAnimations() {
    if (!window.IntersectionObserver) return;

    const observerOptions = {
      threshold: 0.3,
      rootMargin: '0px 0px -50px 0px'
    };

    this.animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animationsTriggered) {
          this.isVisible = true;
          this.animationsTriggered = true;
          this.triggerAnimations();
          // Don't unobserve - we might want to re-trigger on scroll
        }
      });
    }, observerOptions);

    // Observe the skills section
    this.animationObserver.observe(this.skillsElement);
  }

  /**
   * Trigger all animations
   */
  triggerAnimations() {
    // Animate categories
    this.animateCategories();
    
    // Animate progress bars
    setTimeout(() => {
      this.animateProgressBars();
    }, 300);
    
    // Animate summary
    setTimeout(() => {
      this.animateSummary();
    }, 800);
  }

  /**
   * Animate skill categories
   */
  animateCategories() {
    this.skillsCategories.forEach((category, index) => {
      category.style.opacity = '0';
      category.style.transform = 'translateY(30px)';
      category.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      
      setTimeout(() => {
        category.style.opacity = '1';
        category.style.transform = 'translateY(0)';
      }, index * 150);
    });
  }

  /**
   * Animate progress bars
   */
  animateProgressBars() {
    this.skillProgressBars.forEach((progressBar, index) => {
      const targetWidth = progressBar.getAttribute('data-progress');
      
      // Reset width
      progressBar.style.width = '0%';
      
      setTimeout(() => {
        progressBar.style.width = `${targetWidth}%`;
        
        // Add pulse effect for high-level skills
        if (parseInt(targetWidth) >= 85) {
          setTimeout(() => {
            this.addPulseEffect(progressBar);
          }, 1500);
        }
      }, index * 100);
    });
  }

  /**
   * Add pulse effect to progress bar
   */
  addPulseEffect(progressBar) {
    progressBar.style.animation = 'pulse 2s infinite';
    
    // Remove pulse after 4 seconds
    setTimeout(() => {
      progressBar.style.animation = '';
    }, 4000);
  }

  /**
   * Animate summary section
   */
  animateSummary() {
    // Animate total skills counter
    if (this.summaryNumbers.totalSkills) {
      this.animateCounter(this.summaryNumbers.totalSkills, 0, 12, 1500);
    }
    
    // Animate average proficiency
    if (this.summaryNumbers.avgProficiency) {
      this.animateCounter(this.summaryNumbers.avgProficiency, 0, 82, 2000, '%');
    }
    
    // Animate summary items
    this.summaryItems.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, index * 200);
    });
  }

  /**
   * Animate counter with easing
   */
  animateCounter(element, start, end, duration, suffix = '') {
    if (!element) return;
    
    const startTime = Date.now();
    const startValue = start;
    const endValue = end;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + (endValue - startValue) * easedProgress);
      
      element.textContent = currentValue + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = endValue + suffix;
        // Add completion effect
        element.style.animation = 'countUp 0.3s ease-out';
        setTimeout(() => {
          element.style.animation = '';
        }, 300);
      }
    };
    
    requestAnimationFrame(animate);
  }

  /**
   * Setup hover interactions
   */
  setupHoverInteractions() {
    // Category hover effects
    this.skillsCategories.forEach(category => {
      const hoverHandler = () => {
        this.highlightCategory(category);
      };
      
      const leaveHandler = () => {
        this.unhighlightCategory(category);
      };
      
      category.addEventListener('mouseenter', hoverHandler);
      category.addEventListener('mouseleave', leaveHandler);
      
      this.eventListeners.push(
        { element: category, event: 'mouseenter', handler: hoverHandler },
        { element: category, event: 'mouseleave', handler: leaveHandler }
      );
    });

    // Skill item hover effects
    this.skillItems.forEach(item => {
      const hoverHandler = () => {
        this.highlightSkill(item);
      };
      
      const leaveHandler = () => {
        this.unhighlightSkill(item);
      };
      
      item.addEventListener('mouseenter', hoverHandler);
      item.addEventListener('mouseleave', leaveHandler);
      
      this.eventListeners.push(
        { element: item, event: 'mouseenter', handler: hoverHandler },
        { element: item, event: 'mouseleave', handler: leaveHandler }
      );
    });

    // Summary item interactions
    this.summaryItems.forEach(item => {
      const clickHandler = () => {
        this.animateSummaryItem(item);
      };
      
      item.addEventListener('click', clickHandler);
      this.eventListeners.push(
        { element: item, event: 'click', handler: clickHandler }
      );
    });
  }

  /**
   * Highlight category
   */
  highlightCategory(category) {
    const icon = category.querySelector('.category-icon');
    const progressBars = category.querySelectorAll('.skill-progress');
    
    // Animate icon
    if (icon) {
      icon.style.transform = 'scale(1.2) rotate(5deg)';
    }
    
    // Pulse progress bars
    progressBars.forEach((bar, index) => {
      setTimeout(() => {
        bar.style.transform = 'scaleY(1.1)';
        bar.style.filter = 'brightness(1.1)';
      }, index * 50);
    });
  }

  /**
   * Unhighlight category
   */
  unhighlightCategory(category) {
    const icon = category.querySelector('.category-icon');
    const progressBars = category.querySelectorAll('.skill-progress');
    
    // Reset icon
    if (icon) {
      icon.style.transform = '';
    }
    
    // Reset progress bars
    progressBars.forEach(bar => {
      bar.style.transform = '';
      bar.style.filter = '';
    });
  }

  /**
   * Highlight individual skill
   */
  highlightSkill(item) {
    const progressBar = item.querySelector('.skill-progress');
    const percentage = item.querySelector('.skill-percentage');
    
    if (progressBar) {
      progressBar.style.transform = 'scaleX(1.02)';
      progressBar.style.filter = 'brightness(1.2)';
    }
    
    if (percentage) {
      percentage.style.transform = 'scale(1.1)';
      percentage.style.fontWeight = 'bold';
    }
  }

  /**
   * Unhighlight individual skill
   */
  unhighlightSkill(item) {
    const progressBar = item.querySelector('.skill-progress');
    const percentage = item.querySelector('.skill-percentage');
    
    if (progressBar) {
      progressBar.style.transform = '';
      progressBar.style.filter = '';
    }
    
    if (percentage) {
      percentage.style.transform = '';
      percentage.style.fontWeight = '';
    }
  }

  /**
   * Animate summary item on click
   */
  animateSummaryItem(item) {
    const number = item.querySelector('.summary-number');
    
    if (number) {
      number.style.transform = 'scale(1.2)';
      number.style.transition = 'transform 0.2s ease';
      
      setTimeout(() => {
        number.style.transform = 'scale(1)';
      }, 200);
    }
  }

  /**
   * Calculate summary statistics
   */
  calculateSummaryStats() {
    const allSkills = Object.values(this.skillsData).flat();
    const totalSkills = allSkills.length;
    const avgProficiency = Math.round(
      allSkills.reduce((sum, skill) => sum + skill.percentage, 0) / totalSkills
    );
    
    // Update summary data
    this.summaryData = {
      totalSkills,
      avgProficiency,
      yearsExperience: 4
    };
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
    
    if (isMobile) {
      this.skillsElement.classList.add('mobile-view');
      // Adjust animation delays for mobile
      this.adjustMobileAnimations();
    } else {
      this.skillsElement.classList.remove('mobile-view');
    }
  }

  /**
   * Adjust animations for mobile
   */
  adjustMobileAnimations() {
    // Reduce animation complexity on mobile
    if (window.innerWidth <= 480) {
      this.skillProgressBars.forEach(bar => {
        bar.style.transition = 'width 1s ease-out';
      });
    }
  }

  /**
   * Setup accessibility features
   */
  setupAccessibility() {
    // Add keyboard navigation for categories
    this.skillsCategories.forEach(category => {
      category.setAttribute('tabindex', '0');
      category.setAttribute('role', 'button');
      
      const keyHandler = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          this.highlightCategory(category);
          setTimeout(() => this.unhighlightCategory(category), 1000);
          e.preventDefault();
        }
      };
      
      category.addEventListener('keydown', keyHandler);
      this.eventListeners.push(
        { element: category, event: 'keydown', handler: keyHandler }
      );
    });

    // Add focus indicators
    const focusableElements = this.skillsElement.querySelectorAll('[tabindex], button');
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

    // Add screen reader announcements for progress bars
    this.skillProgressBars.forEach(progressBar => {
      const progress = progressBar.getAttribute('data-progress');
      progressBar.setAttribute('aria-label', `Skill level: ${progress}%`);
    });
  }

  /**
   * Update skills data
   */
  updateSkills(newSkillsData) {
    this.skillsData = { ...this.skillsData, ...newSkillsData };
    this.calculateSummaryStats();
    
    // Re-render if component is visible
    if (this.isVisible) {
      this.resetAnimations();
      setTimeout(() => {
        this.triggerAnimations();
      }, 100);
    }
  }

  /**
   * Reset animations
   */
  resetAnimations() {
    this.animationsTriggered = false;
    
    // Reset progress bars
    this.skillProgressBars.forEach(bar => {
      bar.style.width = '0%';
      bar.style.animation = '';
    });
    
    // Reset categories
    this.skillsCategories.forEach(category => {
      category.style.opacity = '0';
      category.style.transform = 'translateY(30px)';
    });
    
    // Reset summary
    this.summaryItems.forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
    });
  }

  /**
   * Get skills statistics
   */
  getSkillsStats() {
    const allSkills = Object.values(this.skillsData).flat();
    const categories = Object.keys(this.skillsData);
    
    return {
      totalSkills: allSkills.length,
      categories: categories.length,
      averageProficiency: Math.round(
        allSkills.reduce((sum, skill) => sum + skill.percentage, 0) / allSkills.length
      ),
      topSkills: allSkills
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 3)
        .map(skill => ({ name: skill.name, percentage: skill.percentage }))
    };
  }

  /**
   * Show/hide skills section
   */
  setVisibility(visible) {
    if (!this.skillsElement) return;
    
    this.isVisible = visible;
    this.skillsElement.style.display = visible ? 'block' : 'none';
    
    if (visible && !this.animationsTriggered) {
      // Trigger animations when made visible
      setTimeout(() => {
        this.triggerAnimations();
      }, 100);
    }
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
    this.skillsElement = null;
    this.skillsCategories = null;
    this.skillItems = null;
    this.skillProgressBars = null;
    this.summaryItems = null;
    this.isVisible = false;
    this.animationsTriggered = false;

    console.log('Skills component destroyed');
  }

  /**
   * Get component state for debugging
   */
  getState() {
    return {
      isInitialized: this.isInitialized,
      isVisible: this.isVisible,
      animationsTriggered: this.animationsTriggered,
      hasSkillsElement: !!this.skillsElement,
      hasAnimationObserver: !!this.animationObserver,
      eventListenerCount: this.eventListeners.length,
      skillsCount: this.skillProgressBars ? this.skillProgressBars.length : 0,
      summaryData: this.summaryData
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SkillsComponent;
} else {
  window.SkillsComponent = SkillsComponent;
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.skills-section')) {
      const skills = new SkillsComponent();
      skills.init();
      
      // Make available globally for debugging
      window.skillsComponent = skills;
    }
  });
} else {
  // DOM already loaded
  if (document.querySelector('.skills-section')) {
    const skills = new SkillsComponent();
    skills.init();
    window.skillsComponent = skills;
  }
}