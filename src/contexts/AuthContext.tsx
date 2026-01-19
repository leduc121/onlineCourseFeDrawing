import React, { useEffect, useState, createContext, useContext } from 'react';
export type UserRole = 'customer' | 'instructor' | 'staff' | 'admin';
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}
interface AuthContextType {
  user: User | null;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Check local storage for existing session
    const storedUser = localStorage.getItem('editorial_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);
  const login = (email: string, role: UserRole) => {
    // Mock login - in production this would verify credentials
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email,
      role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
    };
    setUser(mockUser);
    localStorage.setItem('editorial_user', JSON.stringify(mockUser));
  };
  const logout = () => {
    setUser(null);
    localStorage.removeItem('editorial_user');
  };
  return <AuthContext.Provider value={{
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading
  }}>
      {children}
    </AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}