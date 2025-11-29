import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { heartRate, spo2, temperature, stress, steps } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    console.log("Generating AI insights for:", { heartRate, spo2, temperature, stress, steps });

    const prompt = `You are a health AI assistant. Analyze the following health metrics and provide personalized insights:

Heart Rate: ${heartRate || 'N/A'} bpm
SpO2: ${spo2 || 'N/A'}%
Temperature: ${temperature || 'N/A'}°F
Stress Level: ${stress || 'N/A'}
Steps: ${steps || 'N/A'}

Provide:
1. A brief summary (2-3 sentences) of the overall health status
2. Risk level (Low, Medium, or High)
3. 3-4 specific actionable recommendations

Format your response as JSON with fields: summary, riskLevel, recommendations (array of strings).`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Gemini response:", JSON.stringify(data, null, 2));

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
      throw new Error("No content generated from Gemini");
    }

    // Extract JSON from the response (Gemini might wrap it in markdown)
    let insights;
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON found, create structured response from text
        insights = {
          summary: generatedText,
          riskLevel: "Medium",
          recommendations: ["Consult with a healthcare professional", "Monitor your vitals regularly", "Maintain a healthy lifestyle"]
        };
      }
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      insights = {
        summary: generatedText,
        riskLevel: "Medium",
        recommendations: ["Consult with a healthcare professional", "Monitor your vitals regularly"]
      };
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        summary: insights.summary,
        riskLevel: insights.riskLevel,
        recommendations: insights.recommendations
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in ai-insights function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
