/**
 * FIREBASE-CONFIG.JS - Firebase Configuration with Improved Initialization (FIXED VERSION)
 * Portfolio Website - Black & White Minimalistic Theme
 * FIXES: Better initialization timing and event handling
 */

// Firebase configuration - hardcoded for reliability
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCBUX2wKjdwYSw61T5_xGONXj34j5C5q2I",
  authDomain: "mesog-portfolio.firebaseapp.com",
  projectId: "mesog-portfolio",
  storageBucket: "mesog-portfolio.firebasestorage.app",
  messagingSenderId: "364503690658",
  appId: "1:364503690658:web:cf39d35305364365ed16fb",
  measurementId: "G-WYZYKX4RJL"
};

// Firebase services (conditionally initialized)
let app = null;
let db = null;
let auth = null;
let storage = null;

// Firebase state management
const FirebaseService = {
  isInitialized: false,
  isInitializing: false,
  initializationError: null,
  isOnline: navigator.onLine,
  user: null,
  listeners: {},
  initializationPromise: null,
  availableServices: {
    auth: false,
    firestore: false,
    storage: false
  }
};

/**
 * Check which Firebase services are available
 */
function detectAvailableServices() {
  if (typeof firebase === 'undefined') {
    console.warn('Firebase SDK not loaded');
    return false;
  }
  
  const services = {
    auth: typeof firebase.auth !== 'undefined',
    firestore: typeof firebase.firestore !== 'undefined',
    storage: typeof firebase.storage !== 'undefined'
  };
  
  FirebaseService.availableServices = services;
  
  console.log('Available Firebase services:', {
    auth: services.auth ? '✓' : '✗',
    firestore: services.firestore ? '✓' : '✗',
    storage: services.storage ? '✓' : '✗'
  });
  
  return true;
}

/**
 * Initialize Firebase services (IMPROVED VERSION)
 */
async function initializeFirebase() {
  // Return existing promise if already initializing
  if (FirebaseService.initializationPromise) {
    return FirebaseService.initializationPromise;
  }
  
  // Return immediately if already initialized
  if (FirebaseService.isInitialized) {
    return Promise.resolve(true);
  }
  
  // Create initialization promise
  FirebaseService.initializationPromise = performFirebaseInitialization();
  
  return FirebaseService.initializationPromise;
}

/**
 * Perform the actual Firebase initialization
 */
async function performFirebaseInitialization() {
  try {
    FirebaseService.isInitializing = true;
    console.log('Starting Firebase initialization...');
    
    // Check what services are available
    if (!detectAvailableServices()) {
      throw new Error('Firebase SDK not loaded');
    }
    
    // Initialize Firebase app (always required)
    if (!firebase.apps.length) {
      app = firebase.initializeApp(FIREBASE_CONFIG);
    } else {
      app = firebase.app();
    }
    console.log('Firebase app initialized');
    
    // Initialize services conditionally
    await initializeFirestore();
    await initializeAuth();
    await initializeStorage();
    
    // Set up connectivity monitoring
    setupConnectivityMonitoring();
    
    FirebaseService.isInitialized = true;
    FirebaseService.isInitializing = false;
    FirebaseService.initializationError = null;
    
    console.log('Firebase initialization complete');
    logInitializationSummary();
    
    // Notify any waiting components with delay to ensure listeners are ready
    setTimeout(() => {
      notifyInitializationComplete();
    }, 100);
    
    return true;
    
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    FirebaseService.isInitializing = false;
    FirebaseService.initializationError = error;
    FirebaseService.initializationPromise = null; // Reset promise on error
    
    // Still notify to prevent infinite waiting
    setTimeout(() => {
      notifyInitializationComplete(false, error);
    }, 100);
    
    return false;
  }
}

/**
 * Initialize Firestore (if available)
 */
async function initializeFirestore() {
  if (!FirebaseService.availableServices.firestore) {
    console.log('Firestore not loaded - skipping');
    return;
  }
  
  try {
    db = firebase.firestore();
    
    // Configure settings BEFORE any other operations
    db.settings({
      cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
    });
    console.log('Firestore settings configured');
    
    // Enable offline persistence
    await db.enablePersistence({ 
      synchronizeTabs: true 
    });
    console.log('Firestore offline persistence enabled');
    
  } catch (error) {
    if (error.code === 'failed-precondition') {
      console.warn('Firestore persistence failed: Multiple tabs open');
    } else if (error.code === 'unimplemented') {
      console.warn('Firestore persistence not supported in this browser');
    } else {
      console.warn('Firestore initialization error:', error);
    }
    // Don't throw - continue with online-only mode
  }
}

/**
 * Initialize Authentication (if available)
 */
async function initializeAuth() {
  if (!FirebaseService.availableServices.auth) {
    console.log('Auth not loaded - skipping');
    return;
  }
  
  try {
    auth = firebase.auth();
    setupAuthListener();
    console.log('Auth service initialized');
  } catch (error) {
    console.error('Auth initialization error:', error);
    // Don't throw - app can work without auth on public pages
  }
}

/**
 * Initialize Storage (if available)
 */
async function initializeStorage() {
  if (!FirebaseService.availableServices.storage) {
    console.log('Storage not loaded - skipping');
    return;
  }
  
  try {
    storage = firebase.storage();
    console.log('Storage service initialized');
  } catch (error) {
    console.error('Storage initialization error:', error);
    // Don't throw - app can work without storage
  }
}

/**
 * Set up authentication state listener (if auth is available)
 */
function setupAuthListener() {
  if (!auth) return;
  
  auth.onAuthStateChanged((user) => {
    FirebaseService.user = user;
    
    if (user) {
      console.log('User signed in:', user.email);
    } else {
      console.log('User signed out');
    }
    
    // Notify listeners
    notifyAuthListeners(user);
  });
}

/**
 * Set up network connectivity monitoring
 */
function setupConnectivityMonitoring() {
  window.addEventListener('online', () => {
    FirebaseService.isOnline = true;
    console.log('Connection restored');
  });
  
  window.addEventListener('offline', () => {
    FirebaseService.isOnline = false;
    console.log('Connection lost - operating in offline mode');
  });
}

/**
 * Log initialization summary
 */
function logInitializationSummary() {
  const summary = {
    'Firebase App': '✓',
    'Firestore': db ? '✓' : '✗',
    'Authentication': auth ? '✓' : '✗',
    'Storage': storage ? '✓' : '✗',
    'Online': FirebaseService.isOnline ? '✓' : '✗'
  };
  
  console.group('🔥 Firebase Services Summary');
  Object.entries(summary).forEach(([service, status]) => {
    console.log(`${service}: ${status}`);
  });
  console.groupEnd();
}

/**
 * Notify components that Firebase is ready (IMPROVED VERSION)
 */
function notifyInitializationComplete(success = true, error = null) {
  console.log('Notifying Firebase initialization complete:', success);
  
  // Dispatch custom event
  const eventDetail = { 
    success,
    error,
    services: FirebaseService.availableServices,
    isInitialized: FirebaseService.isInitialized
  };
  
  // Multiple event dispatches to ensure delivery
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('firebaseReady', { detail: eventDetail }));
    window.dispatchEvent(new CustomEvent('firebase-ready', { detail: eventDetail }));
    window.dispatchEvent(new CustomEvent('firebase:ready', { detail: eventDetail }));
  }, 0);
  
  // Also set a flag that can be polled
  window.firebaseReady = success;
  window.firebaseError = error;
}

/**
 * Notify authentication listeners
 */
function notifyAuthListeners(user) {
  Object.values(FirebaseService.listeners).forEach(callback => {
    try {
      if (typeof callback === 'function') {
        callback(user);
      }
    } catch (error) {
      console.error('Error in auth listener:', error);
    }
  });
}

/* ==========================================================================
   RATE LIMITING & SECURITY
   ========================================================================== */

const RateLimiter = {
  attempts: new Map(),
  
  isAllowed(key, maxAttempts = 5, windowMs = 300000) { // 5 attempts per 5 minutes
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    // Record this attempt
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    
    return true;
  },
  
  reset(key) {
    this.attempts.delete(key);
  }
};

/**
 * Generate client fingerprint for rate limiting
 */
function getClientFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Browser fingerprint', 2, 2);
    
    return btoa(
      (navigator.userAgent || '') +
      (screen.width || 0) + (screen.height || 0) +
      new Date().getTimezoneOffset() +
      canvas.toDataURL()
    ).substr(0, 16);
  } catch (error) {
    // Fallback fingerprint
    return btoa(
      (navigator.userAgent || 'unknown') + 
      Date.now().toString()
    ).substr(0, 16);
  }
}

/* ==========================================================================
   AUTHENTICATION METHODS (Conditional)
   ========================================================================== */

/**
 * Sign in with email and password (requires auth service)
 */
async function signInWithEmail(email, password) {
  if (!auth) throw new Error('Authentication service not available');
  
  const clientId = getClientFingerprint();
  
  if (!RateLimiter.isAllowed(`signin_${clientId}`, 5, 300000)) {
    throw new Error('Too many sign-in attempts. Please try again later.');
  }
  
  try {
    const result = await auth.signInWithEmailAndPassword(email, password);
    console.log('Sign in successful:', result.user.email);
    
    return { success: true, user: result.user };
  } catch (error) {
    console.error('Sign in failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Sign out current user (requires auth service)
 */
async function signOut() {
  if (!auth) throw new Error('Authentication service not available');
  
  try {
    const userEmail = auth.currentUser?.email;
    await auth.signOut();
    
    console.log('Sign out successful');
    return { success: true };
  } catch (error) {
    console.error('Sign out failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  return FirebaseService.user !== null && auth !== null;
}

/**
 * Get current user
 */
function getCurrentUser() {
  return FirebaseService.user;
}

/* ==========================================================================
   FIRESTORE DATABASE METHODS (Conditional)
   ========================================================================== */

/**
 * Get all projects from Firestore
 */
async function getProjects() {
  if (!db) {
    console.warn('Firestore not available');
    return [];
  }
  
  try {
    const snapshot = await db.collection('projects')
      .orderBy('createdAt', 'desc')
      .get();
    
    const projects = [];
    snapshot.forEach((doc) => {
      projects.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      });
    });
    
    console.log(`Loaded ${projects.length} projects from Firestore`);
    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}

/**
 * Get project by ID
 */
async function getProject(projectId) {
  if (!db) throw new Error('Firestore not available');
  if (!projectId) throw new Error('Project ID is required');
  
  try {
    const doc = await db.collection('projects').doc(projectId).get();
    
    if (doc.exists) {
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
}

/**
 * Add new project to Firestore (requires auth)
 */
async function addProject(projectData) {
  if (!db) throw new Error('Firestore not available');
  if (!isAuthenticated()) throw new Error('User not authenticated');
  if (!projectData) throw new Error('Project data is required');
  
  try {
    const docRef = await db.collection('projects').add({
      ...projectData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Project added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding project:', error);
    throw error;
  }
}

/**
 * Update existing project (requires auth)
 */
async function updateProject(projectId, updates) {
  if (!db) throw new Error('Firestore not available');
  if (!isAuthenticated()) throw new Error('User not authenticated');
  if (!projectId) throw new Error('Project ID is required');
  if (!updates) throw new Error('Updates are required');
  
  try {
    await db.collection('projects').doc(projectId).update({
      ...updates,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Project updated:', projectId);
    return true;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

/**
 * Delete project (requires auth)
 */
async function deleteProject(projectId) {
  if (!db) throw new Error('Firestore not available');
  if (!isAuthenticated()) throw new Error('User not authenticated');
  if (!projectId) throw new Error('Project ID is required');
  
  try {
    await db.collection('projects').doc(projectId).delete();
    console.log('Project deleted:', projectId);
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}

/**
 * Get featured projects (client-side filtering)
 */
async function getFeaturedProjects() {
  if (!db) return [];
  
  try {
    // Get all projects (no compound index needed)
    const snapshot = await db.collection('projects').get();
    
    const allProjects = [];
    snapshot.forEach((doc) => {
      allProjects.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      });
    });
    
    // Client-side filtering (no indexes required)
    const featuredProjects = allProjects
      .filter(project => {
        const isFeatured = project.featured === true;
        const validStatuses = ['published', 'completed'];
        const hasValidStatus = !project.status || validStatuses.includes(project.status);
        return isFeatured && hasValidStatus;
      })
      .sort((a, b) => {
        const dateA = a.createdAt || new Date(0);
        const dateB = b.createdAt || new Date(0);
        return dateB - dateA;
      })
      .slice(0, 3);
    
    return featuredProjects;
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    return [];
  }
}

/**
 * Get contacts from Firestore (requires auth)
 */
async function getContacts() {
  if (!db) throw new Error('Firestore not available');
  if (!isAuthenticated()) throw new Error('User not authenticated');
  
  try {
    const snapshot = await db.collection('contacts')
      .orderBy('createdAt', 'desc')
      .get();
    
    const contacts = [];
    snapshot.forEach((doc) => {
      contacts.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      });
    });
    
    return contacts;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
}

/**
 * Add contact message (FIXED VERSION)
 */
async function addContact(contactData) {
  if (!db) throw new Error('Contact service is temporarily unavailable. Please try again later or email directly.');
  if (!contactData) throw new Error('Contact data is required');
  
  // Rate limiting for contact form
  const clientId = getClientFingerprint();
  if (!RateLimiter.isAllowed(`contact_${clientId}`, 3, 3600000)) { // 3 submissions per hour
    throw new Error('Too many contact submissions. Please try again later.');
  }
  
  try {
    const docRef = await db.collection('contacts').add({
      ...contactData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      read: false,
      userAgent: navigator.userAgent || 'Unknown',
      referrer: document.referrer || 'direct'
    });
    
    console.log('Contact message added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding contact:', error);
    
    // Provide more specific error messages
    if (error.code === 'permission-denied') {
      throw new Error('Contact service is temporarily unavailable. Please try again later or email directly.');
    }
    
    throw error;
  }
}

/**
 * Update contact (requires auth)
 */
async function updateContact(contactId, updates) {
  if (!db) throw new Error('Firestore not available');
  if (!isAuthenticated()) throw new Error('User not authenticated');
  if (!contactId) throw new Error('Contact ID is required');
  if (!updates) throw new Error('Updates are required');
  
  try {
    await db.collection('contacts').doc(contactId).update({
      ...updates,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Contact updated:', contactId);
    return true;
  } catch (error) {
    console.error('Error updating contact:', error);
    throw error;
  }
}

/**
 * Delete contact (requires auth)
 */
async function deleteContact(contactId) {
  if (!db) throw new Error('Firestore not available');
  if (!isAuthenticated()) throw new Error('User not authenticated');
  if (!contactId) throw new Error('Contact ID is required');
  
  try {
    await db.collection('contacts').doc(contactId).delete();
    console.log('Contact deleted:', contactId);
    return true;
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
}

/* ==========================================================================
   FIREBASE STORAGE METHODS (Conditional)
   ========================================================================== */

/**
 * Upload image to Firebase Storage (requires storage and auth)
 */
async function uploadImage(file, path, progressCallback) {
  if (!storage) throw new Error('Storage service not available');
  if (!isAuthenticated()) throw new Error('User not authenticated');
  if (!file) throw new Error('File is required');
  if (!path) throw new Error('Path is required');
  
  try {
    const storageRef = storage.ref().child(path);
    const uploadTask = storageRef.put(file);
    
    // Monitor upload progress
    if (progressCallback && typeof progressCallback === 'function') {
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          progressCallback(progress);
        },
        (error) => {
          console.error('Upload error:', error);
        }
      );
    }
    
    // Wait for upload completion
    await uploadTask;
    
    // Get download URL
    const downloadURL = await storageRef.getDownloadURL();
    console.log('Image uploaded successfully:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Delete image from Firebase Storage (requires storage and auth)
 */
async function deleteImage(url) {
  if (!storage) throw new Error('Storage service not available');
  if (!isAuthenticated()) throw new Error('User not authenticated');
  if (!url) throw new Error('Image URL is required');
  
  try {
    const imageRef = storage.refFromURL(url);
    await imageRef.delete();
    console.log('Image deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

/* ==========================================================================
   ANALYTICS AND METRICS (Conditional)
   ========================================================================== */

/**
 * Track page view
 */
async function trackPageView(page) {
  if (!db || !page) return;
  
  try {
    await db.collection('analytics').add({
      type: 'page_view',
      page: page,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      userAgent: navigator.userAgent || 'Unknown',
      referrer: document.referrer || 'direct'
    });
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
}

/**
 * Track project view
 */
async function trackProjectView(projectId) {
  if (!db || !projectId) return;
  
  try {
    await db.collection('analytics').add({
      type: 'project_view',
      projectId: projectId,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Update project view count
    const projectRef = db.collection('projects').doc(projectId);
    await projectRef.update({
      viewCount: firebase.firestore.FieldValue.increment(1)
    });
  } catch (error) {
    console.warn('Project view tracking failed:', error);
  }
}

/* ==========================================================================
   SERVICE AVAILABILITY HELPERS
   ========================================================================== */

/**
 * Check if specific service is available
 */
function isServiceAvailable(service) {
  return FirebaseService.availableServices[service] === true;
}

/**
 * Get list of missing services
 */
function getMissingServices() {
  const missing = [];
  Object.entries(FirebaseService.availableServices).forEach(([service, available]) => {
    if (!available) missing.push(service);
  });
  return missing;
}

/* ==========================================================================
   INITIALIZATION - IMPROVED VERSION
   ========================================================================== */

// Initialize Firebase when DOM is ready or immediately if already ready
function startFirebaseInitialization() {
  console.log('Starting Firebase initialization...');
  
  // Check if Firebase SDK is loaded
  if (typeof firebase === 'undefined') {
    console.log('Firebase SDK not loaded yet, retrying in 500ms...');
    setTimeout(startFirebaseInitialization, 500);
    return;
  }
  
  // Start initialization
  initializeFirebase().then(success => {
    console.log('Firebase initialization completed:', success);
  }).catch(error => {
    console.error('Firebase initialization failed:', error);
  });
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startFirebaseInitialization);
} else {
  // DOM already loaded
  setTimeout(startFirebaseInitialization, 100);
}

// Export Firebase service object for global access
window.FirebaseService = {
  // Initialization
  initialize: initializeFirebase,
  isInitialized: () => FirebaseService.isInitialized,
  isOnline: () => FirebaseService.isOnline,
  getInitializationError: () => FirebaseService.initializationError,
  
  // Service availability
  isServiceAvailable,
  getMissingServices,
  getAvailableServices: () => FirebaseService.availableServices,
  
  // Authentication (conditional)
  signIn: signInWithEmail,
  signOut,
  isAuthenticated,
  getCurrentUser,
  
  // Projects
  getProjects,
  getProject,
  addProject,
  updateProject,
  deleteProject,
  getFeaturedProjects,
  
  // Contacts
  getContacts,
  addContact,
  updateContact,
  deleteContact,
  
  // Storage (conditional)
  uploadImage,
  deleteImage,
  
  // Analytics
  trackPageView,
  trackProjectView,
  
  // Security
  RateLimiter
};