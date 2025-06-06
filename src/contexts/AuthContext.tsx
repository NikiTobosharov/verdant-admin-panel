import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "sonner";

type User = {
  username: string;
  name: string;
  role: string;
  password?: string; // Add password for privilege checks
};

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('adminUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const res = await fetch('/app/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${username}:${password}`),
        },
        body: JSON.stringify({ phone: username }),
      });
      if (!res.ok) {
        toast.error("Invalid credentials");
        setIsLoading(false);
        return false;
      }
      const data = await res.json();
      if (data.token) {
        const userObj = {
          username,
          name: username,
          role: data.role || 'user',
        };
        setUser(userObj);
        localStorage.setItem('adminUser', JSON.stringify(userObj));
        localStorage.setItem('jwtToken', data.token);
        toast.success("Login successful!");
        setIsLoading(false);
        return true;
      }
      toast.error("Invalid credentials");
      setIsLoading(false);
      return false;
    } catch (err) {
      toast.error("Login failed");
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('adminUser');
    toast.info("You've been logged out");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
