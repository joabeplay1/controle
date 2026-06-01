import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '../services/storage';
import { Folder, Trash2, ExternalLink } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    setProjects(storage.getProjects());
  }, []);

  const handleDelete = (id) => {
    if (confirm("Tem certeza que deseja excluir este projeto?")) {
      storage.deleteProject(id);
      setProjects(storage.getProjects());
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Meus Projetos</h1>
        <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          Novo Projeto
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 border rounded-xl border-dashed">
          <Folder className="mx-auto w-12 h-12 text-muted-foreground mb-3 opacity-60" />
          <p className="text-muted-foreground">Nenhum projeto encontrado. Comece criando um na Home!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-card border rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <h3 className="font-semibold text-lg line-clamp-1 mb-1">{project.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">Criado em: {new Date(project.createdAt).toLocaleDateString()}</p>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{project.description}</p>
              </div>
              <div className="flex justify-between items-center mt-2 pt-3 border-t">
                <Link to={`/editor/${project.id}`} className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
                  Abrir no Editor <ExternalLink className="w-3 h-3" />
                </Link>
                <button onClick={() => handleDelete(project.id)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
