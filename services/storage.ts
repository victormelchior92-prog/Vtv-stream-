
import { User, Content, Category, UserStatus, PlanType, Suggestion, DesignAsset } from '../types';

// Keys
const USERS_KEY = 'vtv_users';
const CONTENT_KEY = 'vtv_content';
const CATEGORIES_KEY = 'vtv_categories';
const THEME_KEY = 'vtv_theme';
const SUGGESTIONS_KEY = 'vtv_suggestions';
const DESIGN_ASSETS_KEY = 'vtv_design_assets';
const COMMUNITY_LINK_KEY = 'vtv_community_link';

// Helpers
const get = <T>(key: string, fallback: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : fallback;
};

const set = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// API
export const storageService = {
  getUsers: (): User[] => get<User[]>(USERS_KEY, []),
  
  getUserByEmail: (email: string): User | undefined => {
    const users = get<User[]>(USERS_KEY, []);
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  addUser: (user: User) => {
    const users = get<User[]>(USERS_KEY, []);
    users.push(user);
    set(USERS_KEY, users);
  },

  updateUser: (updatedUser: User) => {
    const users = get<User[]>(USERS_KEY, []);
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      set(USERS_KEY, users);
    }
  },
  
  getContent: (): Content[] => get<Content[]>(CONTENT_KEY, []),
  addContent: (item: Content) => {
    const content = get<Content[]>(CONTENT_KEY, []);
    content.push(item);
    set(CONTENT_KEY, content);
  },
  updateContent: (item: Content) => {
    const content = get<Content[]>(CONTENT_KEY, []);
    const idx = content.findIndex(c => c.id === item.id);
    if(idx !== -1) {
        content[idx] = item;
        set(CONTENT_KEY, content);
    }
  },
  deleteContent: (id: string) => {
    let content = get<Content[]>(CONTENT_KEY, []);
    content = content.filter(c => c.id !== id);
    set(CONTENT_KEY, content);
  },

  getCategories: (): Category[] => get<Category[]>(CATEGORIES_KEY, []),
  addCategory: (category: Category) => {
    const cats = get<Category[]>(CATEGORIES_KEY, []);
    cats.push(category);
    set(CATEGORIES_KEY, cats);
  },
  deleteCategory: (id: string) => {
    let cats = get<Category[]>(CATEGORIES_KEY, []);
    cats = cats.filter(c => c.id !== id);
    set(CATEGORIES_KEY, cats);
  },

  getSuggestions: (): Suggestion[] => get<Suggestion[]>(SUGGESTIONS_KEY, []),
  addSuggestion: (suggestion: Suggestion) => {
    const list = get<Suggestion[]>(SUGGESTIONS_KEY, []);
    list.push(suggestion);
    set(SUGGESTIONS_KEY, list);
  },
  updateSuggestion: (updated: Suggestion) => {
    const list = get<Suggestion[]>(SUGGESTIONS_KEY, []);
    const idx = list.findIndex(s => s.id === updated.id);
    if (idx !== -1) {
        list[idx] = updated;
        set(SUGGESTIONS_KEY, list);
    }
  },
  deleteSuggestion: (id: string) => {
    let list = get<Suggestion[]>(SUGGESTIONS_KEY, []);
    list = list.filter(s => s.id !== id);
    set(SUGGESTIONS_KEY, list);
  },

  getDesignAssets: (): DesignAsset[] => get<DesignAsset[]>(DESIGN_ASSETS_KEY, []),
  addDesignAsset: (asset: DesignAsset) => {
    const assets = get<DesignAsset[]>(DESIGN_ASSETS_KEY, []);
    assets.push(asset);
    set(DESIGN_ASSETS_KEY, assets);
  },
  deleteDesignAsset: (id: string) => {
    let assets = get<DesignAsset[]>(DESIGN_ASSETS_KEY, []);
    assets = assets.filter(a => a.id !== id);
    set(DESIGN_ASSETS_KEY, assets);
  },

  getTheme: () => get<string>(THEME_KEY, 'DEFAULT'),
  setTheme: (theme: string) => set(THEME_KEY, theme),

  getCommunityLink: () => get<string>(COMMUNITY_LINK_KEY, ''),
  setCommunityLink: (url: string) => set(COMMUNITY_LINK_KEY, url),
};
