import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const { toast } = useToast();
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [showLogDialog, setShowLogDialog] = useState(false);

  const handleTestGPT = () => {
    toast({
      title: "Тестовый запрос",
      description: "Функция будет реализована при подключении AI",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Админка</h1>
        <p className="text-muted-foreground">Управление источниками, логами и тестирование AI</p>
      </div>

      <Tabs defaultValue="sources" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sources">Источники</TabsTrigger>
          <TabsTrigger value="logs">Логи GPT</TabsTrigger>
          <TabsTrigger value="sandbox">Песочница GPT</TabsTrigger>
        </TabsList>

        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Источники цен</CardTitle>
                  <CardDescription>Управление источниками для сбора данных</CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить источник
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Маркетплейс A</TableCell>
                    <TableCell>marketplace</TableCell>
                    <TableCell>
                      <span className="text-success">Активен</span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">Изменить</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Маркетплейс B</TableCell>
                    <TableCell>marketplace</TableCell>
                    <TableCell>
                      <span className="text-success">Активен</span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">Изменить</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Внутренняя база</TableCell>
                    <TableCell>internal</TableCell>
                    <TableCell>
                      <span className="text-success">Активен</span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">Изменить</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Логи запросов к GPT</CardTitle>
              <CardDescription>История всех запросов к AI-модели</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Расчёт</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Промпт (кратко)</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Логи появятся после первых запросов к AI
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sandbox">
          <Card>
            <CardHeader>
              <CardTitle>Песочница GPT</CardTitle>
              <CardDescription>Тестирование подбора аналогов с помощью AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sandbox-description">Описание ТЗ</Label>
                <Textarea
                  id="sandbox-description"
                  placeholder="Введите описание товара или услуги..."
                  rows={4}
                />
              </div>

              <div>
                <Label>Характеристики</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex gap-2">
                    <Input placeholder="Название характеристики" className="flex-1" />
                    <Input placeholder="Значение" className="flex-1" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Добавить характеристику
                  </Button>
                </div>
              </div>

              <Button onClick={handleTestGPT} className="w-full">
                Отправить запрос
              </Button>

              <div className="mt-6">
                <Label>Результат</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Здесь будет отображен JSON-ответ с подобранными аналогами
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Детали запроса</DialogTitle>
            <DialogDescription>Полный промпт и ответ от AI</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Промпт:</h3>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  {selectedLog.prompt}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Ответ:</h3>
                <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
                  {selectedLog.response}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
