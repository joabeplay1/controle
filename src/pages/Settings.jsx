import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { Key, Eye, EyeOff } from 'lucide-react';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    setApiKey(storage.getApiKey());
  }, []);

  const handleSave = () => {
    storage.setApiKey(apiKey.trim());
    alert("Chave API salva com sucesso!");
  };

  return (
    <div className="max-w-2xl mx-auto pt-12 px-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Key className="w-6 h-6" /> Configurações
      </h1>
      <div className="bg-card border rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Chave de API do Gemini</label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              className="w-full pl-3 pr-10 py-2 border rounded-lg bg-background text-sm"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Sua chave é salva estritamente local no seu navegador e não passa por servidores intermediários.
          </p>
        </div>
        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          Salvar Configurações
        </button>
      </div>
    </div>
  );
}
