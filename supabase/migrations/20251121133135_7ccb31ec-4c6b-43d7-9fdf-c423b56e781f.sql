-- Создаем таблицу папок для организации расчётов
CREATE TABLE public.folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включаем RLS для папок
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Политики для папок (все могут делать всё)
CREATE POLICY "Allow all on folders" 
ON public.folders 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Добавляем колонку folder_id в таблицу requests
ALTER TABLE public.requests 
ADD COLUMN folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL;

-- Создаем индекс для быстрого поиска по папкам
CREATE INDEX idx_requests_folder_id ON public.requests(folder_id);