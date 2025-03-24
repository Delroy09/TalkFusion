
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { MessageSquare, Code, Zap, Shield, ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const features = [
    {
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      title: 'Multi-AI Chat',
      description: 'Chat with multiple AI models simultaneously and get comprehensive answers.',
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: 'Fast Responses',
      description: 'Get responses quickly from the leading AI models in the industry.',
    },
    {
      icon: <Code className="h-8 w-8 text-primary" />,
      title: 'Code Support',
      description: 'Get help with coding questions from AI models specialized in programming.',
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: 'Secure by Design',
      description: 'Your API keys are stored securely and never leave your browser.',
    },
  ];
  
  return (
    <>
      <Header />
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-5xl">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 animate-fade-in">
                Chat with Multiple AI Models <span className="text-primary">At Once</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mb-8 animate-fade-in">
                Connect to ChatGPT, Google Gemini, and Claude to get the most comprehensive answers to your questions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
                {user ? (
                  <Button size="lg" onClick={() => navigate('/chat')} className="group">
                    Start Chatting
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                ) : (
                  <>
                    <Button size="lg" onClick={() => navigate('/auth?mode=sign-up')} className="group">
                      Sign Up Free
                      <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => navigate('/auth?mode=sign-in')}>
                      Sign In
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="glass-morphism p-6 rounded-xl transition-all duration-300 hover:shadow-lg"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* How it works section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-1/2 order-2 md:order-1">
                  <div className="glass-morphism rounded-xl p-6 h-64 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-lg font-semibold">Step 1</p>
                      <p className="text-xl font-bold mt-2">Create Your Account</p>
                      <p className="text-muted-foreground mt-2">Sign up for a free account to get started.</p>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-1/2 order-1 md:order-2">
                  <h3 className="text-2xl font-bold mb-4">Create Your Account</h3>
                  <p className="text-muted-foreground mb-4">
                    Creating an account is quick and easy. Just enter your email and password to get started.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => navigate('/auth?mode=sign-up')}>
                    Sign Up Now
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-1/2">
                  <h3 className="text-2xl font-bold mb-4">Add Your API Keys</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your API keys from OpenAI, Google, and Anthropic to connect to the AI models.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                    Learn More
                  </Button>
                </div>
                <div className="w-full md:w-1/2">
                  <div className="glass-morphism rounded-xl p-6 h-64 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-lg font-semibold">Step 2</p>
                      <p className="text-xl font-bold mt-2">Add Your API Keys</p>
                      <p className="text-muted-foreground mt-2">Connect to the AI models you want to use.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-1/2 order-2 md:order-1">
                  <div className="glass-morphism rounded-xl p-6 h-64 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-lg font-semibold">Step 3</p>
                      <p className="text-xl font-bold mt-2">Start Chatting</p>
                      <p className="text-muted-foreground mt-2">Start a conversation with one or multiple AI models.</p>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-1/2 order-1 md:order-2">
                  <h3 className="text-2xl font-bold mb-4">Start Chatting</h3>
                  <p className="text-muted-foreground mb-4">
                    Ask questions, get help with coding, brainstorm ideas, and more. Our platform combines answers from multiple AI models.
                  </p>
                  {user ? (
                    <Button variant="outline" size="sm" onClick={() => navigate('/chat')}>
                      Start Chatting
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => navigate('/auth?mode=sign-up')}>
                      Sign Up to Chat
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary/5">
          <div className="container mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to experience the power of multiple AI models?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Start chatting with the most advanced AI systems today and get comprehensive answers to your questions.
            </p>
            {user ? (
              <Button size="lg" onClick={() => navigate('/chat')}>
                Start Chatting Now
              </Button>
            ) : (
              <Button size="lg" onClick={() => navigate('/auth?mode=sign-up')}>
                Sign Up Free
              </Button>
            )}
          </div>
        </section>
        
        {/* Footer */}
        <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t">
          <div className="container mx-auto max-w-5xl">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <p className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} AI Fusion. All rights reserved.
                </p>
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Terms of Service
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
