
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignInFormValues = z.infer<typeof signInSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn, signUp, isLoading } = useAuth();
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [resendingEmail, setResendingEmail] = useState<boolean>(false);
  const [resendEmail, setResendEmail] = useState<string | null>(null);
  
  const searchParams = new URLSearchParams(location.search);
  const modeParam = searchParams.get('mode');
  
  useEffect(() => {
    if (user) {
      navigate('/chat');
    }
    
    if (modeParam === 'sign-in' || modeParam === 'sign-up') {
      setMode(modeParam);
    }
  }, [user, navigate, modeParam]);
  
  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  
  const onSignInSubmit = async (data: SignInFormValues) => {
    setError(null);
    try {
      await signIn(data.email, data.password);
      navigate('/chat');
    } catch (error: any) {
      console.error("Sign in error:", error);
      if (error.message?.includes('Email not confirmed')) {
        setError('Your email has not been confirmed yet. Please check your inbox and confirm your email before signing in.');
        setResendEmail(data.email);
      } else {
        setError('Invalid email or password. Please try again.');
      }
    }
  };
  
  const onSignUpSubmit = async (data: SignUpFormValues) => {
    setError(null);
    try {
      await signUp(data.email, data.password, data.name || undefined);
      setEmailSent(true);
    } catch (error: any) {
      console.error("Sign up error:", error);
      if (error.message?.includes('User already registered')) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError('An error occurred during sign up. Please try again.');
      }
    }
  };
  
  const handleResendConfirmationEmail = async () => {
    if (!resendEmail) return;
    
    setResendingEmail(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: resendEmail,
      });
      
      if (error) throw error;
      
      setError(null);
      setResendEmail(null);
      setResendingEmail(false);
      setEmailSent(true);
    } catch (error: any) {
      console.error("Error resending confirmation email:", error);
      setError(`Failed to resend confirmation email: ${error.message}`);
      setResendingEmail(false);
    }
  };
  
  const toggleMode = () => {
    setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
    setError(null);
    setEmailSent(false);
    setResendEmail(null);
    navigate(`/auth?mode=${mode === 'sign-in' ? 'sign-up' : 'sign-in'}`);
  };
  
  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          {emailSent ? (
            <Card className="glass-morphism animate-fade-in">
              <CardHeader>
                <CardTitle>Check Your Email</CardTitle>
                <CardDescription>
                  We've sent a confirmation link to your email address.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Please check your inbox and click the confirmation link to activate your account.</p>
                <p className="text-sm text-muted-foreground">
                  Once confirmed, you'll be able to sign in to your account.
                </p>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button variant="default" onClick={() => navigate('/auth?mode=sign-in')} className="w-full">
                  Go to Sign In
                </Button>
              </CardFooter>
            </Card>
          ) : mode === 'sign-in' ? (
            <Card className="glass-morphism animate-fade-in">
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                    {resendEmail && (
                      <Button 
                        variant="link" 
                        onClick={handleResendConfirmationEmail} 
                        disabled={resendingEmail}
                        className="p-0 h-auto mt-2 text-white"
                      >
                        {resendingEmail ? 'Sending...' : 'Resend confirmation email'}
                      </Button>
                    )}
                  </Alert>
                )}
                <form onSubmit={signInForm.handleSubmit(onSignInSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...signInForm.register('email')}
                      placeholder="your@email.com"
                    />
                    {signInForm.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {signInForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      {...signInForm.register('password')}
                      placeholder="••••••••"
                    />
                    {signInForm.formState.errors.password && (
                      <p className="text-sm text-destructive">
                        {signInForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="text-sm text-center w-full">
                  Don't have an account?{' '}
                  <Button variant="link" onClick={toggleMode} className="p-0">
                    Sign up
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <Card className="glass-morphism animate-fade-in">
              <CardHeader>
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>
                  Fill in your details to create a new account
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name (Optional)</Label>
                    <Input
                      id="name"
                      type="text"
                      {...signUpForm.register('name')}
                      placeholder="John Doe"
                    />
                    {signUpForm.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {signUpForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...signUpForm.register('email')}
                      placeholder="your@email.com"
                    />
                    {signUpForm.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {signUpForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      {...signUpForm.register('password')}
                      placeholder="••••••••"
                    />
                    {signUpForm.formState.errors.password && (
                      <p className="text-sm text-destructive">
                        {signUpForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...signUpForm.register('confirmPassword')}
                      placeholder="••••••••"
                    />
                    {signUpForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">
                        {signUpForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="text-sm text-center w-full">
                  Already have an account?{' '}
                  <Button variant="link" onClick={toggleMode} className="p-0">
                    Sign in
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default Auth;
