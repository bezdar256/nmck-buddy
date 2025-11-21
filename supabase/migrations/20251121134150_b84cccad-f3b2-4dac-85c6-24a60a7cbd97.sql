-- Добавляем колонку для хранения информации о загруженном файле
ALTER TABLE public.requests 
ADD COLUMN uploaded_file_name TEXT;

-- Добавляем комментарий к колонке
COMMENT ON COLUMN public.requests.uploaded_file_name IS 'Название загруженного Excel файла';