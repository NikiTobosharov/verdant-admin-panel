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

// Helper functions for cookies
export function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}
export function getCookie(name: string) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : '';
}
export function deleteCookie(name: string) {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user info from backend
  const fetchUserInfo = async () => {
    const token = getCookie('jwtToken');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch('/app/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const data = await res.json();
      setUser({
        username: data.user.phone,
        name: data.user.name,
        role: data.user.privilege_level === 1
          ? 'super admin'
          : data.user.privilege_level === 2
            ? 'moderator'
            : 'client',
      });
      setIsLoading(false);
    } catch {
      setUser(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const login = async (phone: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const res = await fetch('/app/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      });
      if (!res.ok) {
        toast.error("Invalid credentials");
        setIsLoading(false);
        return false;
      }
      const data = await res.json();
      if (data.token) {
        setCookie('jwtToken', data.token, 7);
        await fetchUserInfo();
        toast.success("Login successful!");
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
    deleteCookie('jwtToken');
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
