import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Loader2, FileUp, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";


const NewRequest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    unit: "шт",
    quantity: 1,
    description: "",
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);


  

  const addCategory = () => {
    setCategories([...categories, ""]);
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const updateCategory = (index: number, value: string) => {
    const updated = [...categories];
    updated[index] = value;
    setCategories(updated);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

      // Предполагаемая структура Excel:
      // Строка 1: Название, Количество, Единица, Описание, Категория
      // Строка 2+: данные
      
      if (jsonData.length > 1) {
        const row = jsonData[1];
        setFormData({
          title: row[0]?.toString() || "",
          quantity: parseInt(row[1]?.toString()) || 1,
          unit: row[2]?.toString() || "шт",
          description: row[3]?.toString() || "",
        });

        if (row[4]) {
          const cats = row[4].toString().split(",").map((c: string) => c.trim()).filter(Boolean);
          setCategories(cats);
        }

        toast({
          title: "Успешно",
          description: "Данные из Excel файла загружены",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обработать Excel файл",
        variant: "destructive",
      });
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.unit || (!formData.description && !uploadedFile)) {
      toast({
        title: "Ошибка",
        description: uploadedFile ? "Заполните единицу измерения" : "Заполните все обязательные поля или загрузите Excel файл",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-request", {
        body: {
          ...formData,
          category: categories.filter(c => c.trim()).join(", ") || null,
          search_mode: "STRICT",
          source_ids: ["1", "2", "3"],
        },
      });

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "Расчёт создан, подбираем аналоги...",
      });

      navigate(`/requests/${data.id}`);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось создать расчёт",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Новый расчёт НМЦК</h1>
          <p className="text-muted-foreground">
            Заполните форму для автоматического подбора аналогов и расчёта НМЦК
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Основные параметры</CardTitle>
              <CardDescription>Общая информация о закупке</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Загрузить данные из Excel</Label>
                <div className="flex items-center gap-2">
                  <label 
                    htmlFor="excel-upload" 
                    className="flex items-center gap-2 px-4 py-2 border border-input rounded-md cursor-pointer hover:bg-accent transition-colors"
                  >
                    <FileUp className="h-4 w-4" />
                    <span className="text-sm">Выбрать файл</span>
                  </label>
                  <input
                    id="excel-upload"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {uploadedFile && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-md">
                      <span className="text-sm">{uploadedFile.name}</span>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="hover:bg-primary/20 rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Формат: Название | Количество | Единица | Описание | Категория
                </p>
              </div>

              <div>
                <Label htmlFor="title">Название расчёта (для вашего удобства)</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Оставьте пустым для автоматической генерации или введите своё"
                />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label>Категория</Label>
                  <button
                    type="button"
                    onClick={addCategory}
                    className="w-5 h-5 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                  >
                    <Plus className="h-3 w-3 text-primary" />
                  </button>
                </div>
                {categories.length > 0 && (
                  <div className="space-y-2">
                    {categories.map((category, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={category}
                          onChange={(e) => updateCategory(index, e.target.value)}
                          placeholder="Например: Одежда"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCategory(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Количество *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Единица измерения *</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="шт, комплект, упаковка"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">
                  Описание / выдержка из ТЗ {!uploadedFile && "*"}
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Вставьте текст технического задания или описание требуемых товаров..."
                  rows={6}
                  required={!uploadedFile}
                />
                {uploadedFile && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Необязательно при загрузке Excel файла
                  </p>
                )}
              </div>
            </CardContent>
          </Card>



          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Подбираем аналоги и собираем цены...
              </>
            ) : (
              "Рассчитать НМЦК"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default NewRequest;
