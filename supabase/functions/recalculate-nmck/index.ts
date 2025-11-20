import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { request_id } = await req.json();

    // Recalculate aggregated results based on current prices
    const { data: prices } = await supabase
      .from("prices")
      .select("price")
      .eq("is_excluded", false);

    if (prices && prices.length > 0) {
      const priceValues = prices.map(p => Number(p.price)).sort((a, b) => a - b);
      const min = priceValues[0];
      const max = priceValues[priceValues.length - 1];
      const avg = priceValues.reduce((a, b) => a + b, 0) / priceValues.length;
      const median = priceValues[Math.floor(priceValues.length / 2)];

      await supabase
        .from("aggregated_results")
        .update({
          min_price: min,
          max_price: max,
          avg_price: avg,
          median_price: median,
          p10_price: priceValues[Math.floor(priceValues.length * 0.1)],
          p90_price: priceValues[Math.floor(priceValues.length * 0.9)],
          recommended_nmck: Math.round(avg),
          prices_used_count: priceValues.length,
        })
        .eq("request_id", request_id);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
