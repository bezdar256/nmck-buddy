import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Trash2, FolderPlus, Folder, FolderOpen, FileSpreadsheet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const RequestsList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [requestsRes, foldersRes] = await Promise.all([
        supabase
          .from("requests")
          .select(`
            *,
            aggregated_results (recommended_nmck),
            analogs (count)
          `)
          .order("created_at", { ascending: false }),
        supabase
          .from("folders")
          .select("*")
          .order("name")
      ]);

      if (requestsRes.error) throw requestsRes.error;
      if (foldersRes.error) throw foldersRes.error;
      
      setRequests(requestsRes.data || []);
      setFolders(foldersRes.data || []);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось загрузить данные",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: { variant: "secondary", label: "Черновик" },
      calculated: { variant: "default", label: "Рассчитан" },
      approved: { variant: "outline", label: "Утверждён" },
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const { error } = await supabase
        .from("folders")
        .insert({ name: newFolderName.trim() });

      if (error) throw error;

      toast({ title: "Папка создана" });
      setNewFolderName("");
      setShowNewFolderInput(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteFolder = async (folderId: string) => {
    try {
      const { error } = await supabase
        .from("folders")
        .delete()
        .eq("id", folderId);

      if (error) throw error;

      toast({ title: "Папка удалена" });
      if (selectedFolder === folderId) setSelectedFolder(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const moveToFolder = async (requestId: string, folderId: string | null) => {
    try {
      const { error } = await supabase
        .from("requests")
        .update({ folder_id: folderId })
        .eq("id", requestId);

      if (error) throw error;

      toast({ title: folderId ? "Перемещено в папку" : "Убрано из папки" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteRequest = async () => {
    if (!requestToDelete) return;

    try {
      const { error } = await supabase
        .from("requests")
        .delete()
        .eq("id", requestToDelete);

      if (error) throw error;

      toast({ title: "Расчёт удалён" });
      setDeleteDialogOpen(false);
      setRequestToDelete(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    const matchesFolder = selectedFolder === null || req.folder_id === selectedFolder;
    return matchesSearch && matchesStatus && matchesFolder;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">История расчётов НМЦК</h1>
          <p className="text-muted-foreground">Все ваши расчёты и обоснования</p>
        </div>
        <Button asChild>
          <Link to="/requests/new">
            <Plus className="mr-2 h-4 w-4" />
            Новый расчёт
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar with folders */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Button
                  variant={selectedFolder === null ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedFolder(null)}
                >
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Все расчёты
                  <span className="ml-auto text-xs text-muted-foreground">
                    {requests.length}
                  </span>
                </Button>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Папки</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewFolderInput(!showNewFolderInput)}
                    >
                      <FolderPlus className="h-4 w-4" />
                    </Button>
                  </div>

                  {showNewFolderInput && (
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="Название папки"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && createFolder()}
                      />
                      <Button size="sm" onClick={createFolder}>
                        ОК
                      </Button>
                    </div>
                  )}

                  {folders.map((folder) => (
                    <div key={folder.id} className="group flex items-center">
                      <Button
                        variant={selectedFolder === folder.id ? "secondary" : "ghost"}
                        className="flex-1 justify-start"
                        onClick={() => setSelectedFolder(folder.id)}
                      >
                        <Folder className="mr-2 h-4 w-4" />
                        {folder.name}
                        <span className="ml-auto text-xs text-muted-foreground">
                          {requests.filter(r => r.folder_id === folder.id).length}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={() => deleteFolder(folder.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="md:col-span-3">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по названию..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="draft">Черновик</SelectItem>
                    <SelectItem value="calculated">Рассчитан</SelectItem>
                    <SelectItem value="approved">Утверждён</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Название закупки</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">НМЦК, ₽</TableHead>
                  <TableHead className="text-right">Аналогов</TableHead>
                  <TableHead>Папка</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Загрузка...
                    </TableCell>
                  </TableRow>
                ) : filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Расчёты не найдены
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-muted/50">
                      <TableCell>
                        {new Date(request.created_at).toLocaleDateString("ru-RU")}
                      </TableCell>
                      <TableCell>
                        <Link to={`/requests/${request.id}`} className="font-medium hover:text-primary flex items-center gap-2">
                          {request.uploaded_file_name && (
                            <FileSpreadsheet className="h-4 w-4 text-green-600" />
                          )}
                          {request.title}
                        </Link>
                      </TableCell>
                      <TableCell>{request.category || "—"}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-right font-mono">
                        {request.aggregated_results?.[0]?.recommended_nmck?.toLocaleString("ru-RU") || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {request.analogs?.[0]?.count || 0}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={request.folder_id || "none"}
                          onValueChange={(val) => moveToFolder(request.id, val === "none" ? null : val)}
                        >
                          <SelectTrigger className="h-8 w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Без папки</SelectItem>
                            {folders.map((folder) => (
                              <SelectItem key={folder.id} value={folder.id}>
                                {folder.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (request.status === "draft") {
                                navigate(`/requests/new/${request.id}`);
                              } else {
                                navigate(`/requests/${request.id}`);
                              }
                            }}
                          >
                            {request.status === "draft" ? "Продолжить" : "Открыть"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setRequestToDelete(request.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить расчёт?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Расчёт и все связанные данные будут удалены безвозвратно.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={deleteRequest} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RequestsList;
