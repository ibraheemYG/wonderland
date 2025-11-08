'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
  name: string;
  email?: string;
  phone?: string;
  country?: string;
  furniturePreferences?: string[];
  googleAuth?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  googleLogin: (userData: Partial<User>) => void;
  logout: () => void;
  isAdmin: () => boolean;
  addAdmin: (email: string) => boolean;
  removeAdmin: (email: string) => boolean;
  getAdminList: () => string[];
  getAllUsers: () => User[];
}

// قائمة الأدمن الافتراضية
const DEFAULT_ADMINS = ['ibraheem2016b@gmail.com'];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminList, setAdminList] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wonderland_admins');
      if (stored) {
        return JSON.parse(stored);
      }
    }
    return DEFAULT_ADMINS;
  });

  // حفظ قائمة الأدمن
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wonderland_admins', JSON.stringify(adminList));
    }
  }, [adminList]);

  // تحميل الجلسة من localStorage عند بدء التطبيق
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const googleLogin = (userData: Partial<User>) => {
    // التحقق من كون المستخدم أدمن
    const isUserAdmin = userData.email && adminList.includes(userData.email);
    
    const newUser: User = {
      id: userData.id || Math.floor(Math.random() * 10000),
      username: userData.username || userData.email?.split('@')[0] || 'google-user',
      role: isUserAdmin ? 'admin' : (userData.role || 'user'),
      name: userData.name || '',
      email: userData.email,
      phone: userData.phone,
      country: userData.country,
      furniturePreferences: userData.furniturePreferences,
      googleAuth: true,
    };

    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    // حفظ المستخدم في قائمة جميع المستخدمين
    const allUsers = getAllUsers();
    const existingIndex = allUsers.findIndex(u => u.email === newUser.email);
    if (existingIndex >= 0) {
      allUsers[existingIndex] = newUser;
    } else {
      allUsers.push(newUser);
    }
    localStorage.setItem('wonderland_all_users', JSON.stringify(allUsers));
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const addAdmin = (email: string): boolean => {
    if (!isAdmin()) return false;
    if (!adminList.includes(email)) {
      setAdminList([...adminList, email]);
      // تحديث دور المستخدم إذا كان موجودًا
      const allUsers = getAllUsers();
      const userIndex = allUsers.findIndex(u => u.email === email);
      if (userIndex >= 0) {
        allUsers[userIndex].role = 'admin';
        localStorage.setItem('wonderland_all_users', JSON.stringify(allUsers));
      }
      return true;
    }
    return false;
  };

  const removeAdmin = (email: string): boolean => {
    if (!isAdmin()) return false;
    if (email === DEFAULT_ADMINS[0]) return false; // لا يمكن حذف الأدمن الرئيسي
    setAdminList(adminList.filter(e => e !== email));
    // تحديث دور المستخدم
    const allUsers = getAllUsers();
    const userIndex = allUsers.findIndex(u => u.email === email);
    if (userIndex >= 0) {
      allUsers[userIndex].role = 'user';
      localStorage.setItem('wonderland_all_users', JSON.stringify(allUsers));
    }
    return true;
  };

  const getAdminList = (): string[] => {
    return adminList;
  };

  const getAllUsers = (): User[] => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wonderland_all_users');
      if (stored) {
        return JSON.parse(stored);
      }
    }
    return [];
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      googleLogin, 
      logout, 
      isAdmin, 
      addAdmin, 
      removeAdmin, 
      getAdminList, 
      getAllUsers 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
