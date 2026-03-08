import React, { useEffect, useState, createContext, useContext } from 'react';
export type UserRole = 'customer' | 'instructor' | 'staff' | 'admin' | 'student';
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}
interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<UserRole | undefined>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
import { authApi } from '../api';

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

  const login = async (email: string, password?: string): Promise<UserRole | undefined> => {
    try {
      // Mock Google or specific student behavior handling if password isn't passed
      if (!password) {
          const role = password as any || 'student';
          const seed = role === 'student' ? 'micah' : email;
          const mockUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            name: role === 'student' ? 'Little Artist' : email.split('@')[0],
            email,
            role: role as UserRole,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
          };
          setUser(mockUser);
          localStorage.setItem('editorial_user', JSON.stringify(mockUser));
          return role as UserRole;
      }

      const response = await authApi.login({ Email: email, Password: password });
      
      if (response.data && response.data.success) {
          const { userId, email: userEmail, fullName, accessToken, refreshToken } = response.data.data;
          
          // Decode JWT to get Role
          let role: UserRole = 'customer';
          try {
            const base64Url = accessToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decoded = JSON.parse(jsonPayload);
            const roleClaim = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded['role'] || decoded['Role'];
            if (roleClaim) {
                role = roleClaim.toLowerCase() as UserRole;
                if(roleClaim === 'Parent') role = 'customer'; // example mapping
            }
          } catch(e) {
             console.error('Failed to parse role from token', e);
          }

          const loggedInUser = {
              id: userId,
              name: fullName,
              email: userEmail,
              role: role,
              token: accessToken,
              refreshToken: refreshToken
          };

          setUser(loggedInUser as any);
          localStorage.setItem('editorial_user', JSON.stringify(loggedInUser));
          return role;
      } else {
          throw new Error(response.data?.message || 'Login failed');
      }
    } catch (error: any) {
        console.error("Login Error:", error);
        throw error;
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