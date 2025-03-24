
import { Check, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModelType } from '@/types';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';

export function ModelSelector() {
  const { currentModel, setCurrentModel } = useChat();
  const { apiKeys } = useAuth();
  
  const models: { id: ModelType; name: string; description: string }[] = [
    {
      id: 'combined',
      name: 'Combined AI',
      description: 'Uses all available models and combines the results',
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'ChatGPT by OpenAI',
    },
    {
      id: 'google',
      name: 'Google',
      description: 'Gemini by Google',
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      description: 'Claude by Anthropic',
    },
  ];
  
  const isModelAvailable = (model: ModelType): boolean => {
    if (model === 'combined') {
      // Combined mode requires at least one key
      return !!(apiKeys.openai || apiKeys.google || apiKeys.anthropic);
    }
    
    switch (model) {
      case 'openai':
        return !!apiKeys.openai;
      case 'google':
        return !!apiKeys.google;
      case 'anthropic':
        return !!apiKeys.anthropic;
      default:
        return false;
    }
  };
  
  return (
    <div className="w-full max-w-md">
      <div className="mb-2 flex items-center">
        <Cpu size={16} className="mr-2 text-muted-foreground" />
        <span className="text-sm font-medium">Select AI Model</span>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {models.map((model) => {
          const isActive = currentModel === model.id;
          const available = isModelAvailable(model.id);
          
          return (
            <button
              key={model.id}
              className={cn(
                "flex items-start p-3 text-left rounded-lg border transition-all duration-200",
                isActive 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50",
                !available && "opacity-60 cursor-not-allowed"
              )}
              onClick={() => available && setCurrentModel(model.id)}
              disabled={!available}
            >
              <div className="flex-grow">
                <div className="flex items-center">
                  <div className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center mr-2",
                    isActive ? "border-primary bg-primary text-primary-foreground" : "border-muted"
                  )}>
                    {isActive && <Check size={12} />}
                  </div>
                  <span className="font-medium">{model.name}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground pl-6">
                  {model.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {!isModelAvailable('combined') && (
        <div className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded">
          Please add at least one API key in the settings to use the AI models.
        </div>
      )}
    </div>
  );
}
