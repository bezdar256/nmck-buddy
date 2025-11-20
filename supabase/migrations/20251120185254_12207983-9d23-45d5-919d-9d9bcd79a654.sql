-- Create enum for request status
CREATE TYPE request_status AS ENUM ('draft', 'calculated', 'approved');

-- Create enum for search mode
CREATE TYPE search_mode AS ENUM ('STRICT', 'EXTENDED');

-- Create requests table
CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  unit TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  search_mode search_mode NOT NULL DEFAULT 'STRICT',
  sources_selected TEXT[] DEFAULT '{}',
  status request_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create characteristics table
CREATE TABLE public.characteristics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create analogs table
CREATE TABLE public.analogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  supplier_or_brand TEXT,
  normalized_params JSONB,
  matched_by TEXT NOT NULL DEFAULT 'yandex_gpt',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create sources table
CREATE TABLE public.sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('marketplace', 'internal', 'other')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create prices table
CREATE TABLE public.prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analog_id UUID NOT NULL REFERENCES public.analogs(id) ON DELETE CASCADE,
  source_id UUID REFERENCES public.sources(id),
  source_name TEXT NOT NULL,
  source_url TEXT,
  price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'RUB',
  collected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_excluded BOOLEAN NOT NULL DEFAULT false
);

-- Create aggregated_results table
CREATE TABLE public.aggregated_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  min_price DECIMAL(12, 2),
  max_price DECIMAL(12, 2),
  avg_price DECIMAL(12, 2),
  median_price DECIMAL(12, 2),
  p10_price DECIMAL(12, 2),
  p90_price DECIMAL(12, 2),
  recommended_nmck DECIMAL(12, 2),
  max_over_min_abs DECIMAL(12, 2),
  max_over_min_pct DECIMAL(8, 2),
  avg_over_min_abs DECIMAL(12, 2),
  avg_over_min_pct DECIMAL(8, 2),
  prices_used_count INTEGER NOT NULL DEFAULT 0,
  prices_total_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(request_id)
);

-- Create gpt_logs table
CREATE TABLE public.gpt_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.requests(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_characteristics_request ON public.characteristics(request_id);
CREATE INDEX idx_analogs_request ON public.analogs(request_id);
CREATE INDEX idx_prices_analog ON public.prices(analog_id);
CREATE INDEX idx_aggregated_results_request ON public.aggregated_results(request_id);
CREATE INDEX idx_requests_status ON public.requests(status);
CREATE INDEX idx_requests_created ON public.requests(created_at DESC);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characteristics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aggregated_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gpt_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all on requests" ON public.requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on characteristics" ON public.characteristics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on analogs" ON public.analogs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on sources" ON public.sources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on prices" ON public.prices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on aggregated_results" ON public.aggregated_results FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on gpt_logs" ON public.gpt_logs FOR ALL USING (true) WITH CHECK (true);

-- Insert default sources
INSERT INTO public.sources (name, type) VALUES
  ('Маркетплейс A', 'marketplace'),
  ('Маркетплейс B', 'marketplace'),
  ('Внутренняя база', 'internal');