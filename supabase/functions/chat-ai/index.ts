
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, model } = await req.json();

    let responseText = "";

    // OpenAI (GPT) API call
    if (model === 'openai' || model === 'combined') {
      if (!OPENAI_API_KEY) {
        if (model === 'openai') {
          throw new Error('OpenAI API key not configured');
        }
      } else {
        try {
          const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini', // Using the more affordable model
              messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content }
              ],
              temperature: 0.7,
            }),
          });

          const openaiData = await openaiResponse.json();
          
          if (openaiData.error) {
            throw new Error(`OpenAI error: ${openaiData.error.message}`);
          }
          
          if (model === 'openai') {
            responseText = openaiData.choices[0].message.content;
          } else if (model === 'combined') {
            responseText += `OpenAI: ${openaiData.choices[0].message.content}\n\n`;
          }
        } catch (error) {
          console.error('OpenAI API error:', error);
          if (model === 'openai') {
            throw error;
          }
        }
      }
    }

    // Google (Gemini) API call
    if (model === 'google' || model === 'combined') {
      if (!GOOGLE_API_KEY) {
        if (model === 'google') {
          throw new Error('Google API key not configured');
        }
      } else {
        try {
          const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_API_KEY}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: content }
                  ]
                }
              ],
              generationConfig: {
                temperature: 0.7,
              },
            }),
          });

          const googleData = await googleResponse.json();
          
          if (googleData.error) {
            throw new Error(`Google error: ${googleData.error.message}`);
          }
          
          const googleText = googleData.candidates[0]?.content?.parts[0]?.text || "No response from Google";
          
          if (model === 'google') {
            responseText = googleText;
          } else if (model === 'combined') {
            responseText += `Google: ${googleText}\n\n`;
          }
        } catch (error) {
          console.error('Google API error:', error);
          if (model === 'google') {
            throw error;
          }
        }
      }
    }

    // Anthropic (Claude) API call
    if (model === 'anthropic' || model === 'combined') {
      if (!ANTHROPIC_API_KEY) {
        if (model === 'anthropic') {
          throw new Error('Anthropic API key not configured');
        }
      } else {
        try {
          const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': ANTHROPIC_API_KEY,
              'anthropic-version': '2023-06-01',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'claude-3-haiku-20240307',
              messages: [
                { role: 'user', content }
              ],
              max_tokens: 1000,
            }),
          });

          const anthropicData = await anthropicResponse.json();
          
          if (anthropicData.error) {
            throw new Error(`Anthropic error: ${anthropicData.error.message}`);
          }
          
          if (model === 'anthropic') {
            responseText = anthropicData.content[0].text;
          } else if (model === 'combined') {
            responseText += `Anthropic: ${anthropicData.content[0].text}`;
          }
        } catch (error) {
          console.error('Anthropic API error:', error);
          if (model === 'anthropic') {
            throw error;
          }
        }
      }
    }

    // If we're using combined model but no API keys are configured
    if (model === 'combined' && responseText === "") {
      throw new Error('No API keys configured. Please add at least one API key in settings.');
    }

    return new Response(JSON.stringify({ 
      response: responseText || "No response was generated."
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-ai function:', error);
    return new Response(JSON.stringify({ 
      error: true, 
      message: error.message || 'An unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
