import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { savePrompt } from "@/services/storageService";

interface PromptEditorProps {
  onPromptChange: (prompt: string) => void;
}

const PromptEditor: React.FC<PromptEditorProps> = ({ onPromptChange }) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSave = () => {
    if (!title.trim() || !prompt.trim()) {
      toast.error("Preencha o título e o prompt antes de salvar");
      return;
    }

    try {
      savePrompt({
        title,
        prompt,
        category: category || "Geral"
      });
      
      toast.success("Prompt salvo com sucesso!");
      
      // Limpar os campos após salvar
      setTitle("");
      setCategory("");
      setPrompt("");
      onPromptChange("");
    } catch (error) {
      toast.error("Erro ao salvar o prompt");
      console.error("Erro ao salvar:", error);
    }
  };

  const handlePromptChange = (value: string) => {
    setPrompt(value);
    onPromptChange(value);
  };

  const generatePrompt = async () => {
    if (!title.trim()) {
      toast.error("Digite um título para gerar o prompt");
      return;
    }

    setIsGenerating(true);

    try {
      // Aqui você pode integrar com uma API de IA para gerar o prompt
      // Por enquanto, vamos apenas simular uma geração
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const generatedPrompt = `# ${title}\n\n## Contexto\n[Descreva o contexto do problema ou situação]\n\n## Objetivo\n[Defina claramente o objetivo desejado]\n\n## Instruções\n1. [Primeira instrução]\n2. [Segunda instrução]\n3. [Terceira instrução]\n\n## Restrições\n- [Primeira restrição]\n- [Segunda restrição]\n\n## Formato da Resposta\n[Especifique o formato desejado para a resposta]\n\n## Exemplos\n[Forneça exemplos se necessário]\n\n## Notas Adicionais\n[Inclua quaisquer informações extras relevantes]`;
      
      handlePromptChange(generatedPrompt);
      toast.success("Prompt gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar o prompt");
      console.error("Erro ao gerar:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editor de Prompts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Digite um título para o prompt..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="geral">Geral</SelectItem>
                <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="vendas">Vendas</SelectItem>
                <SelectItem value="suporte">Suporte</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Digite ou gere seu prompt..."
              className="min-h-[300px] font-mono"
              value={prompt}
              onChange={(e) => handlePromptChange(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button
          variant="outline"
          onClick={generatePrompt}
          disabled={isGenerating || !title.trim()}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Gerar Prompt
            </>
          )}
        </Button>
        
        <Button
          onClick={handleSave}
          disabled={!title.trim() || !prompt.trim()}
        >
          <Save className="mr-2 h-4 w-4" />
          Salvar Prompt
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PromptEditor; 