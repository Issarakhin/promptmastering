import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '../config';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  points: number;
}

export interface UserBadge {
  userId: string;
  badgeId: string;
  badgeName: string;
  awardedAt: Date;
  description: string;
  icon: string;
}

// Get all available badges
export async function getAllBadges(): Promise<Badge[]> {
  const snapshot = await getDocs(collection(db, 'badges'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Badge));
}

// Get user's earned badges
export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const q = query(
    collection(db, 'userBadges'),
    where('userId', '==', userId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as UserBadge);
}

// Award a badge to user
export async function awardBadge(userId: string, badgeId: string): Promise<void> {
  const badgeRef = doc(db, 'userBadges', `${userId}_${badgeId}`);
  const badgeDoc = await getDoc(badgeRef);

  // Check if user already has this badge
  if (badgeDoc.exists()) {
    return; // Already awarded
  }

  // Get badge details
  const badgeDetailsRef = doc(db, 'badges', badgeId);
  const badgeDetailsDoc = await getDoc(badgeDetailsRef);

  if (!badgeDetailsDoc.exists()) {
    throw new Error('Badge not found');
  }

  const badgeDetails = badgeDetailsDoc.data() as Badge;

  // Award the badge
  await setDoc(badgeRef, {
    userId,
    badgeId,
    badgeName: badgeDetails.name,
    description: badgeDetails.description,
    icon: badgeDetails.icon,
    awardedAt: new Date()
  });

  // Update user stats
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    totalBadges: increment(1),
    totalPoints: increment(badgeDetails.points)
  });
}

// Check and award badges based on progress
export async function checkAndAwardBadges(userId: string): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    return;
  }

  const userData = userDoc.data();

  // Check for "First Steps" badge (complete 1 course)
  if (userData.coursesCompleted >= 1) {
    await awardBadge(userId, 'first_steps');
  }

  // Check for "Dedicated Learner" badge (complete 5 courses)
  if (userData.coursesCompleted >= 5) {
    await awardBadge(userId, 'dedicated_learner');
  }

  // Check for "Master Prompter" badge (complete all advanced courses)
  const advancedCoursesQuery = query(
    collection(db, 'courses'),
    where('difficulty', '==', 'advanced')
  );
  const advancedCoursesSnapshot = await getDocs(advancedCoursesQuery);
  const totalAdvancedCourses = advancedCoursesSnapshot.size;

  const completedAdvancedQuery = query(
    collection(db, 'userProgress'),
    where('userId', '==', userId),
    where('completed', '==', true)
  );
  const completedAdvancedSnapshot = await getDocs(completedAdvancedQuery);
  
  const completedAdvancedCourses = completedAdvancedSnapshot.docs.filter(doc => {
    const courseId = doc.data().courseId;
    return advancedCoursesSnapshot.docs.some(c => c.id === courseId);
  });

  if (completedAdvancedCourses.length >= totalAdvancedCourses && totalAdvancedCourses > 0) {
    await awardBadge(userId, 'master_prompter');
  }
}

// Check if user has a specific badge
export async function hasBadge(userId: string, badgeId: string): Promise<boolean> {
  const badgeRef = doc(db, 'userBadges', `${userId}_${badgeId}`);
  const badgeDoc = await getDoc(badgeRef);
  return badgeDoc.exists();
}

// Get badge progress (how close user is to earning badges)
export async function getBadgeProgress(userId: string): Promise<{
  badgeId: string;
  badgeName: string;
  progress: number;
  requirement: string;
  earned: boolean;
}[]> {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    return [];
  }

  const userData = userDoc.data();
  const allBadges = await getAllBadges();
  const userBadges = await getUserBadges(userId);
  const earnedBadgeIds = userBadges.map(b => b.badgeId);

  return allBadges.map(badge => {
    let progress = 0;
    const earned = earnedBadgeIds.includes(badge.id);

    // Calculate progress based on badge type
    if (badge.id === 'first_steps') {
      progress = Math.min((userData.coursesCompleted / 1) * 100, 100);
    } else if (badge.id === 'dedicated_learner') {
      progress = Math.min((userData.coursesCompleted / 5) * 100, 100);
    } else if (badge.id === 'perfect_score') {
      progress = earned ? 100 : 0; // Binary - either earned or not
    }

    return {
      badgeId: badge.id,
      badgeName: badge.name,
      progress: Math.round(progress),
      requirement: badge.requirement,
      earned
    };
  });
}
