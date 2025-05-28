/**
 * PROJECT-DETAIL.JS - Project Detail Page Functionality
 * Portfolio Website - Black & White Minimalistic Theme
 * Features: Gallery, lightbox, sharing, related projects
 */

// Project detail page state
const ProjectDetail = {
  currentProject: null,
  currentImageIndex: 0,
  images: [],
  isLoading: false,
  allProjects: [],
  relatedProjects: []
};

/**
 * Initialize project detail page when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing project detail page...');
  
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
 * Wait for Firebase to be ready
 */
function waitForFirebase() {
  // Listen for Firebase ready event
  window.addEventListener('firebaseReady', function(event) {
    console.log('Firebase ready event received, initializing project detail...');
    initializeProjectDetail();
  });
  
  // Also check periodically in case event was missed
  const checkFirebase = setInterval(() => {
    if (window.FirebaseService && window.FirebaseService.isInitialized()) {
      console.log('Firebase ready (periodic check), initializing project detail...');
      clearInterval(checkFirebase);
      initializeProjectDetail();
    }
  }, 500);
  
  // Stop checking after 10 seconds
  setTimeout(() => {
    clearInterval(checkFirebase);
    console.warn('Firebase initialization timeout, initializing without Firebase');
    initializeProjectDetail();
  }, 10000);
}

/**
 * Initialize project detail page
 */
function initializeProjectDetail() {
  console.log('Initializing project detail page...');
  
  // Get project ID from URL
  const projectId = getProjectIdFromUrl();
  
  if (!projectId) {
    console.error('No project ID found in URL');
    showProjectError('No project specified in URL');
    return;
  }
  
  console.log('Loading project with ID:', projectId);
  
  // Load project details
  loadProjectDetail(projectId);
  
  // Initialize gallery functionality
  initializeGallery();
  
  // Initialize lightbox
  initializeLightbox();
  
  // Initialize sharing functionality
  initializeSharing();
  
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
    ProjectDetail.images = project.images || [];
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
    
    if (error.message === 'Project not found') {
      showProjectError('The project you\'re looking for doesn\'t exist or has been removed.');
    } else if (error.message.includes('Firebase')) {
      showProjectError('Unable to connect to the database. Please try again later.');
    } else {
      showProjectError('Failed to load project details. Please try again later.');
    }
  } finally {
    ProjectDetail.isLoading = false;
  }
}

/**
 * Populate project detail page with data
 */
function populateProjectDetail(project) {
  console.log('Populating project details...');
  
  // Update page title
  const pageTitle = `${project.title} - Flutter Developer Portfolio`;
  document.title = pageTitle;
  document.getElementById('page-title').textContent = pageTitle;
  
  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription && project.description) {
    metaDescription.setAttribute('content', `${project.title} - ${project.description}`);
  }
  
  // Basic project information
  document.getElementById('projectTitle').textContent = project.title || 'Untitled Project';
  document.getElementById('projectSubtitle').textContent = project.description || 'No description available';
  document.getElementById('projectCategory').textContent = project.category || 'Uncategorized';
  document.getElementById('projectStatus').textContent = formatStatus(project.status || 'published');
  document.getElementById('projectDate').textContent = formatDate(project.createdAt);
  
  // Update status class
  const statusElement = document.getElementById('projectStatus');
  statusElement.className = `meta-value project-status ${(project.status || 'published').replace('-', '')}`;
  
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
  const container = document.getElementById('projectTechnologies');
  
  if (technologies.length === 0) {
    container.innerHTML = '<span class="tech-tag">No technologies specified</span>';
    return;
  }
  
  container.innerHTML = technologies.map(tech => 
    `<span class="tech-tag">${tech}</span>`
  ).join('');
}

/**
 * Populate project links
 */
function populateProjectLinks(links) {
  const container = document.getElementById('projectLinks');
  const linkButtons = [];
  
  if (links.github) {
    linkButtons.push(`
      <a href="${links.github}" target="_blank" rel="noopener" class="project-btn github-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
        GitHub
      </a>
    `);
  }
  
  if (links.demo) {
    linkButtons.push(`
      <a href="${links.demo}" target="_blank" rel="noopener" class="project-btn demo-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
      <a href="${links.playStore}" target="_blank" rel="noopener" class="project-btn store-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.86 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
        </svg>
        Play Store
      </a>
    `);
  }
  
  if (links.appStore) {
    linkButtons.push(`
      <a href="${links.appStore}" target="_blank" rel="noopener" class="project-btn store-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"/>
        </svg>
        App Store
      </a>
    `);
  }
  
  if (linkButtons.length === 0) {
    container.innerHTML = '<p style="color: #666; font-style: italic;">No external links available</p>';
  } else {
    container.innerHTML = linkButtons.join('');
  }
}

/**
 * Setup image gallery
 */
function setupGallery(images) {
  if (images.length === 0) {
    // Show placeholder
    const gallery = document.getElementById('projectGallery');
    gallery.innerHTML = `
      <div class="gallery-main">
        <div style="aspect-ratio: 16/10; background: #f3f4f6; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
          <p style="color: #666;">No images available</p>
        </div>
      </div>
    `;
    return;
  }
  
  ProjectDetail.images = images;
  ProjectDetail.currentImageIndex = 0;
  
  // Set main image
  const mainImage = document.getElementById('mainImage');
  mainImage.src = images[0];
  mainImage.alt = `${ProjectDetail.currentProject.title} - Image 1`;
  
  // Setup thumbnails
  const thumbnailsContainer = document.getElementById('galleryThumbnails');
  if (images.length > 1) {
    thumbnailsContainer.innerHTML = images.map((image, index) => 
      `<img src="${image}" alt="Screenshot ${index + 1}" class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeImage(${index})">`
    ).join('');
  } else {
    thumbnailsContainer.style.display = 'none';
  }
  
  // Update image counter
  updateImageCounter();
  
  // Update navigation buttons
  updateGalleryButtons();
}

/**
 * Populate project content sections
 */
function populateProjectContent(project) {
  // Overview
  const overview = project.longDescription || project.description || 'No detailed description available for this project.';
  document.getElementById('projectOverview').innerHTML = formatText(overview);
  
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
  const container = document.getElementById('featuresList');
  const block = document.getElementById('featuresBlock');
  
  if (features.length === 0) {
    block.style.display = 'none';
    return;
  }
  
  container.innerHTML = features.map(feature => 
    `<li class="feature-item">${feature}</li>`
  ).join('');
  
  block.style.display = 'block';
}

/**
 * Populate development journey section
 */
function populateDevelopmentJourney(journey) {
  const container = document.getElementById('developmentJourney');
  const block = document.getElementById('journeyBlock');
  
  if (!journey) {
    block.style.display = 'none';
    return;
  }
  
  container.innerHTML = formatText(journey);
  block.style.display = 'block';
}

/**
 * Populate challenges section
 */
function populateChallenges(challenges) {
  const container = document.getElementById('challengesList');
  const block = document.getElementById('challengesBlock');
  
  if (challenges.length === 0) {
    block.style.display = 'none';
    return;
  }
  
  container.innerHTML = challenges.map(challenge => `
    <div class="challenge-item">
      <h4 class="challenge-title">${challenge.title || 'Challenge'}</h4>
      <p class="challenge-description">${challenge.description || challenge}</p>
    </div>
  `).join('');
  
  block.style.display = 'block';
}

/**
 * Populate project statistics
 */
function populateProjectStats(project) {
  document.getElementById('devTime').textContent = project.devTime || project.developmentTime || '-';
  document.getElementById('platform').textContent = project.platform || 'Not specified';
  document.getElementById('teamSize').textContent = project.teamSize || '1 developer';
  document.getElementById('downloads').textContent = formatNumber(project.downloads) || '-';
  document.getElementById('viewCount').textContent = formatNumber(project.viewCount) || '-';
}

/**
 * Populate technical details
 */
function populateTechnicalDetails(project) {
  const container = document.getElementById('techDetails');
  const details = [];
  
  if (project.technologies && project.technologies.length > 0) {
    details.push(...project.technologies.map(tech => 
      `<div class="tech-detail-item">${tech}</div>`
    ));
  }
  
  if (project.database) {
    details.push(`<div class="tech-detail-item">Database: ${project.database}</div>`);
  }
  
  if (project.architecture) {
    details.push(`<div class="tech-detail-item">Architecture: ${project.architecture}</div>`);
  }
  
  if (details.length === 0) {
    container.innerHTML = '<p style="color: #666; font-style: italic;">No technical details available</p>';
  } else {
    container.innerHTML = details.join('');
  }
}

/* ==========================================================================
   GALLERY FUNCTIONALITY
   ========================================================================== */

/**
 * Initialize gallery functionality
 */
function initializeGallery() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => previousImage());
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => nextImage());
  }
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      previousImage();
    } else if (e.key === 'ArrowRight') {
      nextImage();
    }
  });
}

/**
 * Change to specific image
 */
function changeImage(index) {
  if (index < 0 || index >= ProjectDetail.images.length) return;
  
  ProjectDetail.currentImageIndex = index;
  
  // Update main image
  const mainImage = document.getElementById('mainImage');
  mainImage.src = ProjectDetail.images[index];
  mainImage.alt = `${ProjectDetail.currentProject.title} - Image ${index + 1}`;
  
  // Update thumbnails
  const thumbnails = document.querySelectorAll('.thumbnail');
  thumbnails.forEach((thumb, i) => {
    thumb.classList.toggle('active', i === index);
  });
  
  // Update counter and buttons
  updateImageCounter();
  updateGalleryButtons();
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
 * Update image counter
 */
function updateImageCounter() {
  const counter = document.getElementById('imageCounter');
  if (counter) {
    counter.textContent = `${ProjectDetail.currentImageIndex + 1} / ${ProjectDetail.images.length}`;
  }
}

/**
 * Update gallery navigation buttons
 */
function updateGalleryButtons() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  if (prevBtn) {
    prevBtn.disabled = ProjectDetail.currentImageIndex === 0;
  }
  
  if (nextBtn) {
    nextBtn.disabled = ProjectDetail.currentImageIndex === ProjectDetail.images.length - 1;
  }
}

/* ==========================================================================
   LIGHTBOX FUNCTIONALITY
   ========================================================================== */

/**
 * Initialize lightbox functionality
 */
function initializeLightbox() {
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxClose = lightboxModal.querySelector('.lightbox-close');
  const mainImage = document.getElementById('mainImage');
  
  // Open lightbox when main image is clicked
  if (mainImage) {
    mainImage.addEventListener('click', () => {
      openLightbox(ProjectDetail.currentImageIndex);
    });
  }
  
  // Close lightbox
  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }
  
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }
  
  // Lightbox navigation
  const lightboxPrev = lightboxModal.querySelector('.lightbox-prev');
  const lightboxNext = lightboxModal.querySelector('.lightbox-next');
  
  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
  }
  
  if (lightboxNext) {
    lightboxNext.addEventListener('click', () => navigateLightbox(1));
  }
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (lightboxModal.classList.contains('active')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    }
  });
}

/**
 * Open lightbox
 */
function openLightbox(index) {
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxTitle = lightboxModal.querySelector('.lightbox-title');
  
  if (ProjectDetail.images.length === 0) return;
  
  lightboxImage.src = ProjectDetail.images[index];
  lightboxImage.alt = `${ProjectDetail.currentProject.title} - Image ${index + 1}`;
  
  if (lightboxTitle) {
    lightboxTitle.textContent = `${ProjectDetail.currentProject.title} - Image ${index + 1}`;
  }
  
  lightboxModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * Close lightbox
 */
function closeLightbox() {
  const lightboxModal = document.getElementById('lightboxModal');
  lightboxModal.classList.remove('active');
  document.body.style.overflow = '';
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
   SHARING FUNCTIONALITY
   ========================================================================== */

/**
 * Initialize sharing functionality
 */
function initializeSharing() {
  // Share buttons are handled via onclick attributes in HTML
  console.log('Sharing functionality initialized');
}

/**
 * Share project on social media
 */
function shareProject(platform) {
  if (!ProjectDetail.currentProject) return;
  
  const url = window.location.href;
  const title = ProjectDetail.currentProject.title;
  const description = ProjectDetail.currentProject.description;
  const text = `Check out this amazing project: ${title}`;
  
  switch (platform) {
    case 'twitter':
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(twitterUrl, '_blank', 'width=550,height=420');
      break;
      
    case 'linkedin':
      const linkedinUrl = `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
      window.open(linkedinUrl, '_blank', 'width=550,height=420');
      break;
      
    case 'facebook':
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      window.open(facebookUrl, '_blank', 'width=550,height=420');
      break;
  }
}

/**
 * Copy project URL to clipboard
 */
function copyProjectUrl() {
  const url = window.location.href;
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(() => {
      showNotification('Project URL copied to clipboard!', 'success');
    }).catch(() => {
      fallbackCopyToClipboard(url);
    });
  } else {
    fallbackCopyToClipboard(url);
  }
}

/**
 * Fallback copy to clipboard
 */
function fallbackCopyToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    showNotification('Project URL copied to clipboard!', 'success');
  } catch (err) {
    showNotification('Failed to copy URL. Please copy manually from address bar.', 'error');
  }
  
  textArea.remove();
}

/* ==========================================================================
   RELATED PROJECTS
   ========================================================================== */

/**
 * Load related projects
 */
async function loadRelatedProjects(currentProject) {
  try {
    console.log('Loading related projects...');
    
    if (!window.FirebaseService || !window.FirebaseService.isServiceAvailable('firestore')) {
      console.log('Firestore not available, skipping related projects');
      return;
    }
    
    // Get all projects (simple query, no indexes needed)
    const allProjects = await window.FirebaseService.getProjects();
    
    // Filter related projects (client-side)
    const related = allProjects
      .filter(project => {
        // Exclude current project
        if (project.id === currentProject.id) return false;
        
        // Only published/completed projects
        const validStatuses = ['published', 'completed'];
        if (project.status && !validStatuses.includes(project.status)) return false;
        
        // Check for same category or shared technologies
        const sameCategory = project.category === currentProject.category;
        const sharedTech = currentProject.technologies && project.technologies && 
          currentProject.technologies.some(tech => project.technologies.includes(tech));
        
        return sameCategory || sharedTech;
      })
      .sort((a, b) => {
        // Sort by relevance (same category first, then by date)
        const aCategory = a.category === currentProject.category ? 1 : 0;
        const bCategory = b.category === currentProject.category ? 1 : 0;
        
        if (aCategory !== bCategory) {
          return bCategory - aCategory;
        }
        
        // Then by date
        const dateA = a.createdAt || new Date(0);
        const dateB = b.createdAt || new Date(0);
        return dateB - dateA;
      })
      .slice(0, 3); // Take only 3 related projects
    
    ProjectDetail.relatedProjects = related;
    renderRelatedProjects(related);
    
  } catch (error) {
    console.error('Error loading related projects:', error);
    // Hide related projects section on error
    const relatedSection = document.getElementById('relatedProjects');
    if (relatedSection) {
      relatedSection.style.display = 'none';
    }
  }
}

/**
 * Render related projects
 */
function renderRelatedProjects(projects) {
  const container = document.querySelector('.related-grid');
  const section = document.getElementById('relatedProjects');
  
  if (!container || !section) return;
  
  if (projects.length === 0) {
    section.style.display = 'none';
    return;
  }
  
  container.innerHTML = projects.map(project => {
    const imageUrl = project.images && project.images.length > 0 
      ? project.images[0] 
      : 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop';
    
    return `
      <a href="project-detail.html?id=${project.id}" class="related-project-card">
        <div class="related-project-image">
          <img src="${imageUrl}" alt="${project.title}" loading="lazy">
        </div>
        <div class="related-project-content">
          <h3 class="related-project-title">${project.title}</h3>
          <p class="related-project-description">${project.description || 'No description available'}</p>
        </div>
      </a>
    `;
  }).join('');
  
  section.style.display = 'block';
}

/* ==========================================================================
   UTILITY FUNCTIONS
   ========================================================================== */

/**
 * Show loading screen
 */
function showLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.remove('hidden');
  }
}

/**
 * Hide loading screen
 */
function hideLoadingScreen() {
  const loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
  }
}

/**
 * Show project error
 */
function showProjectError(message) {
  const errorScreen = document.getElementById('projectError');
  const errorContent = errorScreen.querySelector('.error-content p');
  
  if (errorContent) {
    errorContent.textContent = message;
  }
  
  if (errorScreen) {
    errorScreen.classList.remove('hidden');
  }
  
  hideLoadingScreen();
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 90px;
    right: 20px;
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#22c55e' : '#3b82f6'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    max-width: 350px;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => notification.style.transform = 'translateX(0)', 100);
  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 5000);
}

/**
 * Format text with line breaks
 */
function formatText(text) {
  return text.replace(/\n/g, '<br>');
}

/**
 * Format status text
 */
function formatStatus(status) {
  return status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Format date
 */
function formatDate(date) {
  if (!date) return 'Unknown date';
  
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Format numbers
 */
function formatNumber(num) {
  if (!num || isNaN(num)) return '0';
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Track project view
 */
async function trackProjectView(projectId) {
  try {
    if (window.FirebaseService?.isInitialized()) {
      await window.FirebaseService.trackProjectView(projectId);
    }
  } catch (error) {
    console.warn('Project view tracking failed:', error);
  }
}

// Export functions for global access
window.ProjectDetail = {
  initialize: initializeProjectDetail,
  changeImage,
  shareProject,
  copyProjectUrl
};

// Make functions available globally for onclick handlers
window.changeImage = changeImage;
window.shareProject = shareProject;
window.copyProjectUrl = copyProjectUrl;