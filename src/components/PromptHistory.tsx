import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { getPrompts, deletePrompt, toggleFavorite, importPrompts, exportPrompts } from '@/services/storageService';
import type { SavedPrompt } from '@/services/storageService';
import { Star, Download, Upload, Search, Trash2, Copy } from 'lucide-react';

interface PromptHistoryProps {
  onSelectPrompt?: (prompt: SavedPrompt) => void;
}

export function PromptHistory({ onSelectPrompt }: PromptHistoryProps) {
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = () => {
    const savedPrompts = getPrompts();
    setPrompts(savedPrompts);
  };

  const handleDelete = (id: string) => {
    deletePrompt(id);
    loadPrompts();
    toast.success('Prompt excluído com sucesso');
  };

  const handleToggleFavorite = (id: string) => {
    const updatedPrompt = toggleFavorite(id);
    if (updatedPrompt) {
      loadPrompts();
      toast.success(updatedPrompt.isFavorite ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
    }
  };

  const handleExport = () => {
    const exportData = exportPrompts();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompts-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Prompts exportados com sucesso');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);
        
        if (!importData.prompts || !Array.isArray(importData.prompts)) {
          throw new Error('Formato de arquivo inválido');
        }

        importPrompts(importData.prompts);
        loadPrompts();
        setShowImportDialog(false);
        toast.success('Prompts importados com sucesso');
      } catch (error) {
        toast.error('Erro ao importar prompts');
      }
    };
    reader.readAsText(file);
  };

  const handleCopyPrompt = (prompt: SavedPrompt) => {
    navigator.clipboard.writeText(prompt.prompt);
    toast.success('Prompt copiado para a área de transferência');
  };

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = !showFavoritesOnly || prompt.isFavorite;
    return matchesSearch && matchesFavorite;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={showFavoritesOnly ? "bg-primary/10" : ""}
          >
            <Star className={`w-4 h-4 mr-1 ${showFavoritesOnly ? "fill-primary" : ""}`} />
            Favoritos
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1" />
            Exportar
          </Button>
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-1" />
                Importar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importar Prompts</DialogTitle>
                <DialogDescription>
                  Selecione um arquivo JSON exportado anteriormente para importar seus prompts.
                </DialogDescription>
              </DialogHeader>
              <Input
                type="file"
                accept=".json"
                onChange={handleImport}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                  Cancelar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-4">
          {filteredPrompts.map((prompt) => (
            <Card key={prompt.id} className="relative group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{prompt.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleFavorite(prompt.id)}
                      className="h-8 w-8"
                    >
                      <Star className={`w-4 h-4 ${prompt.isFavorite ? "fill-primary" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyPrompt(prompt)}
                      className="h-8 w-8"
                      title="Copiar prompt"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    {onSelectPrompt && (
                      <Button
                        variant="ghost"
                        onClick={() => onSelectPrompt(prompt)}
                        className="h-8"
                      >
                        Usar Prompt
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(prompt.id)}
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {new Date(prompt.timestamp).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {prompt.prompt}
                </p>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Categoria: {prompt.category}
                </p>
              </CardFooter>
            </Card>
          ))}
          {filteredPrompts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum prompt encontrado
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 