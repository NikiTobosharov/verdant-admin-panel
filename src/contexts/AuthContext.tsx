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

// Mock users data - in a real app, this would come from a backend
const mockUsers = [
  { username: 'admin', password: 'admin123', name: 'Admin User', role: 'admin' },
  { username: 'manager', password: 'manager123', name: 'Manager User', role: 'manager' }
];

// Add a function to get JWT from backend on login (pseudo-implementation)
async function getJwtToken(username: string, password: string): Promise<string | null> {
  // Replace this with your actual backend call
  // Example:
  // const res = await fetch('/auth', { ... });
  // const data = await res.json();
  // return data.token;
  return localStorage.getItem('jwtToken'); // fallback for now
}

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

    // If logging in as Super Admin, call backend /auth endpoint
    if (username === 'Super Admin' && password === 'V6Fe_3qSt_B2R0_zf') {
      try {
        const res = await fetch('/app/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${username}:${password}`),
          },
          body: JSON.stringify({ phone: '+359876747645' }),
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
            role: 'super admin',
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
    }

    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const foundUser = mockUsers.find(
      u => u.username === username && u.password === password
    );
    
    if (foundUser) {
      // Store password in user object for DataContext privilege check
      const userWithPassword = { ...foundUser };
      setUser(userWithPassword);
      localStorage.setItem('adminUser', JSON.stringify(userWithPassword));
      // Get JWT token from backend and store it
      const jwt = await getJwtToken(username, password);
      if (jwt) localStorage.setItem('jwtToken', jwt);
      toast.success("Login successful!");
      setIsLoading(false);
      return true;
    } else {
      toast.error("Invalid username or password");
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
