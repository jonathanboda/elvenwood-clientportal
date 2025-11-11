// Demo authentication for testing without Supabase
// Replace this with real Supabase auth when you have credentials

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: 'designer' | 'client';
}

const DEMO_USERS = {
  'designer@example.com': {
    id: 'designer-1',
    email: 'designer@example.com',
    name: 'John Designer',
    role: 'designer' as const,
    password: 'password123'
  },
  'client@example.com': {
    id: 'client-1',
    email: 'client@example.com',
    name: 'Jane Client',
    role: 'client' as const,
    password: 'password123'
  }
};

const STORAGE_KEY = 'elvenwood_user';

export const demoAuth = {
  // Sign in with demo credentials
  signIn: async (email: string, password: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = DEMO_USERS[email as keyof typeof DEMO_USERS];

    if (!user) {
      throw new Error('User not found. Try: designer@example.com or client@example.com');
    }

    if (user.password !== password) {
      throw new Error('Invalid password. Password is: password123');
    }

    // Store in localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

    return { user };
  },

  // Sign up
  signUp: async (email: string, password: string, name: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (DEMO_USERS[email as keyof typeof DEMO_USERS]) {
      throw new Error('User already exists');
    }

    const newUser: DemoUser = {
      id: `user-${Date.now()}`,
      email,
      name,
      role: 'designer', // Default to designer
    };

    // Store in localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));

    return { user: newUser };
  },

  // Get current user
  getCurrentUser: () => {
    if (typeof window === 'undefined') return null;

    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  // Sign out
  signOut: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  },

  // Check if logged in
  isLoggedIn: () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(STORAGE_KEY);
  }
};
