import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Types
interface UserProfile {
  childName: string;
  parentEmail: string;
  avatar: string;
  createdAt: any;
  lastLogin: any;
}

interface GameSession {
  userId: string;
  childName: string;
  phonemesCompleted: number;
  errorsCount: number;
  sessionDuration: number;
  frustrationLevel: number;
  timestamp: any;
  level: number;
}

interface ProgressData {
  userId: string;
  childName: string;
  totalPhonemes: number;
  totalSessions: number;
  averageAccuracy: number;
  currentStreak: number;
  lastUpdated: any;
}

class FirebaseService {
  // Authentication
  async createAccount(email: string, password: string, childName: string, avatar: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user profile
      await this.createUserProfile(user.uid, {
        childName,
        parentEmail: email,
        avatar,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      });
      
      return user;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await this.updateLastLogin(userCredential.user.uid);
      return userCredential.user;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // User Profile Management
  async createUserProfile(userId: string, profile: UserProfile): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, profile);
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        lastLogin: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  // Game Progress Management
  async saveGameSession(sessionData: Omit<GameSession, 'timestamp'>): Promise<void> {
    try {
      const sessionRef = doc(collection(db, 'gameSessions'));
      await setDoc(sessionRef, {
        ...sessionData,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving game session:', error);
      throw error;
    }
  }

  async getGameSessions(userId: string, limit: number = 10): Promise<GameSession[]> {
    try {
      const sessionsQuery = query(
        collection(db, 'gameSessions'),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(sessionsQuery);
      const sessions: GameSession[] = [];
      
      querySnapshot.forEach((doc) => {
        sessions.push(doc.data() as GameSession);
      });
      
      return sessions.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
    } catch (error) {
      console.error('Error getting game sessions:', error);
      throw error;
    }
  }

  async saveProgress(progressData: Omit<ProgressData, 'lastUpdated'>): Promise<void> {
    try {
      const progressRef = doc(db, 'progress', progressData.userId);
      await setDoc(progressRef, {
        ...progressData,
        lastUpdated: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  }

  async getProgress(userId: string): Promise<ProgressData | null> {
    try {
      const progressRef = doc(db, 'progress', userId);
      const progressSnap = await getDoc(progressRef);
      
      if (progressSnap.exists()) {
        return progressSnap.data() as ProgressData;
      }
      return null;
    } catch (error) {
      console.error('Error getting progress:', error);
      throw error;
    }
  }

  // Analytics and Insights
  async logFrustration(userId: string, level: number, context: string): Promise<void> {
    try {
      const frustrationRef = doc(collection(db, 'frustrationLogs'));
      await setDoc(frustrationRef, {
        userId,
        level,
        context,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging frustration:', error);
      throw error;
    }
  }

  async getUserStats(userId: string): Promise<any> {
    try {
      const [progress, sessions] = await Promise.all([
        this.getProgress(userId),
        this.getGameSessions(userId, 30)
      ]);

      // Calculate statistics
      const totalSessions = sessions.length;
      const totalPhonemes = sessions.reduce((sum, session) => sum + session.phonemesCompleted, 0);
      const totalErrors = sessions.reduce((sum, session) => sum + session.errorsCount, 0);
      const averageAccuracy = totalPhonemes > 0 ? ((totalPhonemes - totalErrors) / totalPhonemes) * 100 : 0;
      const averageSessionTime = sessions.reduce((sum, session) => sum + session.sessionDuration, 0) / totalSessions;

      return {
        progress,
        totalSessions,
        totalPhonemes,
        averageAccuracy: Math.round(averageAccuracy),
        averageSessionTime: Math.round(averageSessionTime),
        recentSessions: sessions.slice(0, 7)
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }
}

export const firebaseService = new FirebaseService();