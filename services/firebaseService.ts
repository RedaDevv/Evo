import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged,
  sendEmailVerification,
  reload,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocFromServer
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { Task, Unavailability, User, UserData, ThemeType } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const firebaseService = {
  // Auth
  async loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    await this.ensureUserProfile(result.user);
    return result.user;
  },

  async signup(email: string, name: string, pass: string) {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(result.user, { displayName: name });
    await sendEmailVerification(result.user);
    await this.ensureUserProfile(result.user);
    return result.user;
  },

  async resendVerificationEmail() {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  },

  async reloadUser() {
    if (auth.currentUser) {
      await reload(auth.currentUser);
      return auth.currentUser;
    }
    return null;
  },

  async login(email: string, pass: string) {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  },

  async logout() {
    await signOut(auth);
  },

  async ensureUserProfile(user: FirebaseUser) {
    const userRef = doc(db, 'users', user.uid);
    try {
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email || '',
          name: user.displayName || 'Utilisateur',
          theme: 'midnight',
          notificationsEnabled: false,
          notificationSettings: {
            taskReminders: true,
            pomodoroAlerts: true,
            smartPlanningUpdates: true
          }
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  },

  // Firestore Data
  subscribeToUserData(userId: string, callback: (data: Partial<UserData>) => void) {
    const userRef = doc(db, 'users', userId);
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as Partial<UserData>);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${userId}`);
    });
  },

  subscribeToTasks(userId: string, callback: (tasks: Task[]) => void) {
    const tasksRef = collection(db, 'users', userId, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      callback(tasks);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/tasks`);
    });
  },

  subscribeToUnavailabilities(userId: string, callback: (unavailabilities: Unavailability[]) => void) {
    const unavailRef = collection(db, 'users', userId, 'unavailabilities');
    return onSnapshot(unavailRef, (snapshot) => {
      const unavailabilities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Unavailability));
      callback(unavailabilities);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/unavailabilities`);
    });
  },

  // Actions
  async addTask(userId: string, task: Omit<Task, 'id'>) {
    const tasksRef = collection(db, 'users', userId, 'tasks');
    try {
      await addDoc(tasksRef, task);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${userId}/tasks`);
    }
  },

  async updateTask(userId: string, taskId: string, updates: Partial<Task>) {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    try {
      await updateDoc(taskRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}/tasks/${taskId}`);
    }
  },

  async deleteTask(userId: string, taskId: string) {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    try {
      await deleteDoc(taskRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}/tasks/${taskId}`);
    }
  },

  async addUnavailability(userId: string, unavail: Omit<Unavailability, 'id'>) {
    const unavailRef = collection(db, 'users', userId, 'unavailabilities');
    try {
      await addDoc(unavailRef, unavail);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${userId}/unavailabilities`);
    }
  },

  async deleteUnavailability(userId: string, unavailId: string) {
    const unavailRef = doc(db, 'users', userId, 'unavailabilities', unavailId);
    try {
      await deleteDoc(unavailRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}/unavailabilities/${unavailId}`);
    }
  },

  async updateTheme(userId: string, theme: ThemeType) {
    const userRef = doc(db, 'users', userId);
    try {
      await updateDoc(userRef, { theme });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  },

  async updateDisplayMode(userId: string, displayMode: 'computer' | 'phone') {
    const userRef = doc(db, 'users', userId);
    try {
      await updateDoc(userRef, { displayMode });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  },

  async updateUserData(userId: string, updates: Partial<UserData>) {
    const userRef = doc(db, 'users', userId);
    try {
      await updateDoc(userRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  },

  async updateProfileName(name: string) {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: name });
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { name });
    }
  },

  async testConnection() {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if(error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration. ");
      }
    }
  }
};
