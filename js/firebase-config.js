/**
 * FIREBASE-CONFIG.JS - Firebase Configuration and Database Operations (FIXED VERSION)
 * Portfolio Website - Black & White Minimalistic Theme
 * FIXES: Removes env-config dependency, eliminates race conditions, ensures proper initialization
 */

// Firebase configuration - hardcoded for reliability (no env-config dependency)
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCBUX2wKjdwYSw61T5_xGONXj34j5C5q2I",
  authDomain: "mesog-portfolio.firebaseapp.com",
  projectId: "mesog-portfolio",
  storageBucket: "mesog-portfolio.firebasestorage.app",
  messagingSenderId: "364503690658",
  appId: "1:364503690658:web:cf39d35305364365ed16fb",
  measurementId: "G-WYZYKX4RJL"
};

// Firebase services
let app = null;
let db = null;
let auth = null;
let storage = null;

// Firebase state management (simplified)
const FirebaseService = {
  isInitialized: false,
  isInitializing: false,
  initializationError: null,
  isOnline: navigator.onLine,
  user: null,
  listeners: {}
};

/**
 * Initialize Firebase services
 */
async function initializeFirebase() {
  // Prevent multiple simultaneous initialization attempts
  if (FirebaseService.isInitialized || FirebaseService.isInitializing) {
    return FirebaseService.isInitialized;
  }
  
  FirebaseService.isInitializing = true;
  
  try {
    console.log('Initializing Firebase...');
    
    // Check if Firebase SDK is loaded
    if (typeof firebase === 'undefined') {
      throw new Error('Firebase SDK not loaded');
    }
    
    // Initialize Firebase app
    if (!firebase.apps.length) {
      app = firebase.initializeApp(FIREBASE_CONFIG);
    } else {
      app = firebase.app();
    }
    
    // Initialize services
    db = firebase.firestore();
    auth = firebase.auth();
    storage = firebase.storage();
    
    // Configure Firestore settings
    await configureFirestore();
    
    // Set up authentication listener
    setupAuthListener();
    
    // Set up connectivity monitoring
    setupConnectivityMonitoring();
    
    FirebaseService.isInitialized = true;
    FirebaseService.isInitializing = false;
    FirebaseService.initializationError = null;
    
    console.log('Firebase initialized successfully');
    
    // Notify any waiting components
    notifyInitializationComplete();
    
    return true;
    
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    FirebaseService.isInitializing = false;
    FirebaseService.initializationError = error;
    return false;
  }
}

/**
 * Configure Firestore settings
 */
async function configureFirestore() {
  if (!db) return;
  
  try {
    // Enable offline persistence
    await db.enablePersistence({ synchronizeTabs: true });
    console.log('Firestore offline persistence enabled');
  } catch (error) {
    if (error.code === 'failed-precondition') {
      console.warn('Firestore persistence failed: Multiple tabs open');
    } else if (error.code === 'unimplemented') {
      console.warn('Firestore persistence not supported in this browser');
    } else {
      console.warn('Firestore persistence error:', error);
    }
  }
  
  // Configure settings
  db.settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
  });
}

/**
 * Set up authentication state listener
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
 * Notify components that Firebase is ready
 */
function notifyInitializationComplete() {
  // Dispatch custom event
  window.dispatchEvent(new CustomEvent('firebaseReady', {
    detail: { success: true }
  }));
}

/**
 * Notify authentication listeners
 */
function notifyAuthListeners(user) {
  Object.values(FirebaseService.listeners).forEach(callback => {
    try {
      callback(user);
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
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('Browser fingerprint', 2, 2);
  
  return btoa(
    navigator.userAgent +
    screen.width + screen.height +
    new Date().getTimezoneOffset() +
    canvas.toDataURL()
  ).substr(0, 16);
}

/* ==========================================================================
   AUTHENTICATION METHODS
   ========================================================================== */

/**
 * Sign in with email and password (with rate limiting)
 */
async function signInWithEmail(email, password) {
  if (!auth) throw new Error('Firebase Auth not initialized');
  
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
 * Sign out current user
 */
async function signOut() {
  if (!auth) throw new Error('Firebase Auth not initialized');
  
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
  return FirebaseService.user !== null;
}

/**
 * Get current user
 */
function getCurrentUser() {
  return FirebaseService.user;
}

/* ==========================================================================
   FIRESTORE DATABASE METHODS
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
  if (!db) throw new Error('Firestore not initialized');
  
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
 * Add new project to Firestore
 */
async function addProject(projectData) {
  if (!db) throw new Error('Firestore not initialized');
  if (!isAuthenticated()) throw new Error('User not authenticated');
  
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
 * Update existing project
 */
async function updateProject(projectId, updates) {
  if (!db) throw new Error('Firestore not initialized');
  if (!isAuthenticated()) throw new Error('User not authenticated');
  
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
 * Delete project
 */
async function deleteProject(projectId) {
  if (!db) throw new Error('Firestore not initialized');
  if (!isAuthenticated()) throw new Error('User not authenticated');
  
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
 * Get featured projects
 */
async function getFeaturedProjects() {
  if (!db) return [];
  
  try {
    const snapshot = await db.collection('projects')
      .where('featured', '==', true)
      .where('status', 'in', ['published', 'completed'])
      .orderBy('createdAt', 'desc')
      .limit(3)
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
    
    return projects;
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    return [];
  }
}

/**
 * Get contacts from Firestore
 */
async function getContacts() {
  if (!db) throw new Error('Firestore not initialized');
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
 * Add contact message
 */
async function addContact(contactData) {
  if (!db) throw new Error('Firestore not initialized');
  
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
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'direct'
    });
    
    console.log('Contact message added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding contact:', error);
    throw error;
  }
}

/**
 * Update contact (mark as read, etc.)
 */
async function updateContact(contactId, updates) {
  if (!db) throw new Error('Firestore not initialized');
  if (!isAuthenticated()) throw new Error('User not authenticated');
  
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
 * Delete contact
 */
async function deleteContact(contactId) {
  if (!db) throw new Error('Firestore not initialized');
  if (!isAuthenticated()) throw new Error('User not authenticated');
  
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
   FIREBASE STORAGE METHODS
   ========================================================================== */

/**
 * Upload image to Firebase Storage
 */
async function uploadImage(file, path, progressCallback) {
  if (!storage) throw new Error('Firebase Storage not initialized');
  if (!isAuthenticated()) throw new Error('User not authenticated');
  
  try {
    const storageRef = storage.ref().child(path);
    const uploadTask = storageRef.put(file);
    
    // Monitor upload progress
    if (progressCallback) {
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
 * Delete image from Firebase Storage
 */
async function deleteImage(url) {
  if (!storage) throw new Error('Firebase Storage not initialized');
  if (!isAuthenticated()) throw new Error('User not authenticated');
  
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
   ANALYTICS AND METRICS
   ========================================================================== */

/**
 * Track page view
 */
async function trackPageView(page) {
  if (!db) return;
  
  try {
    await db.collection('analytics').add({
      type: 'page_view',
      page: page,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      userAgent: navigator.userAgent,
      referrer: document.referrer
    });
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
}

/**
 * Track project view
 */
async function trackProjectView(projectId) {
  if (!db) return;
  
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
   INITIALIZATION
   ========================================================================== */

// Initialize Firebase when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Small delay to ensure Firebase SDK is loaded
  setTimeout(() => {
    initializeFirebase();
  }, 100);
});

// Export Firebase service object for global access
window.FirebaseService = {
  // Initialization
  initialize: initializeFirebase,
  isInitialized: () => FirebaseService.isInitialized,
  isOnline: () => FirebaseService.isOnline,
  getInitializationError: () => FirebaseService.initializationError,
  
  // Authentication
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
  
  // Storage
  uploadImage,
  deleteImage,
  
  // Analytics
  trackPageView,
  trackProjectView,
  
  // Security
  RateLimiter
};