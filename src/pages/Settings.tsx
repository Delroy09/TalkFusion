
import { useState } from 'react';
import { Header } from '@/components/Header';
import { ApiKeyForm } from '@/components/ApiKeyForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Key, Shield, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newName, setNewName] = useState(user?.name || '');
  const [currentSection, setCurrentSection] = useState<'account' | 'apikeys' | 'security'>('apikeys');
  
  if (!user) {
    navigate('/auth?mode=sign-in');
    return null;
  }
  
  const updateName = () => {
    // In a real app, this would update the user's name in the database
    toast({
      title: "Name updated",
      description: "Your name has been updated successfully.",
    });
  };
  
  const sections = [
    {
      id: 'account',
      title: 'Account',
      icon: User,
    },
    {
      id: 'apikeys',
      title: 'API Keys',
      icon: Key,
    },
    {
      id: 'security',
      title: 'Security',
      icon: Shield,
    },
  ];
  
  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mr-2">
              <ArrowLeft size={16} className="mr-1" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="glass-morphism rounded-lg p-4">
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setCurrentSection(section.id as any)}
                      className={cn(
                        "flex items-center w-full p-2 rounded-md transition-colors",
                        currentSection === section.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      )}
                    >
                      <section.icon size={18} className="mr-2" />
                      <span>{section.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
            
            {/* Main content */}
            <div className="md:col-span-3">
              {currentSection === 'account' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account details and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Profile Information</h3>
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="Your name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={user.email}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                          Your email address cannot be changed
                        </p>
                      </div>
                      <Button onClick={updateName}>
                        Update Profile
                      </Button>
                    </div>
                    
                    <div className="space-y-4 pt-6 border-t">
                      <h3 className="text-lg font-medium">Account Actions</h3>
                      <div className="flex flex-col space-y-2">
                        <Button 
                          variant="destructive" 
                          onClick={() => {
                            signOut();
                            navigate('/');
                          }}
                        >
                          Sign Out
                        </Button>
                        <Button
                          variant="outline"
                          className="border-destructive text-destructive"
                          onClick={() => {
                            toast({
                              title: "This is a demo",
                              description: "Account deletion is not implemented in this demo.",
                            });
                          }}
                        >
                          <AlertTriangle size={16} className="mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {currentSection === 'apikeys' && (
                <ApiKeyForm />
              )}
              
              {currentSection === 'security' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your account security and password
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Change Password</h3>
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                        />
                      </div>
                      <Button onClick={() => {
                        toast({
                          title: "This is a demo",
                          description: "Password change is not implemented in this demo.",
                        });
                      }}>
                        Change Password
                      </Button>
                    </div>
                    
                    <div className="space-y-4 pt-6 border-t">
                      <h3 className="text-lg font-medium">API Key Security</h3>
                      <p className="text-sm text-muted-foreground">
                        Your API keys are stored securely in your browser's local storage.
                        They are never sent to our servers and are only used to make requests
                        directly from your browser to the AI service providers.
                      </p>
                      <div className="flex items-center p-4 rounded-md bg-muted">
                        <Shield className="h-5 w-5 mr-2 text-primary" />
                        <span className="text-sm">Your data is encrypted and stored locally</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
