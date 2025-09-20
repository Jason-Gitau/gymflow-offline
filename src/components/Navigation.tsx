import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  CreditCard, 
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Members', href: '/members', icon: Users },
  { name: 'Check-In', href: '/checkin', icon: UserCheck },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

export function Navigation() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavItems = ({ mobile = false }) => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => mobile && setMobileMenuOpen(false)}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300
              ${isActive 
                ? 'bg-gradient-primary text-white shadow-glow' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }
            `}
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{item.name}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex bg-card border-r border-border h-screen w-64 flex-col p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gradient-primary">
            FitFlow Gym
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Management System</p>
        </div>
        
        <div className="flex-1 space-y-2">
          <NavItems />
        </div>
        
        <div className="mt-auto pt-6 border-t border-border">
          <div className="text-xs text-muted-foreground">
            Offline Ready • PWA Enabled
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <header className="bg-card border-b border-border p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gradient-primary">FitFlow</h1>
          
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-6">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gradient-primary">
                  FitFlow Gym
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Management System</p>
              </div>
              
              <div className="space-y-2">
                <NavItems mobile />
              </div>
              
              <div className="mt-auto pt-6 border-t border-border absolute bottom-6 left-6 right-6">
                <div className="text-xs text-muted-foreground">
                  Offline Ready • PWA Enabled
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </header>
      </div>
    </>
  );
}