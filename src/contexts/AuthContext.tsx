import React, { useEffect, useState, createContext, useContext } from 'react';
import { authApi } from '../api';
export type UserRole = 'customer' | 'instructor' | 'staff' | 'admin' | 'student';
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  token?: string;
}
interface AuthContextType {
  user: User | null;
  login: (email: string, role?: UserRole, password?: string) => Promise<void>;
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
  const login = async (email: string, role?: UserRole, password?: string) => {
    if (password) {
      try {
        const response = await authApi.login({ email, password });
        // NestJS TransformInterceptor wraps response in { data: ... }
        const actualData = response.data.data ? response.data.data : response.data;
        const { user: data, accessToken: token } = actualData;
        const roleName = data.role?.roleName?.toLowerCase() || 'customer';
        
        const realUser: User = {
          id: data.userId,
          name: data.fullName,
          email: data.email,
          role: roleName as UserRole,
          token: token,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`
        };
        setUser(realUser);
        localStorage.setItem('editorial_user', JSON.stringify(realUser));
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    } else {
      // Mock login - in production this would verify credentials
      const fallbackRole = role || 'customer';
      const seed = fallbackRole === 'student' ? 'micah' : email;
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: fallbackRole === 'student' ? 'Little Artist' : email.split('@')[0],
        email,
        role: fallbackRole,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
      };
      setUser(mockUser);
      localStorage.setItem('editorial_user', JSON.stringify(mockUser));
    }
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