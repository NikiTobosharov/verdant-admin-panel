
import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  FileText, 
  Users, 
  Bell,
  User,
  LogOut,
  Menu,
  X,
  UserCog
} from 'lucide-react';

type SidebarItem = {
  name: string;
  icon: React.ElementType;
  path: string;
};

const sidebarItems: SidebarItem[] = [
  {
    name: 'Documents',
    icon: FileText,
    path: '/dashboard',
  },
  {
    name: 'Events',
    icon: Calendar,
    path: '/dashboard/events',
  },
  {
    name: 'Notifications',
    icon: Bell,
    path: '/dashboard/notifications',
  },
  {
    name: 'Clients',
    icon: Users,
    path: '/dashboard/clients',
  },
  {
    name: 'Admin',
    icon: UserCog,
    path: '/dashboard/admin',
  },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const { nickname } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white shadow-md"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Sidebar */}
      <aside 
        className={`bg-admin-green text-white fixed inset-y-0 left-0 transform 
                   ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                   lg:translate-x-0 transition-transform duration-300 ease-in-out 
                   lg:static w-64 min-h-screen overflow-y-auto z-40`}
      >
        <div className="px-4 py-6 border-b border-white/20 flex items-center justify-center">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        
        <div className="p-4">
          <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg mb-6">
            <div className="bg-white text-admin-green p-2 rounded-full">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">{nickname || user?.name || 'User'}</p>
              <p className="text-sm text-white/70">{user?.role || 'Role'}</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.name}
                className={`admin-sidebar-item w-full ${
                  location.pathname === item.path ? 'active' : ''
                }`}
                onClick={() => {
                  navigate(item.path);
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button 
            onClick={handleLogout}
            className="admin-sidebar-item w-full"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Overlay for mobile when sidebar is open */}
          <div 
            className={`fixed inset-0 bg-black/50 z-30 lg:hidden ${
              sidebarOpen ? 'block' : 'hidden'
            }`}
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Page content */}
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
