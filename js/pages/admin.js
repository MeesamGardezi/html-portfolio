/**
 * ADMIN.JS - Admin Panel Functionality
 * Portfolio Website - Complete Admin Management System
 */

// Admin state management
const AdminPanel = {
  currentUser: null,
  projects: [],
  contacts: [],
  analytics: {},
  currentProject: null,
  uploadedImages: [],
  technologies: [],
  isLoading: false,
  unsubscribeListeners: []
};

/**
 * Initialize admin panel when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
  initializeAdmin();
});

/**
 * Initialize admin panel functionality
 */
async function initializeAdmin() {
  console.log('Initializing admin panel...');
  
  // Wait for Firebase to initialize
  if (!window.FirebaseService?.isInitialized()) {
    setTimeout(initializeAdmin, 500);
    return;
  }
  
  // Setup authentication listener
  setupAuthListener();
  
  // Initialize components
  initializeLoginForm();
  initializeNavigation();
  initializeProjectModal();
  initializeImageUpload();
  initializeTechTags();
  
  console.log('Admin panel initialized');
}

/* ==========================================================================
   AUTHENTICATION
   ========================================================================== */

/**
 * Setup authentication state listener
 */
function setupAuthListener() {
  firebase.auth().onAuthStateChanged((user) => {
    AdminPanel.currentUser = user;
    
    if (user) {
      showAdminDashboard();
      loadAdminData();
    } else {
      showLoginScreen();
    }
  });
}

/**
 * Initialize login form
 */
function initializeLoginForm() {
  const loginForm = document.getElementById('loginForm');
  
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
      showNotification('Please fill in all fields', 'error');
      return;
    }
    
    await signInAdmin(email, password);
  });
}

/**
 * Sign in admin user
 */
async function signInAdmin(email, password) {
  const loginBtn = document.getElementById('loginBtn');
  const originalText = loginBtn.textContent;
  
  try {
    loginBtn.textContent = 'Signing in...';
    loginBtn.disabled = true;
    
    const result = await firebase.auth().signInWithEmailAndPassword(email, password);
    
    showNotification('Welcome back!', 'success');
    
  } catch (error) {
    console.error('Login error:', error);
    
    let errorMessage = 'Login failed. Please try again.';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email address.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Please try again later.';
        break;
    }
    
    showNotification(errorMessage, 'error');
    
  } finally {
    loginBtn.textContent = originalText;
    loginBtn.disabled = false;
  }
}

/**
 * Sign out admin user
 */
async function signOutAdmin() {
  try {
    // Clean up listeners
    AdminPanel.unsubscribeListeners.forEach(unsubscribe => unsubscribe());
    AdminPanel.unsubscribeListeners = [];
    
    await firebase.auth().signOut();
    showNotification('Signed out successfully', 'success');
    
  } catch (error) {
    console.error('Sign out error:', error);
    showNotification('Sign out failed', 'error');
  }
}

/**
 * Show login screen
 */
function showLoginScreen() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('adminDashboard').classList.add('hidden');
  
  // Reset form
  document.getElementById('loginForm').reset();
}

/**
 * Show admin dashboard
 */
function showAdminDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminDashboard').classList.remove('hidden');
  
  // Update user email display
  const userEmail = document.getElementById('userEmail');
  if (AdminPanel.currentUser) {
    userEmail.textContent = AdminPanel.currentUser.email;
  }
}

/* ==========================================================================
   NAVIGATION
   ========================================================================== */

/**
 * Initialize navigation functionality
 */
function initializeNavigation() {
  // Navigation items
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const section = item.getAttribute('data-section');
      switchSection(section);
      
      // Update active state
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
    });
  });
  
  // Logout button
  document.getElementById('logoutBtn').addEventListener('click', signOutAdmin);
}

/**
 * Switch between admin sections
 */
function switchSection(sectionName) {
  // Hide all sections
  const sections = document.querySelectorAll('.admin-section');
  sections.forEach(section => section.classList.remove('active'));
  
  // Show selected section
  const targetSection = document.getElementById(`${sectionName}Section`);
  if (targetSection) {
    targetSection.classList.add('active');
    
    // Load section-specific data
    switch (sectionName) {
      case 'projects':
        loadProjects();
        break;
      case 'contacts':
        loadContacts();
        break;
      case 'analytics':
        loadAnalytics();
        break;
    }
  }
}

/* ==========================================================================
   DATA LOADING
   ========================================================================== */

/**
 * Load all admin data
 */
async function loadAdminData() {
  try {
    showLoadingOverlay();
    
    // Load initial data
    await Promise.all([
      loadProjects(),
      loadContacts(),
      loadAnalytics()
    ]);
    
    // Setup real-time listeners
    setupRealtimeListeners();
    
  } catch (error) {
    console.error('Error loading admin data:', error);
    showNotification('Failed to load data', 'error');
  } finally {
    hideLoadingOverlay();
  }
}

/**
 * Setup real-time listeners for data updates
 */
function setupRealtimeListeners() {
  // Projects listener
  const projectsUnsubscribe = firebase.firestore()
    .collection('projects')
    .orderBy('createdAt', 'desc')
    .onSnapshot((snapshot) => {
      AdminPanel.projects = [];
      snapshot.forEach((doc) => {
        AdminPanel.projects.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        });
      });
      renderProjects();
    });
  
  // Contacts listener
  const contactsUnsubscribe = firebase.firestore()
    .collection('contacts')
    .orderBy('createdAt', 'desc')
    .onSnapshot((snapshot) => {
      AdminPanel.contacts = [];
      snapshot.forEach((doc) => {
        AdminPanel.contacts.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        });
      });
      renderContacts();
    });
  
  AdminPanel.unsubscribeListeners.push(projectsUnsubscribe, contactsUnsubscribe);
}

/* ==========================================================================
   PROJECTS MANAGEMENT
   ========================================================================== */

/**
 * Load projects from Firestore
 */
async function loadProjects() {
  try {
    const snapshot = await firebase.firestore()
      .collection('projects')
      .orderBy('createdAt', 'desc')
      .get();
    
    AdminPanel.projects = [];
    snapshot.forEach((doc) => {
      AdminPanel.projects.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      });
    });
    
    renderProjects();
    
  } catch (error) {
    console.error('Error loading projects:', error);
    showNotification('Failed to load projects', 'error');
  }
}

/**
 * Render projects in admin grid
 */
function renderProjects() {
  const grid = document.getElementById('adminProjectsGrid');
  
  if (AdminPanel.projects.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>No projects yet</h3>
        <p>Click "Add Project" to create your first project.</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = AdminPanel.projects.map(project => createProjectCard(project)).join('');
}

/**
 * Create project card HTML
 */
function createProjectCard(project) {
  const imageUrl = project.images && project.images.length > 0 
    ? project.images[0] 
    : null;
  
  const techTags = project.technologies 
    ? project.technologies.map(tech => `<span class="admin-tech-tag">${tech}</span>`).join('')
    : '';
  
  const statusClass = project.status ? project.status.replace('-', '') : 'published';
  const statusText = project.status ? project.status.replace('-', ' ') : 'Published';
  
  return `
    <div class="admin-project-card" data-project-id="${project.id}">
      <div class="admin-project-image">
        ${imageUrl 
          ? `<img src="${imageUrl}" alt="${project.title}" loading="lazy">`
          : `<div class="placeholder">No image</div>`
        }
        <div class="project-status-badge ${statusClass}">
          ${statusText.charAt(0).toUpperCase() + statusText.slice(1)}
        </div>
      </div>
      
      <div class="admin-project-content">
        <h3 class="admin-project-title">${project.title}</h3>
        <p class="admin-project-description">${project.description || 'No description'}</p>
        
        <div class="admin-project-tech">
          ${techTags}
        </div>
        
        <div class="admin-project-actions">
          <button class="btn btn-outline" onclick="editProject('${project.id}')">Edit</button>
          <button class="btn btn-primary" onclick="viewProject('${project.id}')">View</button>
          <button class="btn btn-outline" onclick="deleteProject('${project.id}')" style="color: #ef4444; border-color: #ef4444;">Delete</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Add new project
 */
function addNewProject() {
  AdminPanel.currentProject = null;
  document.getElementById('modalTitle').textContent = 'Add New Project';
  document.getElementById('projectForm').reset();
  document.getElementById('projectId').value = '';
  
  // Clear uploaded images
  AdminPanel.uploadedImages = [];
  document.getElementById('uploadedImages').innerHTML = '';
  
  // Clear tech tags
  AdminPanel.technologies = [];
  document.getElementById('techTags').innerHTML = '';
  
  showProjectModal();
}

/**
 * Edit existing project
 */
async function editProject(projectId) {
  try {
    showLoadingOverlay();
    
    const project = AdminPanel.projects.find(p => p.id === projectId);
    if (!project) {
      showNotification('Project not found', 'error');
      return;
    }
    
    AdminPanel.currentProject = project;
    
    // Populate form
    document.getElementById('modalTitle').textContent = 'Edit Project';
    document.getElementById('projectId').value = project.id;
    document.getElementById('projectTitle').value = project.title || '';
    document.getElementById('projectCategory').value = project.category || '';
    document.getElementById('projectDescription').value = project.description || '';
    document.getElementById('projectLongDescription').value = project.longDescription || '';
    document.getElementById('projectStatus').value = project.status || 'published';
    document.getElementById('featuredProject').checked = project.featured || false;
    
    // Populate links
    document.getElementById('githubLink').value = project.links?.github || '';
    document.getElementById('demoLink').value = project.links?.demo || '';
    document.getElementById('playStoreLink').value = project.links?.playStore || '';
    document.getElementById('appStoreLink').value = project.links?.appStore || '';
    
    // Populate technologies
    AdminPanel.technologies = project.technologies || [];
    renderTechTags();
    
    // Populate images
    AdminPanel.uploadedImages = project.images ? project.images.map(url => ({ url, isExisting: true })) : [];
    renderUploadedImages();
    
    showProjectModal();
    
  } catch (error) {
    console.error('Error loading project for edit:', error);
    showNotification('Failed to load project', 'error');
  } finally {
    hideLoadingOverlay();
  }
}

/**
 * View project (redirect to public view)
 */
function viewProject(projectId) {
  const baseUrl = window.location.origin;
  window.open(`${baseUrl}/projects.html#${projectId}`, '_blank');
}

/**
 * Delete project
 */
async function deleteProject(projectId) {
  if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
    return;
  }
  
  try {
    showLoadingOverlay();
    
    const project = AdminPanel.projects.find(p => p.id === projectId);
    if (!project) {
      showNotification('Project not found', 'error');
      return;
    }
    
    // Delete images from storage
    if (project.images) {
      const deletePromises = project.images.map(imageUrl => {
        try {
          return firebase.storage().refFromURL(imageUrl).delete();
        } catch (error) {
          console.warn('Failed to delete image:', imageUrl, error);
          return Promise.resolve();
        }
      });
      
      await Promise.all(deletePromises);
    }
    
    // Delete project from Firestore
    await firebase.firestore().collection('projects').doc(projectId).delete();
    
    showNotification('Project deleted successfully', 'success');
    
  } catch (error) {
    console.error('Error deleting project:', error);
    showNotification('Failed to delete project', 'error');
  } finally {
    hideLoadingOverlay();
  }
}

/* ==========================================================================
   PROJECT MODAL
   ========================================================================== */

/**
 * Initialize project modal functionality
 */
function initializeProjectModal() {
  const modal = document.getElementById('projectModal');
  const closeBtn = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');
  const addBtn = document.getElementById('addProjectBtn');
  const form = document.getElementById('projectForm');
  
  // Show modal
  addBtn.addEventListener('click', addNewProject);
  
  // Close modal
  closeBtn.addEventListener('click', hideProjectModal);
  cancelBtn.addEventListener('click', hideProjectModal);
  
  // Close on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) hideProjectModal();
  });
  
  // Form submission
  form.addEventListener('submit', handleProjectSubmit);
  
  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      hideProjectModal();
    }
  });
}

/**
 * Show project modal
 */
function showProjectModal() {
  document.getElementById('projectModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

/**
 * Hide project modal
 */
function hideProjectModal() {
  document.getElementById('projectModal').classList.remove('active');
  document.body.style.overflow = '';
}

/**
 * Handle project form submission
 */
async function handleProjectSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const projectData = Object.fromEntries(formData.entries());
  
  // Validation
  if (!projectData.title?.trim()) {
    showNotification('Project title is required', 'error');
    return;
  }
  
  if (!projectData.category) {
    showNotification('Project category is required', 'error');
    return;
  }
  
  if (!projectData.description?.trim()) {
    showNotification('Project description is required', 'error');
    return;
  }
  
  try {
    showLoadingOverlay();
    
    // Upload new images
    const imageUrls = await uploadProjectImages();
    
    // Prepare project data
    const project = {
      title: projectData.title.trim(),
      category: projectData.category,
      description: projectData.description.trim(),
      longDescription: projectData.longDescription?.trim() || '',
      technologies: AdminPanel.technologies,
      images: imageUrls,
      status: projectData.status || 'published',
      featured: projectData.featured === 'on',
      links: {
        github: projectData.githubLink?.trim() || null,
        demo: projectData.demoLink?.trim() || null,
        playStore: projectData.playStoreLink?.trim() || null,
        appStore: projectData.appStoreLink?.trim() || null
      }
    };
    
    // Remove null values from links
    Object.keys(project.links).forEach(key => {
      if (!project.links[key]) {
        delete project.links[key];
      }
    });
    
    const projectId = projectData.projectId;
    
    if (projectId) {
      // Update existing project
      await firebase.firestore()
        .collection('projects')
        .doc(projectId)
        .update({
          ...project,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      
      showNotification('Project updated successfully', 'success');
    } else {
      // Create new project
      await firebase.firestore()
        .collection('projects')
        .add({
          ...project,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          viewCount: 0
        });
      
      showNotification('Project created successfully', 'success');
    }
    
    hideProjectModal();
    
  } catch (error) {
    console.error('Error saving project:', error);
    showNotification('Failed to save project', 'error');
  } finally {
    hideLoadingOverlay();
  }
}

/* ==========================================================================
   IMAGE UPLOAD
   ========================================================================== */

/**
 * Initialize image upload functionality
 */
function initializeImageUpload() {
  const uploadArea = document.getElementById('uploadArea');
  const imageUpload = document.getElementById('imageUpload');
  
  // Click to upload
  uploadArea.addEventListener('click', () => imageUpload.click());
  
  // File input change
  imageUpload.addEventListener('change', handleImageSelection);
  
  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    handleImageFiles(files);
  });
}

/**
 * Handle image file selection
 */
function handleImageSelection(e) {
  const files = Array.from(e.target.files).filter(file => 
    file.type.startsWith('image/')
  );
  
  handleImageFiles(files);
  
  // Reset input
  e.target.value = '';
}

/**
 * Handle image files
 */
function handleImageFiles(files) {
  files.forEach(file => {
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showNotification(`${file.name} is too large. Maximum size is 5MB.`, 'error');
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      AdminPanel.uploadedImages.push({
        file: file,
        url: e.target.result,
        isNew: true
      });
      renderUploadedImages();
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Render uploaded images
 */
function renderUploadedImages() {
  const container = document.getElementById('uploadedImages');
  
  container.innerHTML = AdminPanel.uploadedImages.map((image, index) => `
    <div class="uploaded-image">
      <img src="${image.url}" alt="Project image ${index + 1}">
      <button type="button" class="remove-image" onclick="removeImage(${index})">&times;</button>
    </div>
  `).join('');
}

/**
 * Remove uploaded image
 */
function removeImage(index) {
  AdminPanel.uploadedImages.splice(index, 1);
  renderUploadedImages();
}

/**
 * Upload project images to Firebase Storage
 */
async function uploadProjectImages() {
  const imageUrls = [];
  
  for (const image of AdminPanel.uploadedImages) {
    if (image.isExisting) {
      // Keep existing images
      imageUrls.push(image.url);
    } else if (image.file) {
      try {
        // Upload new image
        const imageRef = firebase.storage()
          .ref()
          .child(`projects/${Date.now()}_${image.file.name}`);
        
        const snapshot = await imageRef.put(image.file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        imageUrls.push(downloadURL);
      } catch (error) {
        console.error('Error uploading image:', error);
        showNotification(`Failed to upload ${image.file.name}`, 'error');
      }
    }
  }
  
  return imageUrls;
}

/* ==========================================================================
   TECHNOLOGY TAGS
   ========================================================================== */

/**
 * Initialize technology tags functionality
 */
function initializeTechTags() {
  const techInput = document.getElementById('techInput');
  
  techInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTechnology(techInput.value.trim());
      techInput.value = '';
    }
  });
  
  techInput.addEventListener('blur', () => {
    if (techInput.value.trim()) {
      addTechnology(techInput.value.trim());
      techInput.value = '';
    }
  });
}

/**
 * Add technology tag
 */
function addTechnology(tech) {
  if (!tech || AdminPanel.technologies.includes(tech)) {
    return;
  }
  
  AdminPanel.technologies.push(tech);
  renderTechTags();
}

/**
 * Remove technology tag
 */
function removeTechnology(index) {
  AdminPanel.technologies.splice(index, 1);
  renderTechTags();
}

/**
 * Render technology tags
 */
function renderTechTags() {
  const container = document.getElementById('techTags');
  
  container.innerHTML = AdminPanel.technologies.map((tech, index) => `
    <div class="tech-tag-item">
      <span>${tech}</span>
      <button type="button" class="tech-tag-remove" onclick="removeTechnology(${index})">&times;</button>
    </div>
  `).join('');
  
  // Update hidden input
  document.getElementById('projectTechnologies').value = AdminPanel.technologies.join(',');
}

/* ==========================================================================
   CONTACTS MANAGEMENT
   ========================================================================== */

/**
 * Load contacts from Firestore
 */
async function loadContacts() {
  try {
    const snapshot = await firebase.firestore()
      .collection('contacts')
      .orderBy('createdAt', 'desc')
      .get();
    
    AdminPanel.contacts = [];
    snapshot.forEach((doc) => {
      AdminPanel.contacts.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      });
    });
    
    renderContacts();
    
  } catch (error) {
    console.error('Error loading contacts:', error);
    showNotification('Failed to load contacts', 'error');
  }
}

/**
 * Render contacts list
 */
function renderContacts() {
  const container = document.getElementById('contactsList');
  
  if (AdminPanel.contacts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>No messages yet</h3>
        <p>Contact messages will appear here.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = AdminPanel.contacts.map(contact => createContactItem(contact)).join('');
}

/**
 * Create contact item HTML
 */
function createContactItem(contact) {
  const date = contact.createdAt 
    ? contact.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Unknown date';
  
  return `
    <div class="contact-item ${!contact.read ? 'unread' : ''}" data-contact-id="${contact.id}">
      <div class="contact-header">
        <div class="contact-name">${contact.name || 'Anonymous'}</div>
        <div class="contact-date">${date}</div>
      </div>
      
      <div class="contact-email">${contact.email || 'No email provided'}</div>
      <div class="contact-subject">${contact.subject || 'No subject'}</div>
      <div class="contact-message">${contact.message || 'No message'}</div>
      
      <div class="contact-actions">
        <button class="btn btn-outline" onclick="replyToContact('${contact.id}')">Reply</button>
        <button class="btn btn-outline" onclick="markAsRead('${contact.id}')">${contact.read ? 'Mark Unread' : 'Mark Read'}</button>
        <button class="btn btn-outline" onclick="deleteContact('${contact.id}')" style="color: #ef4444; border-color: #ef4444;">Delete</button>
      </div>
    </div>
  `;
}

/**
 * Reply to contact (open email client)
 */
function replyToContact(contactId) {
  const contact = AdminPanel.contacts.find(c => c.id === contactId);
  if (!contact) return;
  
  const subject = `Re: ${contact.subject || 'Your message'}`;
  const body = `Hi ${contact.name || 'there'},\n\nThank you for your message.\n\n---\nOriginal message:\n${contact.message}`;
  
  const mailtoUrl = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoUrl);
}

/**
 * Mark contact as read/unread
 */
async function markAsRead(contactId) {
  try {
    const contact = AdminPanel.contacts.find(c => c.id === contactId);
    if (!contact) return;
    
    await firebase.firestore()
      .collection('contacts')
      .doc(contactId)
      .update({
        read: !contact.read,
        readAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    
    showNotification(`Message marked as ${!contact.read ? 'read' : 'unread'}`, 'success');
    
  } catch (error) {
    console.error('Error updating contact:', error);
    showNotification('Failed to update message', 'error');
  }
}

/**
 * Delete contact
 */
async function deleteContact(contactId) {
  if (!confirm('Are you sure you want to delete this message?')) {
    return;
  }
  
  try {
    await firebase.firestore().collection('contacts').doc(contactId).delete();
    showNotification('Message deleted successfully', 'success');
    
  } catch (error) {
    console.error('Error deleting contact:', error);
    showNotification('Failed to delete message', 'error');
  }
}

/* ==========================================================================
   ANALYTICS
   ========================================================================== */

/**
 * Load analytics data
 */
async function loadAnalytics() {
  try {
    const dateRange = document.getElementById('dateRange')?.value || 30;
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(dateRange));
    
    // Get analytics data from Firestore
    const analyticsSnapshot = await firebase.firestore()
      .collection('analytics')
      .where('timestamp', '>=', dateFrom)
      .get();
    
    const pageViews = analyticsSnapshot.docs.filter(doc => doc.data().type === 'page_view').length;
    const projectViews = analyticsSnapshot.docs.filter(doc => doc.data().type === 'project_view').length;
    
    // Get total projects count
    const projectsSnapshot = await firebase.firestore().collection('projects').get();
    const totalProjects = projectsSnapshot.size;
    
    // Get contacts count
    const contactsSnapshot = await firebase.firestore()
      .collection('contacts')
      .where('createdAt', '>=', dateFrom)
      .get();
    const contactMessages = contactsSnapshot.size;
    
    // Update UI
    document.getElementById('pageViews').textContent = pageViews.toLocaleString();
    document.getElementById('projectViews').textContent = projectViews.toLocaleString();
    document.getElementById('totalProjects').textContent = totalProjects.toLocaleString();
    document.getElementById('contactMessages').textContent = contactMessages.toLocaleString();
    
  } catch (error) {
    console.error('Error loading analytics:', error);
    showNotification('Failed to load analytics', 'error');
  }
}

/* ==========================================================================
   UI HELPERS
   ========================================================================== */

/**
 * Show loading overlay
 */
function showLoadingOverlay() {
  document.getElementById('loadingOverlay').classList.remove('hidden');
}

/**
 * Hide loading overlay
 */
function hideLoadingOverlay() {
  document.getElementById('loadingOverlay').classList.add('hidden');
}

/**
 * Show notification
 */
function showNotification(message, type = 'info', duration = 5000) {
  const container = document.getElementById('notificationContainer');
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  container.appendChild(notification);
  
  // Trigger animation
  setTimeout(() => notification.classList.add('show'), 100);
  
  // Auto remove
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, duration);
}

// Global functions for onclick handlers
window.editProject = editProject;
window.viewProject = viewProject;
window.deleteProject = deleteProject;
window.removeImage = removeImage;
window.removeTechnology = removeTechnology;
window.replyToContact = replyToContact;
window.markAsRead = markAsRead;
window.deleteContact = deleteContact;