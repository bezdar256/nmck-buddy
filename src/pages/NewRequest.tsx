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
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";


const NewRequest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    unit: "шт",
    quantity: 1,
    description: "",
    searchMode: "STRICT" as "STRICT" | "EXTENDED",
  });

  const [categories, setCategories] = useState<string[]>([]);


  const [selectedSources, setSelectedSources] = useState<string[]>(["1"]);

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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.unit || !formData.description || selectedSources.length === 0) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
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
          source_ids: selectedSources,
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
                <Label htmlFor="title">Название закупки *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Например: Поставка одежды для детей"
                  required
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
                <Label htmlFor="description">Описание / выдержка из ТЗ *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Вставьте текст технического задания или описание требуемых товаров..."
                  rows={6}
                  required
                />
              </div>
            </CardContent>
          </Card>


          <Card>
            <CardHeader>
              <CardTitle>Параметры подбора</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Режим подбора аналогов</Label>
                <RadioGroup
                  value={formData.searchMode}
                  onValueChange={(value) => setFormData({ ...formData, searchMode: value as "STRICT" | "EXTENDED" })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="STRICT" id="strict" />
                    <Label htmlFor="strict" className="font-normal cursor-pointer">
                      Строгий (точное соответствие характеристикам)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="EXTENDED" id="extended" />
                    <Label htmlFor="extended" className="font-normal cursor-pointer">
                      Расширенный (допускаются близкие по характеристикам товары)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label>Источники цен *</Label>
                <div className="space-y-2 mt-2">
                  {[
                    { id: "1", name: "Маркетплейс A" },
                    { id: "2", name: "Маркетплейс B" },
                    { id: "3", name: "Внутренняя база" },
                  ].map((source) => (
                    <div key={source.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={source.id}
                        checked={selectedSources.includes(source.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSources([...selectedSources, source.id]);
                          } else {
                            setSelectedSources(selectedSources.filter(id => id !== source.id));
                          }
                        }}
                      />
                      <Label htmlFor={source.id} className="font-normal cursor-pointer">
                        {source.name}
                      </Label>
                    </div>
                  ))}
                </div>
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
