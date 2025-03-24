
import { Message } from '@/types';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  
  // Format the timestamp
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  // Get the model badge text
  const getModelBadge = () => {
    switch (message.model) {
      case 'openai':
        return 'OpenAI';
      case 'google':
        return 'Google';
      case 'anthropic':
        return 'Anthropic';
      case 'combined':
        return 'Combined AI';
      default:
        return 'AI';
    }
  };
  
  return (
    <div className={cn(
      "flex w-full mb-4 animate-fade-in",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex max-w-[80%] md:max-w-[70%]",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full mt-1",
          isUser ? "ml-2 bg-primary text-primary-foreground" : "mr-2 bg-secondary text-secondary-foreground"
        )}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>
        
        <div className={cn(
          "flex flex-col",
          isUser ? "items-end" : "items-start"
        )}>
          <div className={cn(
            "px-4 py-3 rounded-2xl",
            isUser 
              ? "bg-primary text-primary-foreground rounded-tr-none" 
              : "glass-morphism rounded-tl-none"
          )}>
            {!isUser && (
              <div className="text-xs font-medium mb-1 text-muted-foreground">
                {getModelBadge()}
              </div>
            )}
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
          <div className={cn(
            "text-xs text-muted-foreground mt-1",
            isUser ? "text-right" : "text-left"
          )}>
            {formattedTime}
          </div>
        </div>
      </div>
    </div>
  );
}
