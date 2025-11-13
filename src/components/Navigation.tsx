import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { Shield, LayoutDashboard, Settings, FileText, LogOut, User, Target, AlertTriangle, Bug } from 'lucide-react';

const Navigation = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/firewall', icon: Settings, label: 'Firewall' },
    { to: '/logs', icon: FileText, label: 'Logs' },
    { to: '/signatures', icon: Shield, label: 'Signatures' },
    { to: '/patterns', icon: Target, label: 'IOCs' },
    { to: '/incidents', icon: AlertTriangle, label: 'Incidents' },
    { to: '/vulnerabilities', icon: Bug, label: 'CVEs' },
  ];

  return (
    <nav className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold">CyberSecure Portal</h1>
          </div>
          
          <div className="flex space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <User className="h-4 w-4" />
            <span>{user?.username}</span>
            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
              {user?.role}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;