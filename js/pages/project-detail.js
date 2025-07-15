/**
 * PROJECT-DETAIL.JS - Project Detail Page Functionality
 * Portfolio Website - Black & White Minimalistic Theme
 * Features: Gallery, lightbox, sharing, related projects
 * Fixed: All race conditions, memory leaks, and mobile image sizing
 */

// Project detail page state
const ProjectDetail = {
  currentProject: null,
  currentImageIndex: 0,
  images: [],
  isLoading: false,
  allProjects: [],
  relatedProjects: [],
  eventListeners: new Map(), // Track listeners for cleanup
  domElements: null, // Cached DOM elements
  isInitialized: false
};

// Configuration
const CONFIG = {
  mobileAspectThreshold: 0.8, // Images with aspect ratio < 0.8 are considered mobile
  maxRelatedProjects: 3,
  lightboxFocusTrap: null
};

/**
 * Initialize project detail page when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing project detail page...');
  
  // Prevent multiple initializations
  if (ProjectDetail.isInitialized) {
    console.warn('Project detail already initialized');
    return;
  }
  
  // Cache DOM elements first
  cacheDOMElements();
  
  // Check if Firebase is already ready
  if (window.FirebaseService && window.FirebaseService.isInitialized()) {
    console.log('Firebase already initialized, starting project detail...');
    initializeProjectDetail();
  } else {
    console.log('Firebase not ready, waiting for initialization...');
    waitForFirebase();
  }
});

/**
 * Cache frequently used DOM elements
 */
function cacheDOMElements() {
  ProjectDetail.domElements = {
    // Main elements
    loadingScreen: document.getElementById('loading-screen'),
    errorScreen: document.getElementById('project-error'),
    errorMessage: document.getElementById('error-message'),
    notificationContainer: document.getElementById('notification-container'),
    
    // Project info
    projectTitle: document.getElementById('project-title'),
    projectSubtitle: document.getElementById('project-subtitle'),
    projectCategory: document.getElementById('project-category'),
    projectStatus: document.getElementById('project-status'),
    projectDate: document.getElementById('project-date'),
    projectTechnologies: document.getElementById('project-technologies'),
    projectLinks: document.getElementById('project-links'),
    
    // Gallery
    projectGallery: document.getElementById('project-gallery'),
    mainImage: document.getElementById('main-image'),
    prevBtn: document.getElementById('prev-btn'),
    nextBtn: document.getElementById('next-btn'),
    imageCounter: document.getElementById('image-counter'),
    galleryThumbnails: document.getElementById('gallery-thumbnails'),
    
    // Content
    projectOverview: document.getElementById('project-overview'),
    featuresList: document.getElementById('features-list'),
    featuresBlock: document.getElementById('features-block'),
    developmentJourney: document.getElementById('development-journey'),
    journeyBlock: document.getElementById('journey-block'),
    challengesList: document.getElementById('challenges-list'),
    challengesBlock: document.getElementById('challenges-block'),
    
    // Sidebar
    devTime: document.getElementById('dev-time'),
    platform: document.getElementById('platform'),
    teamSize: document.getElementById('team-size'),
    downloads: document.getElementById('downloads'),
    viewCount: document.getElementById('view-count'),
    techDetails: document.getElementById('tech-details'),
    
    // Share buttons
    twitterShare: document.getElementById('twitter-share'),
    linkedinShare: document.getElementById('linkedin-share'),
    copyLink: document.getElementById('copy-link'),
    
    // Lightbox
    lightboxModal: document.getElementById('lightbox-modal'),
    lightboxImage: document.getElementById('lightbox-image'),
    lightboxTitle: document.getElementById('lightbox-title'),
    lightboxDescription: document.getElementById('lightbox-description'),
    lightboxClose: document.getElementById('lightbox-close'),
    lightboxPrev: document.getElementById('lightbox-prev'),
    lightboxNext: document.getElementById('lightbox-next'),
    focusTrapStart: document.querySelector('.focus-trap-start'),
    focusTrapEnd: document.querySelector('.focus-trap-end'),
    
    // Related projects
    relatedProjects: document.getElementById('related-projects'),
    relatedGrid: document.querySelector('.related-grid')
  };
  
  console.log('DOM elements cached successfully');
}

/**
 * Wait for Firebase to be ready with timeout and cleanup
 */
function waitForFirebase() {
  let timeoutId;
  let intervalId;
  
  // Firebase ready event listener
  const firebaseReadyHandler = function(event) {
    console.log('Firebase ready event received, initializing project detail...');
    cleanup();
    initializeProjectDetail();
  };
  
  const cleanup = () => {
    clearTimeout(timeoutId);
    clearInterval(intervalId);
    window.removeEventListener('firebaseReady', firebaseReadyHandler);
  };
  
  // Listen for Firebase ready event
  window.addEventListener('firebaseReady', firebaseReadyHandler);
  
  // Also check periodically in case event was missed
  intervalId = setInterval(() => {
    if (window.FirebaseService && window.FirebaseService.isInitialized()) {
      console.log('Firebase ready (periodic check), initializing project detail...');
      cleanup();
      initializeProjectDetail();
    }
  }, 500);
  
  // Stop checking after 10 seconds
  timeoutId = setTimeout(() => {
    cleanup();
    console.warn('Firebase initialization timeout, initializing without Firebase');
    initializeProjectDetail();
  }, 10000);
}

/**
 * Initialize project detail page
 */
function initializeProjectDetail() {
  if (ProjectDetail.isInitialized) {
    console.warn('Project detail already initialized');
    return;
  }
  
  console.log('Initializing project detail page...');
  
  // Get project ID from URL
  const projectId = getProjectIdFromUrl();
  
  if (!projectId) {
    console.error('No project ID found in URL');
    showProjectError('No project specified in URL');
    return;
  }
  
  console.log('Loading project with ID:', projectId);
  
  // Mark as initialized
  ProjectDetail.isInitialized = true;
  
  // Initialize all functionality
  initializeGallery();
  initializeLightbox();
  initializeSharing();
  initializeKeyboardNavigation();
  
  // Load project details
  loadProjectDetail(projectId);
  
  console.log('Project detail page initialization complete');
}

/**
 * Get project ID from URL parameters
 */
function getProjectIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id') || urlParams.get('project') || window.location.hash.substring(1);
}

/**
 * Load project details from Firebase
 */
async function loadProjectDetail(projectId) {
  if (ProjectDetail.isLoading) return;
  
  try {
    ProjectDetail.isLoading = true;
    showLoadingScreen();
    
    // Check if Firebase services are available
    if (!window.FirebaseService || !window.FirebaseService.isInitialized()) {
      throw new Error('Firebase not available');
    }
    
    if (!window.FirebaseService.isServiceAvailable('firestore')) {
      throw new Error('Firestore service not available');
    }
    
    console.log('Loading project from Firestore...');
    
    // Load the specific project
    const project = await window.FirebaseService.getProject(projectId);
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    console.log('Project loaded successfully:', project.title);
    
    // Store project data
    ProjectDetail.currentProject = project;
    ProjectDetail.images = Array.isArray(project.images) ? project.images : [];
    ProjectDetail.currentImageIndex = 0;
    
    // Populate project details
    populateProjectDetail(project);
    
    // Load related projects
    loadRelatedProjects(project);
    
    // Track project view
    trackProjectView(projectId);
    
    hideLoadingScreen();
    
  } catch (error) {
    console.error('Error loading project:', error);
    hideLoadingScreen();
    
    let errorMessage = 'Failed to load project details. Please try again later.';
    
    if (error.message === 'Project not found') {
      errorMessage = 'The project you\'re looking for doesn\'t exist or has been removed.';
    } else if (error.message.includes('Firebase')) {
      errorMessage = 'Unable to connect to the database. Please try again later.';
    }
    
    showProjectError(errorMessage);
  } finally {
    ProjectDetail.isLoading = false;
  }
}

/**
 * Populate project detail page with data
 */
function populateProjectDetail(project) {
  console.log('Populating project details...');
  
  const { domElements } = ProjectDetail;
  
  // Update page title and meta
  const pageTitle = `${project.title} - Flutter Developer Portfolio`;
  document.title = pageTitle;
  const pageTitleElement = document.getElementById('page-title');
  if (pageTitleElement) {
    pageTitleElement.textContent = pageTitle;
  }
  
  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription && project.description) {
    metaDescription.setAttribute('content', `${project.title} - ${project.description}`);
  }
  
  // Basic project information
  if (domElements.projectTitle) {
    domElements.projectTitle.textContent = project.title || 'Untitled Project';
  }
  if (domElements.projectSubtitle) {
    domElements.projectSubtitle.textContent = project.description || 'No description available';
  }
  if (domElements.projectCategory) {
    domElements.projectCategory.textContent = project.category || 'Uncategorized';
  }
  if (domElements.projectStatus) {
    const status = project.status || 'published';
    domElements.projectStatus.textContent = formatStatus(status);
    domElements.projectStatus.className = `meta-value project-status ${status.replace(/[-\s]/g, '').toLowerCase()}`;
  }
  if (domElements.projectDate) {
    domElements.projectDate.textContent = formatDate(project.createdAt);
  }
  
  // Technologies
  populateTechnologies(project.technologies || []);
  
  // Project links
  populateProjectLinks(project.links || {});
  
  // Gallery
  setupGallery(project.images || []);
  
  // Content sections
  populateProjectContent(project);
  
  // Sidebar stats
  populateProjectStats(project);
  
  // Technical details
  populateTechnicalDetails(project);
  
  console.log('Project details populated successfully');
}

/**
 * Populate technologies section
 */
function populateTechnologies(technologies) {
  const { domElements } = ProjectDetail;
  
  if (!domElements.projectTechnologies) return;
  
  if (technologies.length === 0) {
    domElements.projectTechnologies.innerHTML = '<span class="tech-tag" role="listitem">No technologies specified</span>';
    return;
  }
  
  domElements.projectTechnologies.innerHTML = technologies.map(tech => 
    `<span class="tech-tag" role="listitem">${escapeHtml(tech)}</span>`
  ).join('');
}

/**
 * Populate project links
 */
function populateProjectLinks(links) {
  const { domElements } = ProjectDetail;
  
  if (!domElements.projectLinks) return;
  
  const linkButtons = [];
  
  if (links.github) {
    linkButtons.push(`
      <a href="${escapeHtml(links.github)}" target="_blank" rel="noopener" class="project-btn github-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
        GitHub
      </a>
    `);
  }
  
  if (links.demo) {
    linkButtons.push(`
      <a href="${escapeHtml(links.demo)}" target="_blank" rel="noopener" class="project-btn demo-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15,3 21,3 21,9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
        Live Demo
      </a>
    `);
  }
  
  if (links.playStore) {
    linkButtons.push(`
      <a href="${escapeHtml(links.playStore)}" target="_blank" rel="noopener" class="project-btn store-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.86 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
        </svg>
        Play Store
      </a>
    `);
  }
  
  if (links.appStore) {
    linkButtons.push(`
      <a href="${escapeHtml(links.appStore)}" target="_blank" rel="noopener" class="project-btn store-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"/>
        </svg>
        App Store
      </a>
    `);
  }
  
  if (linkButtons.length === 0) {
    domElements.projectLinks.innerHTML = '<p style="color: #666; font-style: italic;">No external links available</p>';
  } else {
    domElements.projectLinks.innerHTML = linkButtons.join('');
  }
}

/**
 * Setup image gallery with mobile image detection
 */
function setupGallery(images) {
  const { domElements } = ProjectDetail;
  
  if (!domElements.projectGallery || !domElements.mainImage) return;
  
  if (images.length === 0) {
    // Show placeholder
    domElements.projectGallery.innerHTML = `
      <div class="gallery-main">
        <div class="gallery-placeholder" style="aspect-ratio: 16/10; background: #f3f4f6; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
          <p style="color: #666;">No images available</p>
        </div>
      </div>
    `;
    return;
  }
  
  ProjectDetail.images = images;
  ProjectDetail.currentImageIndex = 0;
  
  // Set main image with loading and error handling
  setupMainImage(images[0], 0);
  
  // Setup thumbnails
  setupThumbnails(images);
  
  // Update UI
  updateImageCounter();
  updateGalleryButtons();
}

/**
 * Setup main image with mobile detection and proper sizing
 */
function setupMainImage(imageUrl, index) {
  const { domElements } = ProjectDetail;
  
  if (!domElements.mainImage || !imageUrl) return;
  
  // Clear previous classes
  domElements.mainImage.className = 'main-image';
  
  // Create new image to detect dimensions
  const img = new Image();
  
  img.onload = function() {
    const aspectRatio = this.naturalWidth / this.naturalHeight;
    const isMobileImage = aspectRatio < CONFIG.mobileAspectThreshold;
    
    console.log(`Image ${index + 1}: ${this.naturalWidth}x${this.naturalHeight}, aspect: ${aspectRatio.toFixed(2)}, mobile: ${isMobileImage}`);
    
    // Apply appropriate sizing
    if (isMobileImage) {
      domElements.mainImage.classList.add('mobile-image');
      domElements.mainImage.style.objectFit = 'contain';
    } else {
      domElements.mainImage.classList.add('desktop-image');
      domElements.mainImage.style.objectFit = 'cover';
    }
    
    // Set the image
    domElements.mainImage.src = imageUrl;
    domElements.mainImage.alt = `${ProjectDetail.currentProject?.title || 'Project'} - Screenshot ${index + 1}`;
  };
  
  img.onerror = function() {
    console.error(`Failed to load image: ${imageUrl}`);
    domElements.mainImage.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23666">Failed to load image</text></svg>';
    domElements.mainImage.alt = 'Failed to load image';
  };
  
  // Start loading
  img.src = imageUrl;
}

/**
 * Setup gallery thumbnails
 */
function setupThumbnails(images) {
  const { domElements } = ProjectDetail;
  
  if (!domElements.galleryThumbnails) return;
  
  if (images.length <= 1) {
    domElements.galleryThumbnails.style.display = 'none';
    return;
  }
  
  domElements.galleryThumbnails.style.display = 'flex';
  domElements.galleryThumbnails.innerHTML = images.map((image, index) => 
    `<img src="${escapeHtml(image)}" 
         alt="Screenshot ${index + 1}" 
         class="thumbnail ${index === 0 ? 'active' : ''}" 
         data-index="${index}"
         tabindex="0"
         role="button"
         aria-label="View screenshot ${index + 1}">`
  ).join('');
  
  // Add click and keyboard handlers to thumbnails
  const thumbnails = domElements.galleryThumbnails.querySelectorAll('.thumbnail');
  thumbnails.forEach((thumbnail, index) => {
    const clickHandler = () => changeImage(index);
    const keyHandler = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        changeImage(index);
      }
    };
    
    thumbnail.addEventListener('click', clickHandler);
    thumbnail.addEventListener('keydown', keyHandler);
    
    // Store handlers for cleanup
    ProjectDetail.eventListeners.set(`thumbnail-${index}`, [
      { element: thumbnail, event: 'click', handler: clickHandler },
      { element: thumbnail, event: 'keydown', handler: keyHandler }
    ]);
  });
}

/**
 * Populate project content sections
 */
function populateProjectContent(project) {
  const { domElements } = ProjectDetail;
  
  // Overview
  const overview = project.longDescription || project.description || 'No detailed description available for this project.';
  if (domElements.projectOverview) {
    domElements.projectOverview.innerHTML = formatText(overview);
  }
  
  // Features
  populateFeatures(project.features || []);
  
  // Development journey
  populateDevelopmentJourney(project.developmentJourney || '');
  
  // Challenges
  populateChallenges(project.challenges || []);
}

/**
 * Populate features section
 */
function populateFeatures(features) {
  const { domElements } = ProjectDetail;
  
  if (!domElements.featuresList || !domElements.featuresBlock) return;
  
  if (features.length === 0) {
    domElements.featuresBlock.style.display = 'none';
    return;
  }
  
  domElements.featuresList.innerHTML = features.map(feature => 
    `<li class="feature-item" role="listitem">${escapeHtml(feature)}</li>`
  ).join('');
  
  domElements.featuresBlock.style.display = 'block';
}

/**
 * Populate development journey section
 */
function populateDevelopmentJourney(journey) {
  const { domElements } = ProjectDetail;
  
  if (!domElements.developmentJourney || !domElements.journeyBlock) return;
  
  if (!journey) {
    domElements.journeyBlock.style.display = 'none';
    return;
  }
  
  domElements.developmentJourney.innerHTML = formatText(journey);
  domElements.journeyBlock.style.display = 'block';
}

/**
 * Populate challenges section
 */
function populateChallenges(challenges) {
  const { domElements } = ProjectDetail;
  
  if (!domElements.challengesList || !domElements.challengesBlock) return;
  
  if (challenges.length === 0) {
    domElements.challengesBlock.style.display = 'none';
    return;
  }
  
  domElements.challengesList.innerHTML = challenges.map(challenge => {
    const title = typeof challenge === 'object' ? challenge.title : 'Challenge';
    const description = typeof challenge === 'object' ? challenge.description : challenge;
    
    return `
      <div class="challenge-item">
        <h4 class="challenge-title">${escapeHtml(title)}</h4>
        <p class="challenge-description">${escapeHtml(description)}</p>
      </div>
    `;
  }).join('');
  
  domElements.challengesBlock.style.display = 'block';
}

/**
 * Populate project statistics
 */
function populateProjectStats(project) {
  const { domElements } = ProjectDetail;
  
  if (domElements.devTime) {
    domElements.devTime.textContent = project.devTime || project.developmentTime || '-';
  }
  if (domElements.platform) {
    domElements.platform.textContent = project.platform || 'Not specified';
  }
  if (domElements.teamSize) {
    domElements.teamSize.textContent = project.teamSize || '1 developer';
  }
  if (domElements.downloads) {
    domElements.downloads.textContent = formatNumber(project.downloads) || '-';
  }
  if (domElements.viewCount) {
    domElements.viewCount.textContent = formatNumber(project.viewCount) || '-';
  }
}

/**
 * Populate technical details
 */
function populateTechnicalDetails(project) {
  const { domElements } = ProjectDetail;
  
  if (!domElements.techDetails) return;
  
  const details = [];
  
  if (project.technologies && project.technologies.length > 0) {
    details.push(...project.technologies.map(tech => 
      `<div class="tech-detail-item" role="listitem">${escapeHtml(tech)}</div>`
    ));
  }
  
  if (project.database) {
    details.push(`<div class="tech-detail-item" role="listitem">Database: ${escapeHtml(project.database)}</div>`);
  }
  
  if (project.architecture) {
    details.push(`<div class="tech-detail-item" role="listitem">Architecture: ${escapeHtml(project.architecture)}</div>`);
  }
  
  if (details.length === 0) {
    domElements.techDetails.innerHTML = '<p style="color: #666; font-style: italic;">No technical details available</p>';
  } else {
    domElements.techDetails.innerHTML = details.join('');
  }
}

/* ==========================================================================
   GALLERY FUNCTIONALITY
   ========================================================================== */

/**
 * Initialize gallery functionality with proper event handling
 */
function initializeGallery() {
  const { domElements } = ProjectDetail;
  
  if (!domElements.prevBtn || !domElements.nextBtn || !domElements.mainImage) return;
  
  // Gallery navigation handlers
  const prevHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    previousImage();
  };
  
  const nextHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    nextImage();
  };
  
  const imageClickHandler = (e) => {
    e.preventDefault();
    openLightbox(ProjectDetail.currentImageIndex);
  };
  
  const imageKeyHandler = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(ProjectDetail.currentImageIndex);
    }
  };
  
  // Add event listeners
  domElements.prevBtn.addEventListener('click', prevHandler);
  domElements.nextBtn.addEventListener('click', nextHandler);
  domElements.mainImage.addEventListener('click', imageClickHandler);
  domElements.mainImage.addEventListener('keydown', imageKeyHandler);
  
  // Store for cleanup
  ProjectDetail.eventListeners.set('gallery', [
    { element: domElements.prevBtn, event: 'click', handler: prevHandler },
    { element: domElements.nextBtn, event: 'click', handler: nextHandler },
    { element: domElements.mainImage, event: 'click', handler: imageClickHandler },
    { element: domElements.mainImage, event: 'keydown', handler: imageKeyHandler }
  ]);
  
  console.log('Gallery functionality initialized');
}

/**
 * Change to specific image with bounds checking
 */
function changeImage(index) {
  if (!ProjectDetail.images || ProjectDetail.images.length === 0) {
    console.warn('No images available');
    return;
  }
  
  if (index < 0 || index >= ProjectDetail.images.length) {
    console.warn(`Invalid image index: ${index}`);
    return;
  }
  
  if (!ProjectDetail.currentProject) {
    console.warn('No current project');
    return;
  }
  
  ProjectDetail.currentImageIndex = index;
  
  // Update main image
  setupMainImage(ProjectDetail.images[index], index);
  
  // Update thumbnails
  updateThumbnails();
  
  // Update counter and buttons
  updateImageCounter();
  updateGalleryButtons();
  
  console.log(`Changed to image ${index + 1}/${ProjectDetail.images.length}`);
}

/**
 * Go to previous image
 */
function previousImage() {
  const newIndex = ProjectDetail.currentImageIndex - 1;
  if (newIndex >= 0) {
    changeImage(newIndex);
  }
}

/**
 * Go to next image
 */
function nextImage() {
  const newIndex = ProjectDetail.currentImageIndex + 1;
  if (newIndex < ProjectDetail.images.length) {
    changeImage(newIndex);
  }
}

/**
 * Update thumbnail active states
 */
function updateThumbnails() {
  const { domElements } = ProjectDetail;
  
  if (!domElements.galleryThumbnails) return;
  
  const thumbnails = domElements.galleryThumbnails.querySelectorAll('.thumbnail');
  thumbnails.forEach((thumb, i) => {
    thumb.classList.toggle('active', i === ProjectDetail.currentImageIndex);
  });
}

/**
 * Update image counter
 */
function updateImageCounter() {
  const { domElements } = ProjectDetail;
  
  if (domElements.imageCounter) {
    const current = ProjectDetail.currentImageIndex + 1;
    const total = ProjectDetail.images.length;
    domElements.imageCounter.textContent = `${current} / ${total}`;
  }
}

/**
 * Update gallery navigation buttons
 */
function updateGalleryButtons() {
  const { domElements } = ProjectDetail;
  
  if (domElements.prevBtn) {
    domElements.prevBtn.disabled = ProjectDetail.currentImageIndex === 0;
    domElements.prevBtn.setAttribute('aria-disabled', ProjectDetail.currentImageIndex === 0);
  }
  
  if (domElements.nextBtn) {
    domElements.nextBtn.disabled = ProjectDetail.currentImageIndex === ProjectDetail.images.length - 1;
    domElements.nextBtn.setAttribute('aria-disabled', ProjectDetail.currentImageIndex === ProjectDetail.images.length - 1);
  }
}

/* ==========================================================================
   LIGHTBOX FUNCTIONALITY
   ========================================================================== */

/**
 * Initialize lightbox functionality with focus management
 */
function initializeLightbox() {
  const { domElements } = ProjectDetail;
  
  if (!domElements.lightboxModal || !domElements.lightboxClose) return;
  
  // Lightbox event handlers
  const closeHandler = () => closeLightbox();
  const modalClickHandler = (e) => {
    if (e.target === domElements.lightboxModal) {
      closeLightbox();
    }
  };
  const prevHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigateLightbox(-1);
  };
  const nextHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigateLightbox(1);
  };
  
  // Focus trap handlers
  const focusTrapStartHandler = () => {
    if (domElements.lightboxClose) {
      domElements.lightboxClose.focus();
    }
  };
  const focusTrapEndHandler = () => {
    if (domElements.lightboxClose) {
      domElements.lightboxClose.focus();
    }
  };
  
  // Add event listeners
  domElements.lightboxClose.addEventListener('click', closeHandler);
  domElements.lightboxModal.addEventListener('click', modalClickHandler);
  
  if (domElements.lightboxPrev) {
    domElements.lightboxPrev.addEventListener('click', prevHandler);
  }
  if (domElements.lightboxNext) {
    domElements.lightboxNext.addEventListener('click', nextHandler);
  }
  if (domElements.focusTrapStart) {
    domElements.focusTrapStart.addEventListener('focus', focusTrapStartHandler);
  }
  if (domElements.focusTrapEnd) {
    domElements.focusTrapEnd.addEventListener('focus', focusTrapEndHandler);
  }
  
  // Store for cleanup
  const lightboxListeners = [
    { element: domElements.lightboxClose, event: 'click', handler: closeHandler },
    { element: domElements.lightboxModal, event: 'click', handler: modalClickHandler }
  ];
  
  if (domElements.lightboxPrev) {
    lightboxListeners.push({ element: domElements.lightboxPrev, event: 'click', handler: prevHandler });
  }
  if (domElements.lightboxNext) {
    lightboxListeners.push({ element: domElements.lightboxNext, event: 'click', handler: nextHandler });
  }
  if (domElements.focusTrapStart) {
    lightboxListeners.push({ element: domElements.focusTrapStart, event: 'focus', handler: focusTrapStartHandler });
  }
  if (domElements.focusTrapEnd) {
    lightboxListeners.push({ element: domElements.focusTrapEnd, event: 'focus', handler: focusTrapEndHandler });
  }
  
  ProjectDetail.eventListeners.set('lightbox', lightboxListeners);
  
  console.log('Lightbox functionality initialized');
}

/**
 * Open lightbox with focus management
 */
function openLightbox(index) {
  const { domElements } = ProjectDetail;
  
  if (!domElements.lightboxModal || !domElements.lightboxImage || ProjectDetail.images.length === 0) return;
  
  // Store currently focused element
  CONFIG.lightboxFocusTrap = document.activeElement;
  
  // Set image
  const imageUrl = ProjectDetail.images[index];
  domElements.lightboxImage.src = imageUrl;
  domElements.lightboxImage.alt = `${ProjectDetail.currentProject?.title || 'Project'} - Screenshot ${index + 1}`;
  
  // Set title and description
  if (domElements.lightboxTitle) {
    domElements.lightboxTitle.textContent = `${ProjectDetail.currentProject?.title || 'Project'} - Screenshot ${index + 1}`;
  }
  if (domElements.lightboxDescription) {
    domElements.lightboxDescription.textContent = ProjectDetail.currentProject?.description || '';
  }
  
  // Show modal
  domElements.lightboxModal.classList.add('active');
  domElements.lightboxModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  
  // Focus close button
  setTimeout(() => {
    if (domElements.lightboxClose) {
      domElements.lightboxClose.focus();
    }
  }, 100);
  
  console.log(`Opened lightbox for image ${index + 1}`);
}

/**
 * Close lightbox and restore focus
 */
function closeLightbox() {
  const { domElements } = ProjectDetail;
  
  if (!domElements.lightboxModal) return;
  
  domElements.lightboxModal.classList.remove('active');
  domElements.lightboxModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  
  // Restore focus
  if (CONFIG.lightboxFocusTrap && typeof CONFIG.lightboxFocusTrap.focus === 'function') {
    CONFIG.lightboxFocusTrap.focus();
  }
  CONFIG.lightboxFocusTrap = null;
  
  console.log('Lightbox closed');
}

/**
 * Navigate lightbox
 */
function navigateLightbox(direction) {
  const newIndex = ProjectDetail.currentImageIndex + direction;
  
  if (newIndex >= 0 && newIndex < ProjectDetail.images.length) {
    changeImage(newIndex);
    openLightbox(newIndex);
  }
}

/* ==========================================================================
   KEYBOARD NAVIGATION
   ========================================================================== */

/**
 * Initialize keyboard navigation with proper scope handling
 */
function initializeKeyboardNavigation() {
  const keyboardHandler = (e) => {
    // Only handle if not in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }
    
    const { domElements } = ProjectDetail;
    const lightboxActive = domElements.lightboxModal && domElements.lightboxModal.classList.contains('active');
    
    switch (e.key) {
      case 'Escape':
        if (lightboxActive) {
          e.preventDefault();
          closeLightbox();
        }
        break;
        
      case 'ArrowLeft':
        e.preventDefault();
        if (lightboxActive) {
          navigateLightbox(-1);
        } else {
          previousImage();
        }
        break;
        
      case 'ArrowRight':
        e.preventDefault();
        if (lightboxActive) {
          navigateLightbox(1);
        } else {
          nextImage();
        }
        break;
        
      case 'Enter':
      case ' ':
        if (!lightboxActive && e.target === domElements.mainImage) {
          e.preventDefault();
          openLightbox(ProjectDetail.currentImageIndex);
        }
        break;
    }
  };
  
  document.addEventListener('keydown', keyboardHandler);
  ProjectDetail.eventListeners.set('keyboard', [
    { element: document, event: 'keydown', handler: keyboardHandler }
  ]);
  
  console.log('Keyboard navigation initialized');
}

/* ==========================================================================
   SHARING FUNCTIONALITY
   ========================================================================== */

/**
 * Initialize sharing functionality
 */
function initializeSharing() {
  const { domElements } = ProjectDetail;
  
  if (!domElements.twitterShare || !domElements.linkedinShare || !domElements.copyLink) return;
  
  const twitterHandler = () => shareProject('twitter');
  const linkedinHandler = () => shareProject('linkedin');
  const copyHandler = () => copyProjectUrl();
  
  domElements.twitterShare.addEventListener('click', twitterHandler);
  domElements.linkedinShare.addEventListener('click', linkedinHandler);
  domElements.copyLink.addEventListener('click', copyHandler);
  
  ProjectDetail.eventListeners.set('sharing', [
    { element: domElements.twitterShare, event: 'click', handler: twitterHandler },
    { element: domElements.linkedinShare, event: 'click', handler: linkedinHandler },
    { element: domElements.copyLink, event: 'click', handler: copyHandler }
  ]);
  
  console.log('Sharing functionality initialized');
}

/**
 * Share project on social media with proper URL encoding
 */
function shareProject(platform) {
  if (!ProjectDetail.currentProject) return;
  
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(ProjectDetail.currentProject.title || 'Check out this project');
  const description = encodeURIComponent(ProjectDetail.currentProject.description || '');
  
  let shareUrl = '';
  
  switch (platform) {
    case 'twitter':
      const twitterText = encodeURIComponent(`Check out this amazing project: ${ProjectDetail.currentProject.title}`);
      shareUrl = `https://twitter.com/intent/tweet?text=${twitterText}&url=${url}`;
      break;
      
    case 'linkedin':
      shareUrl = `https://linkedin.com/sharing/share-offsite/?url=${url}`;
      break;
      
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      break;
      
    default:
      console.error('Unknown sharing platform:', platform);
      return;
  }
  
  if (shareUrl) {
    window.open(shareUrl, '_blank', 'width=550,height=420,resizable=yes,scrollbars=yes');
  }
}

/**
 * Copy project URL to clipboard with fallback
 */
async function copyProjectUrl() {
  const url = window.location.href;
  
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(url);
      showNotification('Project URL copied to clipboard!', 'success');
    } else {
      // Fallback for older browsers or non-HTTPS
      fallbackCopyToClipboard(url);
    }
  } catch (error) {
    console.error('Failed to copy URL:', error);
    fallbackCopyToClipboard(url);
  }
}

/**
 * Fallback copy to clipboard method
 */
function fallbackCopyToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  textArea.setAttribute('readonly', '');
  textArea.setAttribute('aria-hidden', 'true');
  
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      showNotification('Project URL copied to clipboard!', 'success');
    } else {
      throw new Error('Copy command failed');
    }
  } catch (error) {
    console.error('Fallback copy failed:', error);
    showNotification('Failed to copy URL. Please copy manually from address bar.', 'error');
  } finally {
    document.body.removeChild(textArea);
  }
}

/* ==========================================================================
   RELATED PROJECTS
   ========================================================================== */

/**
 * Load related projects with better filtering
 */
async function loadRelatedProjects(currentProject) {
  const { domElements } = ProjectDetail;
  
  try {
    console.log('Loading related projects...');
    
    if (!window.FirebaseService || !window.FirebaseService.isServiceAvailable('firestore')) {
      console.log('Firestore not available, skipping related projects');
      hideRelatedProjects();
      return;
    }
    
    // Get all projects
    const allProjects = await window.FirebaseService.getProjects();
    
    if (!allProjects || allProjects.length === 0) {
      console.log('No projects available for related section');
      hideRelatedProjects();
      return;
    }
    
    // Filter and sort related projects
    const related = getRelatedProjects(allProjects, currentProject);
    
    ProjectDetail.relatedProjects = related;
    
    if (related.length > 0) {
      renderRelatedProjects(related);
    } else {
      hideRelatedProjects();
    }
    
  } catch (error) {
    console.error('Error loading related projects:', error);
    hideRelatedProjects();
  }
}

/**
 * Get related projects with improved logic
 */
function getRelatedProjects(allProjects, currentProject) {
  const validStatuses = ['published', 'completed'];
  
  return allProjects
    .filter(project => {
      // Exclude current project
      if (project.id === currentProject.id) return false;
      
      // Only published/completed projects
      if (project.status && !validStatuses.includes(project.status)) return false;
      
      // Must have basic required fields
      if (!project.title || !project.description) return false;
      
      return true;
    })
    .map(project => {
      // Calculate relevance score
      let score = 0;
      
      // Same category bonus
      if (project.category === currentProject.category) {
        score += 10;
      }
      
      // Shared technologies bonus
      if (currentProject.technologies && project.technologies) {
        const sharedTechCount = currentProject.technologies.filter(tech => 
          project.technologies.includes(tech)
        ).length;
        score += sharedTechCount * 5;
      }
      
      // Recency bonus (newer projects get higher score)
      const projectDate = new Date(project.createdAt || 0);
      const daysSinceCreation = (Date.now() - projectDate.getTime()) / (1000 * 60 * 60 * 24);
      const recencyScore = Math.max(0, 100 - daysSinceCreation / 30); // Decay over 30 days
      score += recencyScore * 0.1;
      
      return { ...project, relevanceScore: score };
    })
    .filter(project => project.relevanceScore > 0) // Only include projects with some relevance
    .sort((a, b) => b.relevanceScore - a.relevanceScore) // Sort by relevance
    .slice(0, CONFIG.maxRelatedProjects); // Take top N
}

/**
 * Render related projects
 */
function renderRelatedProjects(projects) {
  const { domElements } = ProjectDetail;
  
  if (!domElements.relatedGrid || !domElements.relatedProjects) return;
  
  domElements.relatedGrid.innerHTML = projects.map(project => {
    const imageUrl = project.images && project.images.length > 0 
      ? project.images[0] 
      : 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23666">No image</text></svg>';
    
    return `
      <article class="related-project-card" role="listitem">
        <a href="project-detail.html?id=${encodeURIComponent(project.id)}" class="related-project-link">
          <div class="related-project-image">
            <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(project.title)}" loading="lazy">
          </div>
          <div class="related-project-content">
            <h3 class="related-project-title">${escapeHtml(project.title)}</h3>
            <p class="related-project-description">${escapeHtml(project.description || 'No description available')}</p>
          </div>
        </a>
      </article>
    `;
  }).join('');
  
  domElements.relatedProjects.style.display = 'block';
  console.log(`Rendered ${projects.length} related projects`);
}

/**
 * Hide related projects section
 */
function hideRelatedProjects() {
  const { domElements } = ProjectDetail;
  
  if (domElements.relatedProjects) {
    domElements.relatedProjects.style.display = 'none';
  }
}

/* ==========================================================================
   UTILITY FUNCTIONS
   ========================================================================== */

/**
 * Show loading screen
 */
function showLoadingScreen() {
  const { domElements } = ProjectDetail;
  
  if (domElements.loadingScreen) {
    domElements.loadingScreen.classList.remove('hidden');
    domElements.loadingScreen.setAttribute('aria-hidden', 'false');
  }
}

/**
 * Hide loading screen
 */
function hideLoadingScreen() {
  const { domElements } = ProjectDetail;
  
  if (domElements.loadingScreen) {
    domElements.loadingScreen.classList.add('hidden');
    domElements.loadingScreen.setAttribute('aria-hidden', 'true');
  }
}

/**
 * Show project error with custom message
 */
function showProjectError(message) {
  const { domElements } = ProjectDetail;
  
  if (domElements.errorMessage) {
    domElements.errorMessage.textContent = message;
  }
  
  if (domElements.errorScreen) {
    domElements.errorScreen.classList.remove('hidden');
    domElements.errorScreen.setAttribute('aria-hidden', 'false');
  }
  
  hideLoadingScreen();
}

/**
 * Show notification with auto-dismiss
 */
function showNotification(message, type = 'info', duration = 5000) {
  const { domElements } = ProjectDetail;
  
  if (!domElements.notificationContainer) {
    console.warn('Notification container not found');
    return;
  }
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.setAttribute('role', 'alert');
  notification.setAttribute('aria-live', 'assertive');
  
  // Style the notification
  notification.style.cssText = `
    position: relative;
    background: ${getNotificationColor(type)};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    margin-bottom: 0.5rem;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 350px;
    word-wrap: break-word;
  `;
  
  domElements.notificationContainer.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Auto-dismiss
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, duration);
}

/**
 * Get notification color based on type
 */
function getNotificationColor(type) {
  switch (type) {
    case 'error': return '#ef4444';
    case 'success': return '#22c55e';
    case 'warning': return '#f59e0b';
    default: return '#3b82f6';
  }
}

/**
 * Format text with line breaks and basic HTML escaping
 */
function formatText(text) {
  return escapeHtml(text).replace(/\n/g, '<br>');
}

/**
 * Format status text for display
 */
function formatStatus(status) {
  return status
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Format date for display
 */
function formatDate(date) {
  if (!date) return 'Unknown date';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
}

/**
 * Format numbers with K/M suffixes
 */
function formatNumber(num) {
  if (!num || isNaN(num)) return '0';
  
  const number = Number(num);
  
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'K';
  }
  return number.toString();
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Track project view safely
 */
async function trackProjectView(projectId) {
  try {
    if (window.FirebaseService?.isInitialized() && window.FirebaseService.trackProjectView) {
      await window.FirebaseService.trackProjectView(projectId);
      console.log('Project view tracked successfully');
    }
  } catch (error) {
    console.warn('Project view tracking failed:', error);
  }
}

/**
 * Cleanup function to remove all event listeners
 */
function cleanup() {
  console.log('Cleaning up project detail page...');
  
  // Remove all tracked event listeners
  for (const [key, listeners] of ProjectDetail.eventListeners) {
    listeners.forEach(({ element, event, handler }) => {
      if (element && typeof element.removeEventListener === 'function') {
        element.removeEventListener(event, handler);
      }
    });
  }
  
  ProjectDetail.eventListeners.clear();
  
  // Reset state
  ProjectDetail.isInitialized = false;
  ProjectDetail.currentProject = null;
  ProjectDetail.images = [];
  ProjectDetail.currentImageIndex = 0;
  
  console.log('Cleanup completed');
}

// Handle page unload
window.addEventListener('beforeunload', cleanup);

// Export functions for global access (maintaining backward compatibility)
window.ProjectDetail = {
  initialize: initializeProjectDetail,
  changeImage,
  shareProject,
  copyProjectUrl,
  cleanup
};

// Make specific functions available globally for any inline handlers
window.changeImage = changeImage;
window.shareProject = shareProject;
window.copyProjectUrl = copyProjectUrl;