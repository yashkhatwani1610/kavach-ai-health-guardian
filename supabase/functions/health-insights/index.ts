import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vitals, environment, parents } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating health insights for vitals:", vitals);

    // Build context for AI
    const context = `
User Health Data:
- Heart Rate: ${vitals?.heart_rate || 'N/A'} bpm
- SpO2: ${vitals?.spo2 || 'N/A'}%
- Blood Pressure: ${vitals?.bp || 'N/A'}
- Temperature: ${vitals?.temperature || 'N/A'}°F
- Respiration Rate: ${vitals?.respiration_rate || 'N/A'} breaths/min

Environmental Data:
- Temperature: ${environment?.temperature || 'N/A'}°F
- Humidity: ${environment?.humidity || 'N/A'}%
- Air Quality: ${environment?.air_quality || 'N/A'}
- PM2.5: ${environment?.pm25 || 'N/A'}
- PM10: ${environment?.pm10 || 'N/A'}
- CO2: ${environment?.co2 || 'N/A'} ppm

Family Health History:
${parents && parents.length > 0 
  ? parents.map((p: any) => `- ${p.relation_type}: ${p.name}`).join('\n')
  : '- No family health history available'}
`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are a preventive health AI assistant for KAVACH AI. Analyze user health data and provide personalized recommendations. Focus on disease prevention, risk assessment, and actionable guidance. Be concise but thorough."
          },
          {
            role: "user",
            content: `${context}\n\nBased on this health data, provide:\n1. Current risk level (Low/Medium/High) with brief explanation\n2. 3-4 specific risk factors or positive indicators\n3. 3-4 actionable recommendations with priority levels`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_health_insights",
              description: "Generate personalized health insights and recommendations",
              parameters: {
                type: "object",
                properties: {
                  risk_level: {
                    type: "string",
                    enum: ["Low", "Medium", "High"],
                    description: "Current health risk level"
                  },
                  risk_explanation: {
                    type: "string",
                    description: "Brief explanation of the risk level (1-2 sentences)"
                  },
                  risk_factors: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        factor: { type: "string" },
                        status: { type: "string", enum: ["positive", "warning", "negative"] }
                      },
                      required: ["factor", "status"]
                    },
                    description: "3-4 specific risk factors or positive indicators"
                  },
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        priority: { type: "string", enum: ["low", "medium", "high"] }
                      },
                      required: ["title", "description", "priority"]
                    },
                    description: "3-4 actionable recommendations"
                  }
                },
                required: ["risk_level", "risk_explanation", "risk_factors", "recommendations"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_health_insights" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data, null, 2));

    // Extract the function call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const insights = JSON.parse(toolCall.function.arguments);
    console.log("Parsed insights:", insights);

    return new Response(
      JSON.stringify({ success: true, insights }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in health-insights function:", error);
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
