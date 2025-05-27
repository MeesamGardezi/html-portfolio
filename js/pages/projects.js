/**
 * PROJECTS.JS - Projects Page Logic
 * Portfolio Website - Black & White Minimalistic Theme
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

// Enhanced sample projects data
const sampleProjects = [
  {
    id: 'ecommerce-app',
    title: 'E-Commerce Mobile App',
    description: 'Full-featured shopping app with Firebase backend, payment integration, and real-time order tracking.',
    longDescription: 'A comprehensive e-commerce solution built with Flutter, featuring user authentication, product catalog, shopping cart, payment processing via Stripe, and real-time order tracking. The app includes admin panel for inventory management and sales analytics.',
    category: 'mobile',
    technologies: ['Flutter', 'Firebase', 'Stripe', 'REST API'],
    images: ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop'],
    links: {
      github: 'https://github.com/username/ecommerce-app',
      playStore: 'https://play.google.com/store/apps/details?id=com.example.ecommerce',
      demo: 'https://demo.example.com'
    },
    featured: true,
    status: 'published',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-01'),
    downloads: '15K+',
    rating: 4.8
  },
  {
    id: 'fitness-tracker',
    title: 'Fitness Tracker App',
    description: 'Comprehensive fitness tracking with workout plans, progress monitoring, and social features.',
    longDescription: 'A complete fitness tracking application with personalized workout plans, exercise library, progress tracking with charts, social features for sharing achievements, and integration with wearable devices.',
    category: 'mobile',
    technologies: ['Flutter', 'SQLite', 'Charts', 'Health APIs'],
    images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop'],
    links: {
      github: 'https://github.com/username/fitness-tracker',
      playStore: 'https://play.google.com/store/apps/details?id=com.example.fitness'
    },
    featured: true,
    status: 'published',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-20'),
    downloads: '8K+',
    rating: 4.5
  },
  {
    id: 'weather-app',
    title: 'Weather Forecast App',
    description: 'Beautiful weather app with location-based forecasts, interactive maps, and customizable widgets.',
    longDescription: 'A modern weather application featuring accurate forecasts, interactive weather maps, customizable home screen widgets, and severe weather alerts.',
    category: 'mobile',
    technologies: ['Flutter', 'Weather API', 'Maps', 'Widgets'],
    images: ['https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=600&h=400&fit=crop'],
    links: {
      github: 'https://github.com/username/weather-app',
      demo: 'https://weather-demo.example.com'
    },
    featured: true,
    status: 'published',
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-15'),
    downloads: '12K+',
    rating: 4.7
  },
  {
    id: 'task-manager',
    title: 'Task Management App',
    description: 'Productive task management with team collaboration, project tracking, and deadline notifications.',
    longDescription: 'A powerful task management solution for teams and individuals, featuring project organization, task assignment, progress tracking, deadline notifications, and team collaboration tools.',
    category: 'mobile',
    technologies: ['Flutter', 'Firebase', 'Notifications', 'Cloud Functions'],
    images: ['https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop'],
    links: {
      github: 'https://github.com/username/task-manager'
    },
    featured: false,
    status: 'in-development',
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-04-01'),
    downloads: 'Coming Soon',
    rating: null
  },
  {
    id: 'recipe-app',
    title: 'Recipe Discovery App',
    description: 'Discover and save recipes with ingredient lists, cooking timers, and meal planning features.',
    longDescription: 'A comprehensive recipe application with recipe discovery, ingredient shopping lists, cooking timers, meal planning calendar, and nutritional information tracking.',
    category: 'mobile',
    technologies: ['Flutter', 'Recipe API', 'SQLite', 'Notifications'],
    images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop'],
    links: {
      github: 'https://github.com/username/recipe-app',
      playStore: 'https://play.google.com/store/apps/details?id=com.example.recipes'
    },
    featured: false,
    status: 'published',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    downloads: '6K+',
    rating: 4.3
  },
  {
    id: 'budget-tracker',
    title: 'Personal Budget Tracker',
    description: 'Track expenses, set budgets, and visualize spending patterns with detailed analytics.',
    longDescription: 'A personal finance management app with expense tracking, budget setting, spending analytics, bill reminders, and financial goal tracking with beautiful charts and insights.',
    category: 'mobile',
    technologies: ['Flutter', 'Charts', 'Local Storage', 'Export'],
    images: ['https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop'],
    links: {
      github: 'https://github.com/username/budget-tracker'
    },
    featured: false,
    status: 'completed',
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2023-12-20'),
    downloads: '4K+',
    rating: 4.1
  },
  {
    id: 'music-player',
    title: 'Flutter Music Player',
    description: 'Beautiful music player with custom animations, playlist management, and audio visualization.',
    longDescription: 'A stunning music player app with custom animations, playlist management, audio visualization, equalizer, and social music sharing features.',
    category: 'mobile',
    technologies: ['Flutter', 'Audio Players', 'Animations', 'UI/UX'],
    images: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop'],
    links: {
      github: 'https://github.com/username/music-player',
      demo: 'https://music-demo.example.com'
    },
    featured: false,
    status: 'published',
    createdAt: new Date('2023-11-10'),
    updatedAt: new Date('2023-11-25'),
    downloads: '9K+',
    rating: 4.6
  },
  {
    id: 'quiz-app',
    title: 'Interactive Quiz App',
    description: 'Educational quiz application with multiple categories, leaderboards, and progress tracking.',
    longDescription: 'An engaging quiz application with multiple question categories, real-time leaderboards, progress tracking, achievements system, and social sharing features.',
    category: 'game',
    technologies: ['Flutter', 'Firebase', 'Gamification', 'Real-time DB'],
    images: ['https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=600&h=400&fit=crop'],
    links: {
      github: 'https://github.com/username/quiz-app',
      playStore: 'https://play.google.com/store/apps/details?id=com.example.quiz'
    },
    featured: false,
    status: 'published',
    createdAt: new Date('2023-10-05'),
    updatedAt: new Date('2023-10-20'),
    downloads: '11K+',
    rating: 4.4
  }
];

/**
 * Initialize projects page when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
  initializeProjectsPage();
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
  
  // Initialize scroll animations
  initializeProjectsAnimations();
  
  ProjectsPage.isInitialized = true;
  console.log('Projects page initialized successfully');
}

/**
 * Load projects data
 */
async function loadProjectsData() {
  try {
    ProjectsPage.isLoading = true;
    showLoadingState();
    
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Use sample data (in production, this would fetch from Firebase)
    ProjectsPage.projects = [...sampleProjects];
    ProjectsPage.filteredProjects = [...sampleProjects];
    
    ProjectsPage.isLoading = false;
    hideLoadingState();
    
    // Populate filter options
    populateFilterOptions();
    
    // Render initial projects
    renderProjects();
    
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
 * Populate filter options dynamically
 */
function populateFilterOptions() {
  const categoryFilter = document.getElementById('categoryFilter');
  const techFilter = document.getElementById('techFilter');
  
  if (categoryFilter && ProjectsPage.projects.length > 0) {
    const categories = [...new Set(ProjectsPage.projects.map(p => p.category))];
    
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = capitalizeFirst(category);
      categoryFilter.appendChild(option);
    });
  }
  
  if (techFilter && ProjectsPage.projects.length > 0) {
    const technologies = [...new Set(ProjectsPage.projects.flatMap(p => p.technologies))];
    
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
  
  // Reset to first page
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
}

/**
 * Update results information
 */
function updateResultsInfo() {
  const resultsCount = document.querySelector('.results-count');
  
  if (resultsCount) {
    const totalResults = ProjectsPage.filteredProjects.length;
    resultsCount.textContent = `${totalResults} project${totalResults !== 1 ? 's' : ''} found`;
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
  const techTags = project.technologies.map(tech => 
    `<span class="tech-tag">${tech}</span>`
  ).join('');
  
  const statusClass = project.status.replace('-', '');
  const formattedDate = formatDate(project.createdAt);
  
  return `
    <article class="project-card ${project.featured ? 'featured' : ''}" data-project-id="${project.id}">
      <div class="project-image">
        <img src="${project.images[0]}" alt="${project.title}" loading="lazy">
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
          <span class="project-status ${statusClass}">${capitalizeFirst(project.status.replace('-', ' '))}</span>
        </div>
        <div class="project-stats">
          ${project.downloads ? `<span class="project-downloads">📱 ${project.downloads}</span>` : ''}
          ${project.rating ? `<span class="project-rating">⭐ ${project.rating}</span>` : ''}
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
 */
function renderNoResults(container) {
  container.innerHTML = `
    <div class="no-results">
      <div class="no-results-icon">🔍</div>
      <h3 class="no-results-title">No projects found</h3>
      <p class="no-results-text">
        Try adjusting your filters or search terms to find more projects.
      </p>
      <button class="clear-filters-btn" onclick="clearAllFilters()">Clear Filters</button>
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
  for (let i = 1; i <= Math.min(totalPages, 5); i++) {
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
        entry.target.style.opacity = '0';
        entry.target.style.transform = 'translateY(30px)';
        entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, 100);
        
        animationObserver.unobserve(entry.target);
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
 * Utility functions
 */
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

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

/**
 * Load specific project detail (placeholder for now)
 */
function loadProjectDetail(projectId) {
  const project = ProjectsPage.projects.find(p => p.id === projectId);
  if (project) {
    alert(`Loading details for: ${project.title}\n\nThis will be implemented in the next step!`);
  }
}

// Export functions for global access
window.ProjectsPage = {
  initialize: initializeProjectsPage,
  changePage,
  clearAllFilters
};

// Make functions available globally for onclick handlers
window.changePage = changePage;
window.clearAllFilters = clearAllFilters;
window.loadProjectDetail = loadProjectDetail;