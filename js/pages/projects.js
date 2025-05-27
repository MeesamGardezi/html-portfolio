/**
 * PROJECTS.JS - Projects Page Specific Logic
 * Portfolio Website - Black & White Minimalistic Theme
 */

// Projects page state and functionality
const ProjectsPage = {
  isInitialized: false,
  projects: [],
  filteredProjects: [],
  currentPage: 1,
  projectsPerPage: 9,
  currentFilters: {
    category: 'all',
    technology: 'all',
    sort: 'latest',
    search: ''
  },
  viewMode: 'grid', // 'grid', 'list', 'masonry'
  isLoading: false,
  animationObserver: null
};

// Sample projects data (will be replaced with Firebase data)
const sampleProjects = [
  {
    id: 'ecommerce-app',
    title: 'E-Commerce Mobile App',
    description: 'Full-featured shopping app with Firebase backend, payment integration, and real-time order tracking.',
    longDescription: 'A comprehensive e-commerce solution built with Flutter, featuring user authentication, product catalog, shopping cart, payment processing via Stripe, and real-time order tracking. The app includes admin panel for inventory management and sales analytics.',
    category: 'mobile',
    technologies: ['Flutter', 'Firebase', 'Stripe', 'REST API'],
    images: ['assets/images/projects/ecommerce-1.jpg', 'assets/images/projects/ecommerce-2.jpg'],
    links: {
      github: 'https://github.com/username/ecommerce-app',
      playStore: 'https://play.google.com/store/apps/details?id=com.example.ecommerce',
      demo: 'https://demo.example.com'
    },
    featured: true,
    status: 'published',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: 'fitness-tracker',
    title: 'Fitness Tracker App',
    description: 'Comprehensive fitness tracking with workout plans, progress monitoring, and social features.',
    longDescription: 'A complete fitness tracking application with personalized workout plans, exercise library, progress tracking with charts, social features for sharing achievements, and integration with wearable devices.',
    category: 'mobile',
    technologies: ['Flutter', 'SQLite', 'Charts', 'Health APIs'],
    images: ['assets/images/projects/fitness-1.jpg', 'assets/images/projects/fitness-2.jpg'],
    links: {
      github: 'https://github.com/username/fitness-tracker',
      playStore: 'https://play.google.com/store/apps/details?id=com.example.fitness'
    },
    featured: true,
    status: 'published',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-20')
  },
  {
    id: 'weather-app',
    title: 'Weather Forecast App',
    description: 'Beautiful weather app with location-based forecasts, interactive maps, and customizable widgets.',
    longDescription: 'A modern weather application featuring accurate forecasts, interactive weather maps, customizable home screen widgets, and severe weather alerts. Built with clean architecture and smooth animations.',
    category: 'mobile',
    technologies: ['Flutter', 'Weather API', 'Maps', 'Widgets'],
    images: ['assets/images/projects/weather-1.jpg', 'assets/images/projects/weather-2.jpg'],
    links: {
      github: 'https://github.com/username/weather-app',
      demo: 'https://weather-demo.example.com'
    },
    featured: true,
    status: 'published',
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-15')
  },
  {
    id: 'task-manager',
    title: 'Task Management App',
    description: 'Productive task management with team collaboration, project tracking, and deadline notifications.',
    longDescription: 'A powerful task management solution for teams and individuals, featuring project organization, task assignment, progress tracking, deadline notifications, and team collaboration tools.',
    category: 'mobile',
    technologies: ['Flutter', 'Firebase', 'Notifications', 'Cloud Functions'],
    images: ['assets/images/projects/tasks-1.jpg'],
    links: {
      github: 'https://github.com/username/task-manager'
    },
    featured: false,
    status: 'in-development',
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-04-01')
  },
  {
    id: 'recipe-app',
    title: 'Recipe Discovery App',
    description: 'Discover and save recipes with ingredient lists, cooking timers, and meal planning features.',
    longDescription: 'A comprehensive recipe application with recipe discovery, ingredient shopping lists, cooking timers, meal planning calendar, and nutritional information tracking.',
    category: 'mobile',
    technologies: ['Flutter', 'Recipe API', 'SQLite', 'Notifications'],
    images: ['assets/images/projects/recipe-1.jpg'],
    links: {
      github: 'https://github.com/username/recipe-app',
      playStore: 'https://play.google.com/store/apps/details?id=com.example.recipes'
    },
    featured: false,
    status: 'published',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'budget-tracker',
    title: 'Personal Budget Tracker',
    description: 'Track expenses, set budgets, and visualize spending patterns with detailed analytics.',
    longDescription: 'A personal finance management app with expense tracking, budget setting, spending analytics, bill reminders, and financial goal tracking with beautiful charts and insights.',
    category: 'mobile',
    technologies: ['Flutter', 'Charts', 'Local Storage', 'Export'],
    images: ['assets/images/projects/budget-1.jpg'],
    links: {
      github: 'https://github.com/username/budget-tracker'
    },
    featured: false,
    status: 'completed',
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2023-12-20')
  }
];

/**
 * Initialize projects page when content is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
  if (window.App?.currentPage === 'projects') {
    setTimeout(initializeProjectsPage, 100);
  }
});

/**
 * Initialize all projects page functionality
 */
function initializeProjectsPage() {
  if (ProjectsPage.isInitialized) return;
  
  console.log('Initializing projects page...');
  
  // Load projects data
  loadProjectsData();
  
  // Initialize filters
  initializeFilters();
  
  // Initialize search
  initializeSearch();
  
  // Initialize view toggle
  initializeViewToggle();
  
  // Initialize pagination
  initializePagination();
  
  // Initialize scroll animations
  initializeProjectsAnimations();
  
  // Render initial projects
  renderProjects();
  
  ProjectsPage.isInitialized = true;
  console.log('Projects page initialized successfully');
}

/**
 * Load projects data (from Firebase in production)
 */
async function loadProjectsData() {
  try {
    ProjectsPage.isLoading = true;
    showLoadingState();
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In production, this would fetch from Firebase
    ProjectsPage.projects = [...sampleProjects];
    ProjectsPage.filteredProjects = [...sampleProjects];
    
    ProjectsPage.isLoading = false;
    hideLoadingState();
    
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
  
  // Populate filter options based on available data
  populateFilterOptions();
}

/**
 * Populate filter options dynamically
 */
function populateFilterOptions() {
  const categoryFilter = document.getElementById('categoryFilter');
  const techFilter = document.getElementById('techFilter');
  
  if (categoryFilter && ProjectsPage.projects.length > 0) {
    const categories = [...new Set(ProjectsPage.projects.map(p => p.category))];
    
    // Clear existing options except "All"
    const allOption = categoryFilter.querySelector('option[value="all"]');
    categoryFilter.innerHTML = '';
    categoryFilter.appendChild(allOption);
    
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = Utils.string.capitalize(category);
      categoryFilter.appendChild(option);
    });
  }
  
  if (techFilter && ProjectsPage.projects.length > 0) {
    const technologies = [...new Set(ProjectsPage.projects.flatMap(p => p.technologies))];
    
    // Clear existing options except "All"
    const allOption = techFilter.querySelector('option[value="all"]');
    techFilter.innerHTML = '';
    techFilter.appendChild(allOption);
    
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
 * @param {Event} event - Filter change event
 */
function handleFilterChange(event) {
  const filterType = event.target.id.replace('Filter', '');
  const filterValue = event.target.value;
  
  ProjectsPage.currentFilters[filterType === 'tech' ? 'technology' : filterType] = filterValue;
  
  // Add visual feedback
  event.target.classList.toggle('active', filterValue !== 'all');
  
  // Apply filters
  applyFilters();
  
  // Reset to first page
  ProjectsPage.currentPage = 1;
  
  // Re-render projects
  renderProjects();
  
  // Update URL
  updateURL();
}

/**
 * Initialize search functionality
 */
function initializeSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchBox = document.querySelector('.search-box');
  
  if (!searchInput) return;
  
  // Debounced search function
  const debouncedSearch = Utils.animation.debounce(handleSearch, 300);
  
  searchInput.addEventListener('input', function(event) {
    const query = event.target.value.trim();
    
    // Toggle clear button visibility
    searchBox.classList.toggle('has-value', query.length > 0);
    
    debouncedSearch(query);
  });
  
  // Clear search functionality
  searchBox.addEventListener('click', function(event) {
    if (event.target === searchBox.querySelector('::after')) {
      searchInput.value = '';
      searchBox.classList.remove('has-value');
      handleSearch('');
    }
  });
  
  // Handle search on Enter key
  searchInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch(event.target.value.trim());
    }
  });
}

/**
 * Handle search functionality
 * @param {string} query - Search query
 */
function handleSearch(query) {
  ProjectsPage.currentFilters.search = query;
  
  // Apply filters with search
  applyFilters();
  
  // Reset to first page
  ProjectsPage.currentPage = 1;
  
  // Re-render projects
  renderProjects();
  
  // Update URL
  updateURL();
  
  // Announce results to screen readers
  announceSearchResults();
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
      project.technologies.some(tech => 
        tech.toLowerCase() === ProjectsPage.currentFilters.technology
      )
    );
  }
  
  // Search filter
  if (ProjectsPage.currentFilters.search) {
    const query = ProjectsPage.currentFilters.search.toLowerCase();
    filtered = filtered.filter(project =>
      project.title.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.technologies.some(tech => tech.toLowerCase().includes(query))
    );
  }
  
  // Sort projects
  filtered = sortProjects(filtered, ProjectsPage.currentFilters.sort);
  
  ProjectsPage.filteredProjects = filtered;
}

/**
 * Sort projects based on criteria
 * @param {Array} projects - Projects to sort
 * @param {string} sortBy - Sort criteria
 * @returns {Array} Sorted projects
 */
function sortProjects(projects, sortBy) {
  switch (sortBy) {
    case 'latest':
      return projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'alphabetical':
      return projects.sort((a, b) => a.title.localeCompare(b.title));
    case 'featured':
      return projects.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
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
        
        // Save preference
        Utils.storage.set('preferredView', newView);
      }
    });
  });
  
  // Load saved preference
  const savedView = Utils.storage.get('preferredView', 'grid');
  if (savedView !== ProjectsPage.viewMode) {
    const viewButton = document.querySelector(`[data-view="${savedView}"]`);
    if (viewButton) {
      viewButton.click();
    }
  }
}

/**
 * Initialize pagination
 */
function initializePagination() {
  // Pagination will be rendered dynamically with projects
}

/**
 * Render projects based on current state
 */
function renderProjects() {
  const projectsGrid = document.getElementById('projectsGrid');
  const resultsInfo = document.querySelector('.results-info');
  
  if (!projectsGrid) return;
  
  // Update results info
  updateResultsInfo();
  
  // Calculate pagination
  const totalProjects = ProjectsPage.filteredProjects.length;
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
  
  // Initialize animations for new elements
  setTimeout(initializeProjectCardAnimations, 100);
}

/**
 * Update results information
 */
function updateResultsInfo() {
  const resultsInfo = document.querySelector('.results-info');
  if (!resultsInfo) return;
  
  const totalResults = ProjectsPage.filteredProjects.length;
  const resultsCount = resultsInfo.querySelector('.results-count');
  
  if (resultsCount) {
    resultsCount.textContent = `${totalResults} project${totalResults !== 1 ? 's' : ''} found`;
  }
}

/**
 * Render individual project cards
 * @param {Element} container - Container element
 * @param {Array} projects - Projects to render
 */
function renderProjectCards(container, projects) {
  const cardsHTML = projects.map(project => createProjectCardHTML(project)).join('');
  
  // Animate out old cards
  const existingCards = container.querySelectorAll('.project-card');
  existingCards.forEach(card => {
    card.classList.add('filtering-out');
  });
  
  // Replace content after animation
  setTimeout(() => {
    container.innerHTML = cardsHTML;
    
    // Animate in new cards
    const newCards = container.querySelectorAll('.project-card');
    newCards.forEach((card, index) => {
      card.style.opacity = '0';
      setTimeout(() => {
        card.classList.add('filtering-in');
        card.style.opacity = '1';
      }, index * 50);
    });
  }, 200);
}

/**
 * Create HTML for individual project card
 * @param {Object} project - Project data
 * @returns {string} HTML string
 */
function createProjectCardHTML(project) {
  const techTags = project.technologies.map(tech => 
    `<span class="tech-tag">${tech}</span>`
  ).join('');
  
  const statusClass = project.status.replace('-', '-');
  const formattedDate = Utils.date.format(project.createdAt);
  
  return `
    <article class="project-card ${project.featured ? 'featured' : ''}" data-project-id="${project.id}">
      <div class="project-image">
        <img src="${project.images[0] || 'assets/images/project-placeholder.jpg'}" 
             alt="${project.title}" loading="lazy">
        <div class="project-overlay">
          <a href="#" onclick="loadProjectDetail('${project.id}')" class="project-link">View Details</a>
        </div>
      </div>
      <div class="project-content">
        <h3 class="project-title">${project.title}</h3>
        <p class="project-description">${project.description}</p>
        <div class="project-tech">${techTags}</div>
        <div class="project-meta">
          <span class="project-date">${formattedDate}</span>
          <span class="project-status ${statusClass}">${project.status.replace('-', ' ')}</span>
        </div>
        <div class="project-actions">
          ${project.links.github ? `<a href="${project.links.github}" target="_blank" class="project-action">GitHub</a>` : ''}
          ${project.links.demo ? `<a href="${project.links.demo}" target="_blank" class="project-action">Demo</a>` : ''}
          ${project.links.playStore ? `<a href="${project.links.playStore}" target="_blank" class="project-action primary">Play Store</a>` : ''}
        </div>
      </div>
    </article>
  `;
}

/**
 * Render no results state
 * @param {Element} container - Container element
 */
function renderNoResults(container) {
  const hasActiveFilters = Object.values(ProjectsPage.currentFilters).some(filter => 
    filter !== 'all' && filter !== 'latest' && filter !== ''
  );
  
  container.innerHTML = `
    <div class="no-results">
      <div class="no-results-icon">🔍</div>
      <h3 class="no-results-title">No projects found</h3>
      <p class="no-results-text">
        ${hasActiveFilters ? 
          'Try adjusting your filters or search terms to find more projects.' : 
          'No projects are currently available.'}
      </p>
      ${hasActiveFilters ? '<button class="clear-filters-btn" onclick="clearAllFilters()">Clear Filters</button>' : ''}
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
  
  // Page numbers
  const startPage = Math.max(1, ProjectsPage.currentPage - 2);
  const endPage = Math.min(totalPages, ProjectsPage.currentPage + 2);
  
  if (startPage > 1) {
    paginationHTML += `<button class="pagination-btn" onclick="changePage(1)">1</button>`;
    if (startPage > 2) {
      paginationHTML += `<span class="pagination-ellipsis">...</span>`;
    }
  }
  
  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <button class="pagination-btn ${i === ProjectsPage.currentPage ? 'active' : ''}" 
              onclick="changePage(${i})">
        ${i}
      </button>
    `;
  }
  
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationHTML += `<span class="pagination-ellipsis">...</span>`;
    }
    paginationHTML += `<button class="pagination-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
  }
  
  // Next button
  paginationHTML += `
    <button class="pagination-btn ${ProjectsPage.currentPage === totalPages ? 'disabled' : ''}" 
            onclick="changePage(${ProjectsPage.currentPage + 1})" 
            ${ProjectsPage.currentPage === totalPages ? 'disabled' : ''}>
      Next
    </button>
  `;
  
  // Page info
  const startItem = (ProjectsPage.currentPage - 1) * ProjectsPage.projectsPerPage + 1;
  const endItem = Math.min(ProjectsPage.currentPage * ProjectsPage.projectsPerPage, totalProjects);
  
  paginationHTML += `
    <span class="pagination-info">
      Showing ${startItem}-${endItem} of ${totalProjects}
    </span>
  `;
  
  paginationContainer.innerHTML = paginationHTML;
}

/**
 * Change current page
 * @param {number} page - Target page number
 */
function changePage(page) {
  const totalPages = Math.ceil(ProjectsPage.filteredProjects.length / ProjectsPage.projectsPerPage);
  
  if (page < 1 || page > totalPages || page === ProjectsPage.currentPage) {
    return;
  }
  
  ProjectsPage.currentPage = page;
  renderProjects();
  updateURL();
  
  // Scroll to top of projects
  const projectsSection = document.querySelector('.projects-page');
  if (projectsSection) {
    const navbarHeight = window.Layout ? window.Layout.getNavbarHeight() : 70;
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
    document.querySelector('.search-box').classList.remove('has-value');
  }
  
  // Apply filters and re-render
  applyFilters();
  ProjectsPage.currentPage = 1;
  renderProjects();
  updateURL();
}

/**
 * Initialize project card animations
 */
function initializeProjectCardAnimations() {
  if (!window.IntersectionObserver) return;
  
  const cards = document.querySelectorAll('.project-card');
  
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
  });
}

/**
 * Initialize scroll animations for projects page
 */
function initializeProjectsAnimations() {
  if (!window.IntersectionObserver) return;
  
  ProjectsPage.animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        ProjectsPage.animationObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  // Observe filter container and other elements
  const filterContainer = document.querySelector('.filter-container');
  if (filterContainer) {
    ProjectsPage.animationObserver.observe(filterContainer);
  }
}

/**
 * Show loading state
 */
function showLoadingState() {
  const projectsGrid = document.getElementById('projectsGrid');
  if (!projectsGrid) return;
  
  projectsGrid.className = 'loading-projects';
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
          <div class="skeleton-tag"></div>
        </div>
      </div>
    </div>
  `).join('');
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
  if (!projectsGrid) return;
  
  projectsGrid.innerHTML = `
    <div class="error-state">
      <h3>Unable to load projects</h3>
      <p>Please try again later or check your connection.</p>
      <button class="btn btn-primary" onclick="initializeProjectsPage()">Retry</button>
    </div>
  `;
}

/**
 * Update URL with current filters (for bookmarking/sharing)
 */
function updateURL() {
  const params = new URLSearchParams();
  
  Object.entries(ProjectsPage.currentFilters).forEach(([key, value]) => {
    if (value && value !== 'all' && value !== 'latest' && value !== '') {
      params.set(key, value);
    }
  });
  
  if (ProjectsPage.currentPage > 1) {
    params.set('page', ProjectsPage.currentPage);
  }
  
  if (ProjectsPage.viewMode !== 'grid') {
    params.set('view', ProjectsPage.viewMode);
  }
  
  const url = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
  history.replaceState(null, '', url);
}

/**
 * Load state from URL parameters
 */
function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  
  // Load filters
  Object.keys(ProjectsPage.currentFilters).forEach(key => {
    const value = params.get(key);
    if (value) {
      ProjectsPage.currentFilters[key] = value;
    }
  });
  
  // Load page
  const page = parseInt(params.get('page')) || 1;
  ProjectsPage.currentPage = page;
  
  // Load view mode
  const view = params.get('view') || 'grid';
  ProjectsPage.viewMode = view;
  
  // Update form elements
  updateFormElements();
}

/**
 * Update form elements to match current filters
 */
function updateFormElements() {
  const categoryFilter = document.getElementById('categoryFilter');
  const techFilter = document.getElementById('techFilter');
  const sortFilter = document.getElementById('sortFilter');
  const searchInput = document.getElementById('searchInput');
  
  if (categoryFilter) {
    categoryFilter.value = ProjectsPage.currentFilters.category;
  }
  
  if (techFilter) {
    techFilter.value = ProjectsPage.currentFilters.technology;
  }
  
  if (sortFilter) {
    sortFilter.value = ProjectsPage.currentFilters.sort;
  }
  
  if (searchInput) {
    searchInput.value = ProjectsPage.currentFilters.search;
  }
}

/**
 * Announce search results to screen readers
 */
function announceSearchResults() {
  const announcement = document.querySelector('.sr-announcement') || 
    Utils.dom.createElement('div', { className: 'sr-announcement', 'aria-live': 'polite' });
  
  const count = ProjectsPage.filteredProjects.length;
  announcement.textContent = `${count} project${count !== 1 ? 's' : ''} found`;
  
  if (!announcement.parentNode) {
    document.body.appendChild(announcement);
  }
}

/**
 * Cleanup projects page
 */
function cleanupProjectsPage() {
  if (ProjectsPage.animationObserver) {
    ProjectsPage.animationObserver.disconnect();
  }
  
  ProjectsPage.isInitialized = false;
  console.log('Projects page cleaned up');
}

// Export functions for global access
window.ProjectsPage = {
  initialize: initializeProjectsPage,
  cleanup: cleanupProjectsPage,
  changePage,
  clearAllFilters
};

// Make functions available globally for onclick handlers
window.changePage = changePage;
window.clearAllFilters = clearAllFilters;