
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function ApiKeyForm() {
  const { apiKeys, updateApiKeys, user } = useAuth();
  const { toast } = useToast();
  
  const [openaiKey, setOpenaiKey] = useState(apiKeys.openai || '');
  const [googleKey, setGoogleKey] = useState(apiKeys.google || '');
  const [anthropicKey, setAnthropicKey] = useState(apiKeys.anthropic || '');
  
  const [showOpenai, setShowOpenai] = useState(false);
  const [showGoogle, setShowGoogle] = useState(false);
  const [showAnthropic, setShowAnthropic] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!user) {
      setError("You must be logged in to save API keys");
      return;
    }
    
    try {
      setIsSaving(true);
      
      await updateApiKeys({
        openai: openaiKey || undefined,
        google: googleKey || undefined,
        anthropic: anthropicKey || undefined,
      });
      
      toast({
        title: "API keys saved",
        description: "Your API keys have been saved securely.",
      });
    } catch (error: any) {
      console.error('Error saving API keys:', error);
      setError(error.message || "There was an error saving your API keys.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const apiKeyInputs = [
    {
      id: 'openai',
      label: 'OpenAI API Key',
      value: openaiKey,
      setValue: setOpenaiKey,
      show: showOpenai,
      setShow: setShowOpenai,
      placeholder: 'sk-...',
    },
    {
      id: 'google',
      label: 'Google (Gemini) API Key',
      value: googleKey,
      setValue: setGoogleKey,
      show: showGoogle,
      setShow: setShowGoogle,
      placeholder: 'AI...',
    },
    {
      id: 'anthropic',
      label: 'Anthropic (Claude) API Key',
      value: anthropicKey,
      setValue: setAnthropicKey,
      show: showAnthropic,
      setShow: setShowAnthropic,
      placeholder: 'sk-ant-...',
    },
  ];
  
  if (!user) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            Please log in to manage your API keys.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
        <CardDescription>
          Add your API keys to connect to different AI services.
          These keys are stored securely in the database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {apiKeyInputs.map((input) => (
            <div key={input.id} className="space-y-2">
              <Label htmlFor={input.id}>{input.label}</Label>
              <div className="flex">
                <div className="relative flex-grow">
                  <Input
                    id={input.id}
                    type={input.show ? "text" : "password"}
                    value={input.value}
                    onChange={(e) => input.setValue(e.target.value)}
                    placeholder={input.placeholder}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => input.setShow(!input.show)}
                    aria-label={input.show ? "Hide API key" : "Show API key"}
                  >
                    {input.show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          <Button type="submit" disabled={isSaving} className="w-full">
            {isSaving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              <span className="flex items-center">
                <Save size={16} className="mr-2" />
                Save API Keys
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
