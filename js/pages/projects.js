/**
 * PROJECTS.JS - Projects Page Logic with Firebase Integration
 * Portfolio Website - Black & White Minimalistic Theme
 * FIXED VERSION - Resolves missing functions, pagination, and filter issues
 */

// Projects page state and functionality
const ProjectsPage = {
  isInitialized: false,
  projects: [],
  filteredProjects: [],
  currentPage: 1,
  projectsPerPage: 6,
  currentFilters: {
    category: 'all',
    technology: 'all',
    sort: 'latest',
    search: ''
  },
  viewMode: 'grid',
  isLoading: false
};

/**
 * Initialize projects page when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
  initializeProjectsPage();
});

// Also listen for Firebase ready event
window.addEventListener('firebaseReady', function() {
  if (!ProjectsPage.isInitialized) {
    initializeProjectsPage();
  }
});

/**
 * Initialize all projects page functionality
 */
function initializeProjectsPage() {
  if (ProjectsPage.isInitialized) return;
  
  console.log('Initializing projects page...');
  
  // Load projects data from Firebase
  loadProjectsData();
  
  // Initialize filters
  initializeFilters();
  
  // Initialize search
  initializeSearch();
  
  // Initialize view toggle
  initializeViewToggle();
  
  // Initialize scroll animations
  initializeProjectsAnimations();
  
  // Track page view
  trackPageView('projects');
  
  ProjectsPage.isInitialized = true;
  console.log('Projects page initialized successfully');
}

/**
 * Load projects data from Firebase
 */
async function loadProjectsData() {
  try {
    ProjectsPage.isLoading = true;
    showLoadingState();
    
    // Check if Firebase is available
    if (!window.FirebaseService) {
      console.log('FirebaseService not available, retrying...');
      setTimeout(loadProjectsData, 1000);
      return;
    }
    
    // Wait for Firebase to initialize
    if (!window.FirebaseService.isInitialized()) {
      const error = window.FirebaseService.getInitializationError();
      if (error) {
        console.error('Firebase initialization failed:', error);
        showErrorState();
        return;
      }
      
      console.log('Waiting for Firebase to initialize...');
      setTimeout(loadProjectsData, 1000);
      return;
    }
    
    // Load projects from Firestore
    const snapshot = await firebase.firestore()
      .collection('projects')
      .where('status', 'in', ['published', 'completed'])
      .orderBy('createdAt', 'desc')
      .get();
    
    ProjectsPage.projects = [];
    snapshot.forEach((doc) => {
      ProjectsPage.projects.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      });
    });
    
    // Apply initial filters
    ProjectsPage.filteredProjects = [...ProjectsPage.projects];
    ProjectsPage.isLoading = false;
    
    hideLoadingState();
    
    // Populate filter options based on real data
    populateFilterOptions();
    
    // Render projects
    renderProjects();
    
    console.log(`Loaded ${ProjectsPage.projects.length} projects from Firebase`);
    
  } catch (error) {
    console.error('Error loading projects:', error);
    showErrorState();
    ProjectsPage.isLoading = false;
  }
}

/**
 * Initialize filter functionality
 */
function initializeFilters() {
  const categoryFilter = document.getElementById('categoryFilter');
  const techFilter = document.getElementById('techFilter');
  const sortFilter = document.getElementById('sortFilter');
  
  if (categoryFilter) {
    categoryFilter.addEventListener('change', handleFilterChange);
  }
  
  if (techFilter) {
    techFilter.addEventListener('change', handleFilterChange);
  }
  
  if (sortFilter) {
    sortFilter.addEventListener('change', handleFilterChange);
  }
}

/**
 * Populate filter options dynamically based on loaded projects
 */
function populateFilterOptions() {
  const categoryFilter = document.getElementById('categoryFilter');
  const techFilter = document.getElementById('techFilter');
  
  if (categoryFilter && ProjectsPage.projects.length > 0) {
    // Clear existing options (except "All Categories")
    const existingOptions = categoryFilter.querySelectorAll('option:not(:first-child)');
    existingOptions.forEach(option => option.remove());
    
    // Get unique categories
    const categories = [...new Set(ProjectsPage.projects.map(p => p.category))].filter(Boolean);
    
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = capitalizeFirst(category);
      categoryFilter.appendChild(option);
    });
  }
  
  if (techFilter && ProjectsPage.projects.length > 0) {
    // Clear existing options (except "All Technologies")
    const existingOptions = techFilter.querySelectorAll('option:not(:first-child)');
    existingOptions.forEach(option => option.remove());
    
    // Get unique technologies
    const technologies = [...new Set(ProjectsPage.projects.flatMap(p => p.technologies || []))].filter(Boolean);
    
    technologies.forEach(tech => {
      const option = document.createElement('option');
      option.value = tech.toLowerCase();
      option.textContent = tech;
      techFilter.appendChild(option);
    });
  }
}

/**
 * Handle filter changes
 */
function handleFilterChange(event) {
  const filterType = event.target.id.replace('Filter', '').replace('tech', 'technology');
  const filterValue = event.target.value;
  
  ProjectsPage.currentFilters[filterType] = filterValue;
  
  // Add visual feedback
  event.target.classList.toggle('active', filterValue !== 'all' && filterValue !== 'latest');
  
  // Apply filters
  applyFilters();
  
  // Reset to first page and ensure it's valid
  ProjectsPage.currentPage = 1;
  
  // Re-render projects
  renderProjects();
}

/**
 * Initialize search functionality
 */
function initializeSearch() {
  const searchInput = document.getElementById('searchInput');
  
  if (!searchInput) return;
  
  // Debounced search function
  const debouncedSearch = debounce(handleSearch, 300);
  
  searchInput.addEventListener('input', function(event) {
    const query = event.target.value.trim();
    debouncedSearch(query);
  });
}

/**
 * Handle search functionality
 */
function handleSearch(query) {
  ProjectsPage.currentFilters.search = query;
  
  // Apply filters with search
  applyFilters();
  
  // Reset to first page
  ProjectsPage.currentPage = 1;
  
  // Re-render projects
  renderProjects();
}

/**
 * Apply all active filters
 */
function applyFilters() {
  let filtered = [...ProjectsPage.projects];
  
  // Category filter
  if (ProjectsPage.currentFilters.category !== 'all') {
    filtered = filtered.filter(project => project.category === ProjectsPage.currentFilters.category);
  }
  
  // Technology filter
  if (ProjectsPage.currentFilters.technology !== 'all') {
    filtered = filtered.filter(project => 
      project.technologies && project.technologies.some(tech => 
        tech.toLowerCase() === ProjectsPage.currentFilters.technology
      )
    );
  }
  
  // Search filter
  if (ProjectsPage.currentFilters.search) {
    const query = ProjectsPage.currentFilters.search.toLowerCase();
    filtered = filtered.filter(project =>
      project.title?.toLowerCase().includes(query) ||
      project.description?.toLowerCase().includes(query) ||
      (project.technologies && project.technologies.some(tech => tech.toLowerCase().includes(query)))
    );
  }
  
  // Sort projects
  filtered = sortProjects(filtered, ProjectsPage.currentFilters.sort);
  
  ProjectsPage.filteredProjects = filtered;
}

/**
 * Sort projects based on criteria
 */
function sortProjects(projects, sortBy) {
  switch (sortBy) {
    case 'latest':
      return projects.sort((a, b) => {
        const dateA = a.createdAt || new Date(0);
        const dateB = b.createdAt || new Date(0);
        return dateB - dateA;
      });
    case 'alphabetical':
      return projects.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    case 'featured':
      return projects.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        const dateA = a.createdAt || new Date(0);
        const dateB = b.createdAt || new Date(0);
        return dateB - dateA;
      });
    default:
      return projects;
  }
}

/**
 * Initialize view toggle functionality
 */
function initializeViewToggle() {
  const viewButtons = document.querySelectorAll('.view-btn');
  
  viewButtons.forEach(button => {
    button.addEventListener('click', function() {
      const newView = this.dataset.view;
      
      if (newView && newView !== ProjectsPage.viewMode) {
        // Update active button
        viewButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        // Update view mode
        ProjectsPage.viewMode = newView;
        
        // Re-render with new view
        renderProjects();
      }
    });
  });
}

/**
 * Render projects based on current state
 */
function renderProjects() {
  const projectsGrid = document.getElementById('projectsGrid');
  
  if (!projectsGrid) return;
  
  // Update results info
  updateResultsInfo();
  
  // Calculate pagination with bounds checking
  const totalProjects = ProjectsPage.filteredProjects.length;
  const totalPages = Math.ceil(totalProjects / ProjectsPage.projectsPerPage);
  
  // Ensure current page is within valid bounds
  if (ProjectsPage.currentPage > totalPages && totalPages > 0) {
    ProjectsPage.currentPage = totalPages;
  }
  if (ProjectsPage.currentPage < 1) {
    ProjectsPage.currentPage = 1;
  }
  
  const startIndex = (ProjectsPage.currentPage - 1) * ProjectsPage.projectsPerPage;
  const endIndex = Math.min(startIndex + ProjectsPage.projectsPerPage, totalProjects);
  const projectsToShow = ProjectsPage.filteredProjects.slice(startIndex, endIndex);
  
  // Update grid view class
  projectsGrid.className = `projects-grid ${ProjectsPage.viewMode}-view`;
  
  // Render projects
  if (projectsToShow.length === 0) {
    renderNoResults(projectsGrid);
  } else {
    renderProjectCards(projectsGrid, projectsToShow);
  }
  
  // Render pagination
  renderPagination();
}

/**
 * Update results information
 */
function updateResultsInfo() {
  const resultsCount = document.querySelector('.results-count');
  
  if (resultsCount) {
    const totalResults = ProjectsPage.filteredProjects.length;
    const totalProjects = ProjectsPage.projects.length;
    
    if (totalResults === totalProjects) {
      resultsCount.textContent = `${totalResults} project${totalResults !== 1 ? 's' : ''}`;
    } else {
      resultsCount.textContent = `${totalResults} of ${totalProjects} projects`;
    }
  }
}

/**
 * Render individual project cards
 */
function renderProjectCards(container, projects) {
  const cardsHTML = projects.map(project => createProjectCardHTML(project)).join('');
  
  // Add fade-in animation
  container.style.opacity = '0';
  container.innerHTML = cardsHTML;
  
  setTimeout(() => {
    container.style.transition = 'opacity 0.3s ease';
    container.style.opacity = '1';
    
    // Initialize card animations
    const cards = container.querySelectorAll('.project-card');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }, 100);
}

/**
 * Create HTML for individual project card
 */
function createProjectCardHTML(project) {
  const techTags = (project.technologies || []).map(tech => 
    `<span class="tech-tag">${tech}</span>`
  ).join('');
  
  const statusClass = (project.status || 'published').replace('-', '');
  const formattedDate = project.createdAt ? formatDate(project.createdAt) : 'Unknown date';
  
  // Use first image or fallback
  const imageUrl = project.images && project.images.length > 0 
    ? project.images[0] 
    : 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600&h=400&fit=crop';
  
  return `
    <article class="project-card ${project.featured ? 'featured' : ''}" data-project-id="${project.id}">
      <div class="project-image">
        <img src="${imageUrl}" alt="${project.title}" loading="lazy">
        <div class="project-overlay">
          <a href="#" onclick="loadProjectDetail('${project.id}')" class="project-link">View Details</a>
        </div>
      </div>
      <div class="project-content">
        <h3 class="project-title">${project.title}</h3>
        <p class="project-description">${project.description || 'No description available'}</p>
        <div class="project-tech">${techTags}</div>
        <div class="project-meta">
          <span class="project-date">${formattedDate}</span>
          <span class="project-status ${statusClass}">${capitalizeFirst((project.status || 'published').replace('-', ' '))}</span>
        </div>
        <div class="project-stats">
          ${project.downloads ? `<span class="project-downloads">📱 ${formatNumber(project.downloads)}</span>` : ''}
          ${project.rating ? `<span class="project-rating">⭐ ${project.rating}</span>` : ''}
          ${project.viewCount ? `<span class="project-views">👁 ${formatNumber(project.viewCount)}</span>` : ''}
        </div>
        <div class="project-actions">
          ${project.links?.github ? `<a href="${project.links.github}" target="_blank" class="project-action">GitHub</a>` : ''}
          ${project.links?.demo ? `<a href="${project.links.demo}" target="_blank" class="project-action">Demo</a>` : ''}
          ${project.links?.playStore ? `<a href="${project.links.playStore}" target="_blank" class="project-action primary">Play Store</a>` : ''}
          ${project.links?.appStore ? `<a href="${project.links.appStore}" target="_blank" class="project-action primary">App Store</a>` : ''}
        </div>
      </div>
    </article>
  `;
}

/**
 * Render no results state
 */
function renderNoResults(container) {
  const hasActiveFilters = ProjectsPage.currentFilters.category !== 'all' || 
                          ProjectsPage.currentFilters.technology !== 'all' ||
                          ProjectsPage.currentFilters.search !== '';
  
  container.innerHTML = `
    <div class="no-results">
      <div class="no-results-icon">🔍</div>
      <h3 class="no-results-title">No projects found</h3>
      <p class="no-results-text">
        ${hasActiveFilters 
          ? 'Try adjusting your filters or search terms to find more projects.'
          : 'No projects have been published yet.'
        }
      </p>
      ${hasActiveFilters 
        ? '<button class="clear-filters-btn" onclick="clearAllFilters()">Clear Filters</button>'
        : ''
      }
    </div>
  `;
}

/**
 * Render pagination controls
 */
function renderPagination() {
  const paginationContainer = document.getElementById('pagination');
  if (!paginationContainer) return;
  
  const totalProjects = ProjectsPage.filteredProjects.length;
  const totalPages = Math.ceil(totalProjects / ProjectsPage.projectsPerPage);
  
  if (totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }
  
  let paginationHTML = '';
  
  // Previous button
  paginationHTML += `
    <button class="pagination-btn ${ProjectsPage.currentPage === 1 ? 'disabled' : ''}" 
            onclick="changePage(${ProjectsPage.currentPage - 1})" 
            ${ProjectsPage.currentPage === 1 ? 'disabled' : ''}>
      Previous
    </button>
  `;
  
  // Page numbers (show up to 5 pages)
  const startPage = Math.max(1, ProjectsPage.currentPage - 2);
  const endPage = Math.min(totalPages, startPage + 4);
  
  // Adjust start page if we're near the end
  const adjustedStartPage = Math.max(1, Math.min(startPage, totalPages - 4));
  
  for (let i = adjustedStartPage; i <= endPage; i++) {
    paginationHTML += `
      <button class="pagination-btn ${i === ProjectsPage.currentPage ? 'active' : ''}" 
              onclick="changePage(${i})">
        ${i}
      </button>
    `;
  }
  
  // Next button
  paginationHTML += `
    <button class="pagination-btn ${ProjectsPage.currentPage === totalPages ? 'disabled' : ''}" 
            onclick="changePage(${ProjectsPage.currentPage + 1})" 
            ${ProjectsPage.currentPage === totalPages ? 'disabled' : ''}>
      Next
    </button>
  `;
  
  paginationContainer.innerHTML = paginationHTML;
}

/**
 * Change current page
 */
function changePage(page) {
  const totalPages = Math.ceil(ProjectsPage.filteredProjects.length / ProjectsPage.projectsPerPage);
  
  if (page < 1 || page > totalPages || page === ProjectsPage.currentPage) {
    return;
  }
  
  ProjectsPage.currentPage = page;
  renderProjects();
  
  // Scroll to top of projects
  const projectsSection = document.querySelector('.projects-page');
  if (projectsSection) {
    const navbarHeight = 70;
    const targetPosition = projectsSection.offsetTop - navbarHeight;
    
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });
  }
}

/**
 * Clear all active filters
 */
function clearAllFilters() {
  // Reset filter values
  ProjectsPage.currentFilters = {
    category: 'all',
    technology: 'all',
    sort: 'latest',
    search: ''
  };
  
  // Reset form elements
  const categoryFilter = document.getElementById('categoryFilter');
  const techFilter = document.getElementById('techFilter');
  const sortFilter = document.getElementById('sortFilter');
  const searchInput = document.getElementById('searchInput');
  
  if (categoryFilter) {
    categoryFilter.value = 'all';
    categoryFilter.classList.remove('active');
  }
  
  if (techFilter) {
    techFilter.value = 'all';
    techFilter.classList.remove('active');
  }
  
  if (sortFilter) {
    sortFilter.value = 'latest';
  }
  
  if (searchInput) {
    searchInput.value = '';
  }
  
  // Apply filters and re-render
  applyFilters();
  ProjectsPage.currentPage = 1;
  renderProjects();
}

/**
 * Show loading state
 */
function showLoadingState() {
  const projectsGrid = document.getElementById('projectsGrid');
  const resultsCount = document.querySelector('.results-count');
  
  if (resultsCount) {
    resultsCount.textContent = 'Loading projects...';
  }
  
  if (projectsGrid) {
    projectsGrid.innerHTML = Array(6).fill(0).map(() => `
      <div class="project-skeleton">
        <div class="skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-description"></div>
          <div class="skeleton-description"></div>
          <div class="skeleton-tags">
            <div class="skeleton-tag"></div>
            <div class="skeleton-tag"></div>
          </div>
        </div>
      </div>
    `).join('');
  }
}

/**
 * Hide loading state
 */
function hideLoadingState() {
  // Loading state will be replaced when projects are rendered
}

/**
 * Show error state
 */
function showErrorState() {
  const projectsGrid = document.getElementById('projectsGrid');
  const resultsCount = document.querySelector('.results-count');
  
  if (resultsCount) {
    resultsCount.textContent = 'Error loading projects';
  }
  
  if (projectsGrid) {
    projectsGrid.innerHTML = `
      <div class="error-state">
        <h3>Unable to load projects</h3>
        <p>Please try again later or check your connection.</p>
        <button class="btn btn-primary" onclick="loadProjectsData()">Retry</button>
      </div>
    `;
  }
}

/**
 * Initialize scroll animations
 */
function initializeProjectsAnimations() {
  if (!window.IntersectionObserver) return;
  
  const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }, 100);
        
        animationObserver.unobserve(element);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  // Observe filter container
  const filterContainer = document.querySelector('.filter-container');
  if (filterContainer) {
    animationObserver.observe(filterContainer);
  }
}

/**
 * Load specific project detail
 */
function loadProjectDetail(projectId) {
  const project = ProjectsPage.projects.find(p => p.id === projectId);
  if (project) {
    // Track project view
    trackProjectView(projectId);
    
    // For now, show project info in alert (will be replaced with modal/page later)
    const projectInfo = `
Project: ${project.title}
Description: ${project.description}
Technologies: ${project.technologies?.join(', ') || 'None listed'}
Status: ${project.status || 'Published'}
    `;
    
    alert(`Project Details:\n\n${projectInfo}\n\nProject detail page will be implemented next!`);
  }
}

/**
 * Track page view for analytics
 */
async function trackPageView(page) {
  try {
    if (window.FirebaseService?.isInitialized()) {
      await window.FirebaseService.trackPageView(page);
    }
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
}

/**
 * Track project view for analytics
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

/* ==========================================================================
   UTILITY FUNCTIONS (Previously missing)
   ========================================================================== */

/**
 * Capitalize first letter of string
 */
function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format date to readable string
 */
function formatDate(date) {
  if (!date) return 'Unknown date';
  
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Format numbers with appropriate suffixes
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
 * Debounce function calls
 */
function debounce(func, wait) {
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

// Export functions for global access
window.ProjectsPage = {
  initialize: initializeProjectsPage,
  changePage,
  clearAllFilters,
  loadProjectsData
};

// Make functions available globally for onclick handlers
window.changePage = changePage;
window.clearAllFilters = clearAllFilters;
window.loadProjectDetail = loadProjectDetail;