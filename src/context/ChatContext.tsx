
import { ReactNode, createContext, useContext, useState } from 'react';
import { Message, Conversation, ModelType } from '@/types';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChatContextProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  currentModel: ModelType;
  createConversation: () => void;
  sendMessage: (content: string) => Promise<void>;
  selectConversation: (id: string) => void;
  setCurrentModel: (model: ModelType) => void;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState<ModelType>('combined');
  const { apiKeys, user } = useAuth();
  const { toast } = useToast();

  const createConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      messages: [],
      lastModified: Date.now(),
    };
    
    setConversations([newConversation, ...conversations]);
    setCurrentConversation(newConversation);
  };

  const selectConversation = (id: string) => {
    const conversation = conversations.find(conv => conv.id === id);
    if (conversation) {
      setCurrentConversation(conversation);
    }
  };

  const updateConversation = (conversation: Conversation) => {
    setConversations(prev => 
      prev.map(conv => conv.id === conversation.id ? conversation : conv)
    );
    setCurrentConversation(conversation);
  };

  const sendMessage = async (content: string) => {
    if (!currentConversation) {
      createConversation();
    }
    
    try {
      setIsLoading(true);
      
      if (!currentConversation) return;
      
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        role: 'user',
        model: currentModel,
        timestamp: Date.now(),
      };
      
      const updatedConversation = {
        ...currentConversation,
        messages: [...currentConversation.messages, userMessage],
        lastModified: Date.now(),
      };
      
      // Update conversation with user message
      updateConversation(updatedConversation);
      
      // Check if API keys are configured based on the model
      if (currentModel === 'openai' && !apiKeys.openai) {
        toast({
          title: "Missing API Key",
          description: "Please add your OpenAI API key in settings.",
          variant: "destructive",
        });
        return;
      }
      
      if (currentModel === 'google' && !apiKeys.google) {
        toast({
          title: "Missing API Key",
          description: "Please add your Google API key in settings.",
          variant: "destructive",
        });
        return;
      }
      
      if (currentModel === 'anthropic' && !apiKeys.anthropic) {
        toast({
          title: "Missing API Key",
          description: "Please add your Anthropic API key in settings.",
          variant: "destructive",
        });
        return;
      }
      
      if (currentModel === 'combined' && !apiKeys.openai && !apiKeys.google && !apiKeys.anthropic) {
        toast({
          title: "Missing API Keys",
          description: "Please add at least one API key in settings.",
          variant: "destructive",
        });
        return;
      }
      
      // Call the edge function to get AI response
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: { content, model: currentModel },
      });
      
      if (error) {
        throw new Error(error.message || "Error calling AI service");
      }
      
      if (data.error) {
        throw new Error(data.message || "Error from AI service");
      }
      
      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        model: currentModel,
        timestamp: Date.now(),
      };
      
      const finalConversation = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, assistantMessage],
        title: updatedConversation.messages.length === 0 ? content.slice(0, 30) : updatedConversation.title,
        lastModified: Date.now(),
      };
      
      // Update conversation with assistant message
      updateConversation(finalConversation);
      
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while sending your message.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        isLoading,
        currentModel,
        createConversation,
        sendMessage,
        selectConversation,
        setCurrentModel,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
