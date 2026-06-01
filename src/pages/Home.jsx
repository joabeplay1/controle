import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateAppFromPrompt } from '../services/gemini';
import { storage } from '../services/storage';
import { Sparkles, Loader2 } from 'lucide-react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    try {
      const generated = await generateAppFromPrompt(prompt);
      const newProject = {
        id: crypto.randomUUID(),
        name: prompt.substring(0, 30) + '...',
        description: prompt,
        html_code: generated.html,
        css_code: generated.css,
        js_code: generated.js,
        createdAt: new Date().toISOString()
      };
      storage.saveProject(newProject);
      navigate(`/editor/${newProject.id}`);
    } catch (err) {
      setError(err.message || 'Falha ao gerar o projeto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pt-16 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-3 flex items-center justify-center gap-2">
          <Sparkles className="text-amber-500 w-8 h-8" /> GenForge AI
        </h1>
        <p className="text-muted-foreground text-lg">O que você deseja construir hoje?</p>
      </div>

      <div className="bg-card border p-6 rounded-xl shadow-sm space-y-4">
        <textarea
          className="w-full h-36 p-4 rounded-lg bg-background border resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          placeholder="Ex: Crie um app de Pomodoro minimalista com contador regressivo, efeitos sonoros e histórico de ciclos..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />
        {error && <p className="text-sm text-destructive font-medium">{error}</p>}
        <button
          onClick={handleCreate}
          disabled={loading || !prompt.trim()}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <> <Loader2 className="animate-spin w-5 h-5" /> Construindo sua aplicação... </>
          ) : (
            <> <Sparkles className="w-5 h-5" /> Gerar Aplicação </>
          )}
        </button>
      </div>
    </div>
  );
}
