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

    const body = await req.json();
    const { title, category, unit, quantity, description, characteristics, search_mode, source_ids, draft_id } = body;

    let request;

    if (draft_id) {
      // Используем существующий черновик
      const { data: existingRequest, error: fetchError } = await supabase
        .from("requests")
        .select("*")
        .eq("id", draft_id)
        .single();

      if (fetchError) throw fetchError;

      // Обновляем запрос
      const { data: updatedRequest, error: updateError } = await supabase
        .from("requests")
        .update({
          title,
          category,
          unit,
          quantity,
          description,
          search_mode,
          sources_selected: source_ids,
          status: "draft"
        })
        .eq("id", draft_id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Удаляем старые данные если они есть
      await supabase.from("analogs").delete().eq("request_id", draft_id);
      await supabase.from("characteristics").delete().eq("request_id", draft_id);
      await supabase.from("aggregated_results").delete().eq("request_id", draft_id);

      request = updatedRequest;
    } else {
      // Создаём новый запрос
      const { data: newRequest, error: requestError } = await supabase
        .from("requests")
        .insert({
          title,
          category,
          unit,
          quantity,
          description,
          search_mode,
          sources_selected: source_ids,
          status: "draft"
        })
        .select()
        .single();

      if (requestError) throw requestError;
      request = newRequest;
    }

    // Create characteristics
    if (characteristics && characteristics.length > 0) {
      await supabase
        .from("characteristics")
        .insert(characteristics.map((c: any) => ({
          request_id: request.id,
          name: c.name,
          value: c.value
        })));
    }

    // Create mock analogs and prices for MVP
    const { data: sources } = await supabase.from("sources").select("*").eq("is_active", true);
    
    const mockAnalogs = [
      { name: "Костюм детский (аналог 1)", supplier_or_brand: "Поставщик A" },
      { name: "Костюм детский (аналог 2)", supplier_or_brand: "Поставщик B" },
      { name: "Костюм детский (аналог 3)", supplier_or_brand: "Поставщик C" },
    ];

    for (const analog of mockAnalogs) {
      const { data: analogData } = await supabase
        .from("analogs")
        .insert({
          request_id: request.id,
          ...analog,
          matched_by: "yandex_gpt"
        })
        .select()
        .single();

      if (analogData && sources) {
        const mockPrices = sources.slice(0, 2).map((source: any) => ({
          analog_id: analogData.id,
          source_id: source.id,
          source_name: "Ссылка на товар",
          source_url: "https://example.com",
          price: Math.floor(Math.random() * 5000) + 10000,
          currency: "RUB"
        }));

        await supabase.from("prices").insert(mockPrices);
      }
    }

    // Calculate NMCK (simplified for MVP)
    const { data: allPrices } = await supabase
      .from("prices")
      .select("price")
      .eq("is_excluded", false)
      .in("analog_id", mockAnalogs.map((_, i) => i));

    if (allPrices && allPrices.length > 0) {
      const prices = allPrices.map(p => Number(p.price)).sort((a, b) => a - b);
      const min = prices[0];
      const max = prices[prices.length - 1];
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
      const median = prices[Math.floor(prices.length / 2)];

      await supabase.from("aggregated_results").insert({
        request_id: request.id,
        min_price: min,
        max_price: max,
        avg_price: avg,
        median_price: median,
        p10_price: prices[Math.floor(prices.length * 0.1)],
        p90_price: prices[Math.floor(prices.length * 0.9)],
        recommended_nmck: Math.round(avg),
        prices_used_count: prices.length,
        prices_total_count: prices.length
      });
    }

    await supabase.from("requests").update({ status: "calculated" }).eq("id", request.id);

    return new Response(JSON.stringify({ id: request.id }), {
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
