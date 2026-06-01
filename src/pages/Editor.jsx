import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';
import { generateAppFromPrompt } from '../services/gemini';
import { Play, Code, Eye, Save, Sparkles, Loader2, ArrowLeft, Download } from 'lucide-react';

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('html'); // html | css | js
  const [mode, setMode] = useState('split'); // split | code | preview
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [srcDoc, setSrcDoc] = useState('');

  useEffect(() => {
    const proj = storage.getProject(id);
    if (!proj) {
      alert("Projeto não encontrado");
      navigate('/projects');
      return;
    }
    setProject(proj);
  }, [id, navigate]);

  useEffect(() => {
    if (!project) return;
    const timeout = setTimeout(() => {
      setSrcDoc(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${project.css_code}</style>
        </head>
        <body>
          ${project.html_code}
          <script>${project.js_code}</script>
        </body>
        </html>
      `);
    }, 500);
    return () => clearTimeout(timeout);
  }, [project]);

  const handleCodeChange = (field, value) => {
    setProject(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    storage.saveProject(project);
    alert("Projeto salvo com sucesso localmente!");
  };

  const handleAiRefine = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const currentCode = { html: project.html_code, css: project.css_code, js: project.js_code };
      const updated = await generateAppFromPrompt(aiPrompt, currentCode);
      setProject(prev => ({
        ...prev,
        html_code: updated.html,
        css_code: updated.css,
        js_code: updated.js
      }));
      setAiPrompt('');
    } catch (err) {
      alert(err.message || "Erro ao atualizar com IA");
    } finally {
      setAiLoading(false);
    }
  };

  const handleExportSingleHTML = () => {
    const blob = new Blob([srcDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, '-生产') || 'app'}.html`;
    a.click();
  };

  if (!project) return <div className="p-8">Carregando editor...</div>;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header do Editor */}
      <header className="h-14 border-b px-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/projects')} className="p-2 hover:bg-accent rounded-lg">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold max-w-xs truncate">{project.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMode('code')} className={`px-3 py-1.5 rounded-md text-xs font-medium ${mode === 'code' ? 'bg-primary text-white' : 'hover:bg-accent'}`}><Code className="w-3.5 h-3.5 inline mr-1" />Código</button>
          <button onClick={() => setMode('split')} className={`px-3 py-1.5 rounded-md text-xs font-medium ${mode === 'split' ? 'bg-primary text-white' : 'hover:bg-accent'}`}><Play className="w-3.5 h-3.5 inline mr-1" />Split</button>
          <button onClick={() => setMode('preview')} className={`px-3 py-1.5 rounded-md text-xs font-medium ${mode === 'preview' ? 'bg-primary text-white' : 'hover:bg-accent'}`}><Eye className="w-3.5 h-3.5 inline mr-1" />Preview</button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportSingleHTML} className="p-2 border rounded-lg hover:bg-accent text-xs font-medium flex items-center gap-1" title="Exportar HTML Integrado">
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Exportar</span>
          </button>
          <button onClick={handleSave} className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium flex items-center gap-1">
            <Save className="w-4 h-4" /> <span className="hidden sm:inline">Salvar</span>
          </button>
        </div>
      </header>

      {/* Grid Principal */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        {/* Painel Esquerdo: Código e Prompt de Refinamento */}
        {(mode === 'code' || mode === 'split') && (
          <div className={`flex flex-col border-r h-full ${mode === 'code' ? 'md:col-span-12' : 'md:col-span-6'}`}>
            {/* Abas do código */}
            <div className="flex border-b bg-muted/40 text-xs">
              {['html', 'css', 'js'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 border-r font-mono font-medium capitalize ${activeTab === tab ? 'bg-background border-b-transparent font-bold' : 'opacity-70'}`}>
                  {tab === 'js' ? 'javascript' : tab}
                </button>
              ))}
            </div>
            {/* Caixa de Texto do Código */}
            <textarea
              className="flex-1 w-full p-4 font-mono text-sm bg-stone-900 text-stone-100 resize-none focus:outline-none"
              value={activeTab === 'html' ? project.html_code : activeTab === 'css' ? project.css_code : project.js_code}
              onChange={(e) => handleCodeChange(`${activeTab}_code`, e.target.value)}
            />
            {/* Barra Chat com IA */}
            <div className="p-3 border-t bg-card flex gap-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border rounded-lg text-sm bg-background"
                placeholder="Pedir modificação para a IA (ex: mude o fundo para azul escuro)..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                disabled={aiLoading}
              />
              <button onClick={handleAiRefine} disabled={aiLoading || !aiPrompt.trim()} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-medium flex items-center gap-1 hover:bg-purple-700 disabled:opacity-50">
                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                Refinar
              </button>
            </div>
          </div>
        )}

        {/* Painel Direito: Iframe Preview */}
        {(mode === 'preview' || mode === 'split') && (
          <div className={`h-full bg-stone-100 flex flex-col ${mode === 'preview' ? 'md:col-span-12' : 'md:col-span-6'}`}>
            <iframe
              srcDoc={srcDoc}
              title="Application Preview"
              sandbox="allow-scripts"
              className="w-full h-full bg-white border-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
