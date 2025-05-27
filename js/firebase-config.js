
/**
 * FIREBASE-CONFIG.JS - Firebase Configuration and Database Operations
 * Portfolio Website - Black & White Minimalistic Theme
 */

const firebaseConfig = {
  apiKey: "AIzaSyDW8SlsBmfMZCSuKb9zVVtQb12KKYxXEUg",
  authDomain: "mesogportfolio.firebaseapp.com",
  projectId: "mesogportfolio",
  storageBucket: "mesogportfolio.firebasestorage.app",
  messagingSenderId: "480773623339",
  appId: "1:480773623339:web:639712fd33e5d62a4aa46e",
  measurementId: "G-0WVCT3MY0P"
};

// Firebase services
let app = null;
let db = null;
let auth = null;
let storage = null;

// Firebase state
const FirebaseService = {
  isInitialized: false,
  isOnline: navigator.onLine,
  user: null,
  listeners: {}
};

/**
 * Initialize Firebase services
 */
async function initializeFirebase() {
  try {
    console.log('Initializing Firebase...');
    
    // Check if Firebase SDK is loaded
    if (typeof firebase === 'undefined') {
      console.warn('Firebase SDK not loaded. Using offline mode.');
      return false;
    }
    
    // Initialize Firebase app
    app = firebase.initializeApp(firebaseConfig);
    
    // Initialize services
    db = firebase.firestore();
    auth = firebase.auth();
    storage = firebase.storage();
    
    // Configure Firestore settings
    configureFirestore();
    
    // Set up authentication listener
    setupAuthListener();
    
    // Set up connectivity monitoring
    setupConnectivityMonitoring();
    
    FirebaseService.isInitialized = true;
    console.log('Firebase initialized successfully');
    
    return true;
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    return false;
  }
}

/**
 * Configure Firestore settings
 */
function configureFirestore() {
  if (!db) return;
  
  // Enable offline persistence
  db.enablePersistence({ synchronizeTabs: true })
    .then(() => {
      console.log('Firestore offline persistence enabled');
    })
    .catch((error) => {
      if (error.code === 'failed-precondition') {
        console.warn('Firestore persistence failed: Multiple tabs open');
      } else if (error.code === 'unimplemented') {
        console.warn('Firestore persistence not supported in this browser');
      }
    });
  
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
      // Set custom claims or additional user data if needed
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
 * Add authentication state listener
 * @param {Function} callback - Callback function
 * @returns {string} Listener ID
 */
function addAuthListener(callback) {
  const listenerId = generateListenerId();
  FirebaseService.listeners[listenerId] = callback;
  return listenerId;
}

/**
 * Remove authentication state listener
 * @param {string} listenerId - Listener ID to remove
 */
function removeAuthListener(listenerId) {
  delete FirebaseService.listeners[listenerId];
}

/**
 * Notify authentication listeners
 * @param {Object|null} user - Current user object
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

/**
 * Generate unique listener ID
 * @returns {string} Unique ID
 */
function generateListenerId() {
  return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/* ==========================================================================
   AUTHENTICATION METHODS
   ========================================================================== */

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Sign in result
 */
async function signInWithEmail(email, password) {
  if (!auth) throw new Error('Firebase Auth not initialized');
  
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
 * @returns {Promise<Object>} Sign out result
 */
async function signOut() {
  if (!auth) throw new Error('Firebase Auth not initialized');
  
  try {
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
 * @returns {boolean} Authentication status
 */
function isAuthenticated() {
  return FirebaseService.user !== null;
}

/**
 * Get current user
 * @returns {Object|null} Current user object
 */
function getCurrentUser() {
  return FirebaseService.user;
}

/* ==========================================================================
   FIRESTORE DATABASE METHODS
   ========================================================================== */

/**
 * Get all projects from Firestore
 * @returns {Promise<Array>} Array of projects
 */
async function getProjects() {
  if (!db) {
    console.warn('Firestore not available, using local data');
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
 * @param {string} projectId - Project ID
 * @returns {Promise<Object|null>} Project data or null
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
 * @param {Object} projectData - Project data
 * @returns {Promise<string>} Created project ID
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
 * @param {string} projectId - Project ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<boolean>} Success status
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
 * @param {string} projectId - Project ID
 * @returns {Promise<boolean>} Success status
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
 * @returns {Promise<Array>} Array of featured projects
 */
async function getFeaturedProjects() {
  if (!db) return [];
  
  try {
    const snapshot = await db.collection('projects')
      .where('featured', '==', true)
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

/* ==========================================================================
   FIREBASE STORAGE METHODS
   ========================================================================== */

/**
 * Upload image to Firebase Storage
 * @param {File} file - Image file
 * @param {string} path - Storage path
 * @param {Function} progressCallback - Progress callback
 * @returns {Promise<string>} Download URL
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
 * @param {string} url - Image URL to delete
 * @returns {Promise<boolean>} Success status
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
   REAL-TIME LISTENERS
   ========================================================================== */

/**
 * Listen to projects collection changes
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
function listenToProjects(callback) {
  if (!db) {
    console.warn('Firestore not available for real-time listening');
    return () => {};
  }
  
  const unsubscribe = db.collection('projects')
    .orderBy('createdAt', 'desc')
    .onSnapshot((snapshot) => {
      const projects = [];
      snapshot.forEach((doc) => {
        projects.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        });
      });
      
      callback(projects);
    }, (error) => {
      console.error('Error listening to projects:', error);
    });
  
  return unsubscribe;
}

/* ==========================================================================
   ANALYTICS AND METRICS
   ========================================================================== */

/**
 * Track page view
 * @param {string} page - Page name
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
 * @param {string} projectId - Project ID
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

// Initialize Firebase when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeFirebase();
});

// Export Firebase service object for global access
window.FirebaseService = {
  // Initialization
  initialize: initializeFirebase,
  isInitialized: () => FirebaseService.isInitialized,
  isOnline: () => FirebaseService.isOnline,
  
  // Authentication
  signIn: signInWithEmail,
  signOut,
  isAuthenticated,
  getCurrentUser,
  addAuthListener,
  removeAuthListener,
  
  // Projects
  getProjects,
  getProject,
  addProject,
  updateProject,
  deleteProject,
  getFeaturedProjects,
  listenToProjects,
  
  // Storage
  uploadImage,
  deleteImage,
  
  // Analytics
  trackPageView,
  trackProjectView
};