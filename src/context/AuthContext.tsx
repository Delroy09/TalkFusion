
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { User, ApiKeys } from '@/types';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextProps {
  user: User | null;
  apiKeys: ApiKeys;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateApiKeys: (keys: Partial<ApiKeys>) => Promise<void>;
  session: Session | null;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeys>({});
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession?.user) {
          setUser({
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            name: currentSession.user.user_metadata.name as string || undefined,
          });
          
          // Fetch API keys when user is authenticated
          fetchApiKeys(currentSession.user.id);
        } else {
          setUser(null);
          setApiKeys({});
        }
        
        setIsLoading(false);
      }
    );

    // Then check for an existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      
      if (currentSession?.user) {
        setUser({
          id: currentSession.user.id,
          email: currentSession.user.email || '',
          name: currentSession.user.user_metadata.name as string || undefined,
        });
        
        // Fetch API keys when user is authenticated
        fetchApiKeys(currentSession.user.id);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchApiKeys = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching API keys:', error);
        return;
      }

      if (data) {
        // Set the API keys in the edge function's environment
        if (data.openai_key) {
          await supabase.functions.invoke('chat-ai', {
            body: { 
              action: 'set-key', 
              key: 'OPENAI_API_KEY', 
              value: data.openai_key 
            },
          }).catch(err => console.error('Failed to set OpenAI key:', err));
        }
        
        if (data.google_key) {
          await supabase.functions.invoke('chat-ai', {
            body: { 
              action: 'set-key', 
              key: 'GOOGLE_API_KEY', 
              value: data.google_key 
            },
          }).catch(err => console.error('Failed to set Google key:', err));
        }
        
        if (data.anthropic_key) {
          await supabase.functions.invoke('chat-ai', {
            body: { 
              action: 'set-key', 
              key: 'ANTHROPIC_API_KEY', 
              value: data.anthropic_key 
            },
          }).catch(err => console.error('Failed to set Anthropic key:', err));
        }

        setApiKeys({
          openai: data.openai_key || undefined,
          google: data.google_key || undefined,
          anthropic: data.anthropic_key || undefined,
        });
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Pass through the original error message for specific handling
        throw error;
      }
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      
      navigate('/chat');
    } catch (error: any) {
      console.error('Error signing in:', error);
      
      // Ensure the original error message is passed up
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: window.location.origin + '/auth?mode=sign-in',
        },
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Account created",
        description: "Please check your email to confirm your account.",
      });
      
      navigate('/auth?mode=sign-in');
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast({
        title: "Sign up failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // User and session state will be updated by the onAuthStateChange listener
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign out failed",
        description: error.message || "An error occurred while signing out.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateApiKeys = async (keys: Partial<ApiKeys>) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Check if an API key entry already exists for the user
      const { data: existingKeys } = await supabase
        .from('api_keys')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      // Prepare the update data
      const updateData = {
        openai_key: keys.openai !== undefined ? keys.openai : apiKeys.openai,
        google_key: keys.google !== undefined ? keys.google : apiKeys.google,
        anthropic_key: keys.anthropic !== undefined ? keys.anthropic : apiKeys.anthropic,
        updated_at: new Date().toISOString(),
      };
      
      if (existingKeys) {
        // Update existing keys
        const { error } = await supabase
          .from('api_keys')
          .update(updateData)
          .eq('id', existingKeys.id);
        
        if (error) throw error;
      } else {
        // Insert new keys
        const { error } = await supabase
          .from('api_keys')
          .insert({
            user_id: user.id,
            ...updateData
          });
        
        if (error) throw error;
      }
      
      // Update local state
      const updatedKeys = { ...apiKeys, ...keys };
      setApiKeys(updatedKeys);
      
      // Set the API keys in the edge function environment
      if (keys.openai !== undefined) {
        await supabase.functions.invoke('chat-ai', {
          body: { 
            action: 'set-key', 
            key: 'OPENAI_API_KEY', 
            value: keys.openai || '' 
          },
        }).catch(err => console.error('Failed to set OpenAI key:', err));
      }
      
      if (keys.google !== undefined) {
        await supabase.functions.invoke('chat-ai', {
          body: { 
            action: 'set-key', 
            key: 'GOOGLE_API_KEY', 
            value: keys.google || '' 
          },
        }).catch(err => console.error('Failed to set Google key:', err));
      }
      
      if (keys.anthropic !== undefined) {
        await supabase.functions.invoke('chat-ai', {
          body: { 
            action: 'set-key', 
            key: 'ANTHROPIC_API_KEY', 
            value: keys.anthropic || '' 
          },
        }).catch(err => console.error('Failed to set Anthropic key:', err));
      }
      
      toast({
        title: "API keys updated",
        description: "Your API keys have been successfully updated.",
      });
    } catch (error: any) {
      console.error('Error updating API keys:', error);
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating your API keys.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        apiKeys,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateApiKeys,
        session,
      }}
    >
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
