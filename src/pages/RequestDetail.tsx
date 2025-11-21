import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, Download, RefreshCw, ExternalLink, FileSpreadsheet, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PriceAnalytics } from "@/components/analytics/PriceAnalytics";

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const { data, error } = await supabase
        .from("requests")
        .select(`
          *,
          characteristics (*),
          aggregated_results (*),
          analogs (
            *,
            prices (*)
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setRequest(data);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось загрузить расчёт",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: "draft" | "calculated" | "approved") => {
    try {
      const { error } = await supabase
        .from("requests")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Успешно",
        description: `Статус изменён`,
      });
      
      fetchRequest();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRecalculate = async () => {
    try {
      const { error } = await supabase.functions.invoke("recalculate-nmck", {
        body: { request_id: id },
      });

      if (error) throw error;

      toast({
        title: "Успешно",
        description: "НМЦК пересчитан",
      });
      
      fetchRequest();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteRequest = async () => {
    if (!id) return;
    
    setDeleting(true);
    
    try {
      const { error } = await supabase
        .from("requests")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Расчёт удалён",
        description: "Закупка успешно удалена",
      });

      navigate("/requests");
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить расчёт",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Расчёт не найден</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const agg = request.aggregated_results?.[0];
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Черновик",
      calculated: "Рассчитан",
      approved: "Утверждён",
    };
    return labels[status] || status;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Закупка: {request.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>Дата: {new Date(request.created_at).toLocaleDateString("ru-RU")}</span>
              {request.category && <span>Категория: {request.category}</span>}
              <span>Количество: {request.quantity}</span>
              <span>Единица: {request.unit}</span>
              {request.uploaded_file_name && (
                <span className="flex items-center gap-1 text-green-600">
                  <FileSpreadsheet className="h-4 w-4" />
                  {request.uploaded_file_name}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant={request.status === "approved" ? "default" : "secondary"}>
              {getStatusLabel(request.status)}
            </Badge>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={deleting}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Удалить расчёт?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Это действие нельзя отменить. Расчёт и все связанные данные будут удалены безвозвратно.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={deleteRequest}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Удалить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="flex gap-2">
          {request.status !== "approved" ? (
            <Button onClick={() => handleStatusChange("approved")}>
              Утвердить
            </Button>
          ) : (
            <Button variant="outline" onClick={() => handleStatusChange("calculated")}>
              Снять утверждение
            </Button>
          )}
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Параметры закупки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Описание / ТЗ:</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{request.description}</p>
          </div>

          {request.characteristics && request.characteristics.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Характеристики:</h3>
              <div className="grid grid-cols-2 gap-2">
                {request.characteristics.map((char: any) => (
                  <div key={char.id} className="text-sm">
                    <span className="font-medium">{char.name}:</span> {char.value}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="table" className="space-y-6">
        <TabsList>
          <TabsTrigger value="table">Таблица</TabsTrigger>
          <TabsTrigger value="charts">Инфографика</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-6">
          {agg && (
            <Card>
              <CardHeader>
                <CardTitle>Агрегированные показатели</CardTitle>
                <CardDescription>
                  Использовано {agg.prices_used_count} из {agg.prices_total_count} цен (без учёта выбросов)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Мин. цена</div>
                    <div className="text-lg font-mono">{agg.min_price?.toLocaleString("ru-RU")} ₽</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Макс. цена</div>
                    <div className="text-lg font-mono">{agg.max_price?.toLocaleString("ru-RU")} ₽</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Средняя</div>
                    <div className="text-lg font-mono">{agg.avg_price?.toLocaleString("ru-RU")} ₽</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Медиана</div>
                    <div className="text-lg font-mono">{agg.median_price?.toLocaleString("ru-RU")} ₽</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">P10</div>
                    <div className="text-lg font-mono">{agg.p10_price?.toLocaleString("ru-RU")} ₽</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">P90</div>
                    <div className="text-lg font-mono">{agg.p90_price?.toLocaleString("ru-RU")} ₽</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-muted-foreground">Рекомендованная НМЦК</div>
                    <div className="text-2xl font-bold text-primary">
                      {agg.recommended_nmck?.toLocaleString("ru-RU")} ₽
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Итого: {(agg.recommended_nmck * request.quantity)?.toLocaleString("ru-RU")} ₽
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Таблица цен</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleRecalculate}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Пересчитать
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Скачать Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {request.analogs && request.analogs.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Название товара</TableHead>
                        <TableHead>Поставщик/Бренд</TableHead>
                        <TableHead>Цена</TableHead>
                        <TableHead>Источник</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {request.analogs.flatMap((analog: any) =>
                        analog.prices?.map((price: any) => (
                          <TableRow key={`${analog.id}-${price.id}`}>
                            <TableCell className="font-medium">{analog.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {analog.supplier_or_brand || "—"}
                            </TableCell>
                            <TableCell className="font-mono">{price.price?.toLocaleString("ru-RU")} ₽</TableCell>
                            <TableCell>
                              {price.source_url ? (
                                <a 
                                  href={price.source_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                >
                                  {price.source_name}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : (
                                <span className="text-sm text-muted-foreground">{price.source_name}</span>
                              )}
                            </TableCell>
                          </TableRow>
                        )) || []
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Аналоги не найдены
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts">
          <Card>
            <CardHeader>
              <CardTitle>Визуализация данных</CardTitle>
            </CardHeader>
            <CardContent>
              <PriceAnalytics
                aggregatedResult={agg}
                prices={request.analogs?.flatMap((analog: any) =>
                  analog.prices?.map((price: any) => ({
                    source_name: price.source_name,
                    price: price.price,
                  })) || []
                ) || []}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RequestDetail;
