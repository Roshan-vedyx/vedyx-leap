import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Types for your literacy app
interface Unit {
  id: string;
  title: string;
  description: string;
  estimatedDuration: number;
  unlockable: boolean;
  coverImage?: string;
  components: ComponentRef[];
}

interface ComponentRef {
  type: 'story' | 'game' | 'ruleCard' | 'scenario';
  ref: string;
}

interface BaseComponent {
  id: string;
  type: string;
}

interface StoryComponent extends BaseComponent {
  type: 'story';
  title: string;
  text: string[];
  audioUrls?: string[];
  illustrations?: string[];
}

interface GameComponent extends BaseComponent {
  type: 'game';
  gameType: 'syllableTap' | 'dragSpelling' | 'phonemeMatch';
  prompt: string;
  words: string[];
  phonemes?: string[][];
  audioMap?: Record<string, string>;
}

interface RuleCardComponent extends BaseComponent {
  type: 'ruleCard';
  title: string;
  body: string;
  visual?: string;
  examplePairs?: { before: string; after: string; }[];
}

interface ScenarioComponent extends BaseComponent {
  type: 'scenario';
  situation: string;
  options: { text: string; correct: boolean; }[];
  feedback: { correct: string; incorrect: string; };
}

type Component = StoryComponent | GameComponent | RuleCardComponent | ScenarioComponent;

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

  // Unit and Component Management
  async getUnits(): Promise<Unit[]> {
    try {
      const unitsQuery = query(collection(db, 'units'));
      const querySnapshot = await getDocs(unitsQuery);
      const units: Unit[] = [];
      
      querySnapshot.forEach((doc) => {
        units.push({ id: doc.id, ...doc.data() } as Unit);
      });
      
      return units;
    } catch (error) {
      console.error('Error getting units:', error);
      throw error;
    }
  }

  async getUnit(unitId: string): Promise<Unit | null> {
    try {
      const unitRef = doc(db, 'units', unitId);
      const unitSnap = await getDoc(unitRef);
      
      if (unitSnap.exists()) {
        return { id: unitSnap.id, ...unitSnap.data() } as Unit;
      }
      return null;
    } catch (error) {
      console.error('Error fetching unit:', error);
      throw error;
    }
  }

  async getComponent(componentId: string): Promise<Component | null> {
    try {
      const componentRef = doc(db, 'components', componentId);
      const componentSnap = await getDoc(componentRef);
      
      if (componentSnap.exists()) {
        return { id: componentSnap.id, ...componentSnap.data() } as Component;
      }
      return null;
    } catch (error) {
      console.error('Error fetching component:', error);
      throw error;
    }
  }

  async getUnitWithComponents(unitId: string): Promise<{ unit: Unit; components: Component[] }> {
    try {
      const unit = await this.getUnit(unitId);
      if (!unit) {
        throw new Error(`Unit ${unitId} not found`);
      }

      const components: Component[] = [];
      
      for (const componentRef of unit.components) {
        // Extract component ID from ref (e.g., "components/story-bake-sale" -> "story-bake-sale")
        const componentId = componentRef.ref.split('/')[1];
        const component = await this.getComponent(componentId);
        if (component) {
          components.push(component);
        }
      }

      return { unit, components };
    } catch (error) {
      console.error('Error getting unit with components:', error);
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

// Export functions for backwards compatibility
export const getUnits = () => firebaseService.getUnits();
export const getUnitWithComponents = (unitId: string) => firebaseService.getUnitWithComponents(unitId);