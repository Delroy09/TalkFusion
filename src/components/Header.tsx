
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Settings, LogOut, MessageSquare, Home } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-morphism">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-primary font-bold text-xl">AI Fusion</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`flex items-center space-x-1 ${isActive('/') ? 'text-primary font-medium' : 'text-foreground/70 hover:text-foreground transition-colors'}`}
            >
              <Home size={18} />
              <span>Home</span>
            </Link>
            
            {user && (
              <Link 
                to="/chat" 
                className={`flex items-center space-x-1 ${isActive('/chat') ? 'text-primary font-medium' : 'text-foreground/70 hover:text-foreground transition-colors'}`}
              >
                <MessageSquare size={18} />
                <span>Chat</span>
              </Link>
            )}
            
            {user && (
              <Link 
                to="/settings" 
                className={`flex items-center space-x-1 ${isActive('/settings') ? 'text-primary font-medium' : 'text-foreground/70 hover:text-foreground transition-colors'}`}
              >
                <Settings size={18} />
                <span>Settings</span>
              </Link>
            )}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full h-8 w-8 bg-primary/10">
                    <span className="font-medium text-sm text-primary">
                      {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <div className="text-sm font-medium">{user.name || user.email}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="w-full cursor-pointer">
                      <Settings size={16} className="mr-2" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                    <LogOut size={16} className="mr-2" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10 hover:text-primary">
                  <Link to="/auth?mode=sign-in">Sign in</Link>
                </Button>
                <Button size="sm" asChild className="bg-primary hover:bg-primary/90">
                  <Link to="/auth?mode=sign-up">Sign up</Link>
                </Button>
              </div>
            )}
          </nav>
          
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-2 animate-fade-in">
            <div className="flex flex-col space-y-3 pb-3">
              <Link 
                to="/" 
                className={`flex items-center space-x-1 px-2 py-2 rounded-md ${isActive('/') ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/70 hover:bg-accent hover:text-foreground transition-colors'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home size={18} />
                <span>Home</span>
              </Link>
              
              {user && (
                <Link 
                  to="/chat" 
                  className={`flex items-center space-x-1 px-2 py-2 rounded-md ${isActive('/chat') ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/70 hover:bg-accent hover:text-foreground transition-colors'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MessageSquare size={18} />
                  <span>Chat</span>
                </Link>
              )}
              
              {user && (
                <Link 
                  to="/settings" 
                  className={`flex items-center space-x-1 px-2 py-2 rounded-md ${isActive('/settings') ? 'bg-primary/10 text-primary font-medium' : 'text-foreground/70 hover:bg-accent hover:text-foreground transition-colors'}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </Link>
              )}
              
              {user ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => { 
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center space-x-1"
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </Button>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Button variant="outline" size="sm" asChild className="hover:bg-primary/10 hover:text-primary">
                    <Link to="/auth?mode=sign-in" onClick={() => setMobileMenuOpen(false)}>
                      Sign in
                    </Link>
                  </Button>
                  <Button size="sm" asChild className="bg-primary hover:bg-primary/90">
                    <Link to="/auth?mode=sign-up" onClick={() => setMobileMenuOpen(false)}>
                      Sign up
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
