
export enum PlanType {
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
}

export enum UserStatus {
  GUEST = 'GUEST',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'INFO' | 'WARNING' | 'SUCCESS';
}

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  profileImage?: string; // Added profile image
  status: UserStatus;
  plan?: PlanType;
  paymentProof?: string;
  dateJoined: string;
  subscriptionStart?: string; // Date début
  subscriptionEnd?: string;   // Date fin (Calculé +30 jours)
  notifications?: Notification[]; // Messages reçus
}

export interface Actor {
  name: string;
  imageUrl?: string;
}

export interface Episode {
  id: string;
  title: string;
  videoUrl: string;
  duration?: string;
}

export interface Content {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  videoUrl?: string;
  trailerUrl?: string;
  cast: Actor[]; 
  genres: string[];
  rating: string;
  releaseYear: string;
  type: 'MOVIE' | 'SERIES' | 'DOCUMENTARY' | 'ANIME' | 'OTHER';
  episodes?: Episode[];
  categoryId?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Suggestion {
  id: string;
  userId: string;
  userName: string;
  movieName: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface DesignAsset {
  id: string;
  url: string;
  name: string;
  type: 'BACKGROUND' | 'LOGO' | 'OTHER';
}

export interface AppState {
  currentUser: User | null;
  isAdmin: boolean;
  theme: 'DEFAULT' | 'CHRISTMAS' | 'HALLOWEEN' | 'NEW_YEAR' | 'VALENTINE';
}

export const ADMIN_EMAIL = "victormelchior92@gmail.com";
export const ADMIN_PIN = "2008";

export const PLANS = {
  [PlanType.BASIC]: { price: "5 500 FCA", name: "Basic" },
  [PlanType.STANDARD]: { price: "10 500 FCA", name: "Standard" },
  [PlanType.PREMIUM]: { price: "15 000 FCA", name: "Premium" },
};

export const PAYMENT_NUMBER = "+241 07 40 87 064";
