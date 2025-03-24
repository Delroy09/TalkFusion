
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { Header } from '@/components/Header';
import { ChatBubble } from '@/components/ChatBubble';
import { ModelSelector } from '@/components/ModelSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Send, Plus, MessageSquare, Settings, ChevronRight, ChevronLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Chat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversations, currentConversation, isLoading, sendMessage, createConversation, selectConversation } = useChat();
  
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!user) {
      navigate('/auth?mode=sign-in');
    }
  }, [user, navigate]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);
  
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;
    
    await sendMessage(input);
    setInput('');
  };
  
  if (!user) return null;
  
  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col pt-16">
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <AnimatePresence initial={false}>
            {sidebarOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="bg-muted/30 border-r flex flex-col h-[calc(100vh-64px)]"
              >
                <div className="p-4 flex flex-col space-y-4">
                  <Button 
                    onClick={createConversation} 
                    className="w-full justify-start"
                  >
                    <Plus size={16} className="mr-2" />
                    New Chat
                  </Button>
                  
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-medium">Recent Chats</h2>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex-1 overflow-y-auto p-2">
                  {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-4 h-full text-muted-foreground">
                      <MessageSquare size={32} className="mb-2 opacity-50" />
                      <p className="mb-2">No conversations yet</p>
                      <p className="text-sm">Start a new chat to begin</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {conversations.map((conversation) => (
                        <button
                          key={conversation.id}
                          onClick={() => selectConversation(conversation.id)}
                          className={cn(
                            "w-full text-left p-3 rounded-md transition-colors hover:bg-muted",
                            currentConversation?.id === conversation.id ? "bg-primary/10 text-primary" : ""
                          )}
                        >
                          <div className="flex items-start">
                            <MessageSquare size={16} className="mr-2 mt-1 shrink-0" />
                            <div className="truncate">
                              <p className="font-medium truncate">
                                {conversation.title || 'New Conversation'}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {conversation.messages.length} messages • {new Date(conversation.lastModified).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => navigate('/settings')}
                  >
                    <Settings size={16} className="mr-2" />
                    Settings
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Chat area */}
          <div className="flex-1 flex flex-col h-[calc(100vh-64px)] relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 left-2 z-20 opacity-70 hover:opacity-100"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </Button>
            
            {/* Empty state */}
            {!currentConversation && (
              <div className="flex flex-col items-center justify-center h-full px-4 text-center">
                <div className="max-w-md">
                  <h2 className="text-2xl font-bold mb-2">Welcome to AI Fusion</h2>
                  <p className="text-muted-foreground mb-6">
                    Start a new conversation to chat with multiple AI models at once.
                  </p>
                  <div className="mb-8">
                    <ModelSelector />
                  </div>
                  <Button onClick={createConversation}>
                    <Plus size={16} className="mr-2" />
                    New Conversation
                  </Button>
                </div>
              </div>
            )}
            
            {/* Messages */}
            {currentConversation && (
              <>
                <div className="flex-1 overflow-y-auto p-4">
                  {currentConversation.messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full px-4 text-center">
                      <div className="max-w-md">
                        <h2 className="text-2xl font-bold mb-2">Start a New Conversation</h2>
                        <p className="text-muted-foreground mb-6">
                          Ask a question to get started with our AI models.
                        </p>
                        <div className="mb-4">
                          <ModelSelector />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-4xl mx-auto w-full">
                      {currentConversation.messages.map((message) => (
                        <ChatBubble key={message.id} message={message} />
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t glass-morphism mt-auto">
                  <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSend} className="flex space-x-2">
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1"
                        disabled={isLoading}
                      />
                      <Button type="submit" disabled={isLoading || input.trim() === ''}>
                        {isLoading ? (
                          <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-primary-foreground animate-spin" />
                        ) : (
                          <Send size={18} />
                        )}
                      </Button>
                    </form>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
