let apps = JSON.parse(localStorage.getItem('jr_apps')) || [];
let apiKey = localStorage.getItem('jr_api_key') || '';
let currentEditingId = null;

document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    checkApiStatus();
    renderAppList();
});

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.getElementById(`section-${sectionId}`).style.display = 'block';
    
    document.querySelectorAll('nav li').forEach(li => li.classList.remove('active'));
    const navItem = document.getElementById(`nav-${sectionId}`);
    if (navItem) navItem.classList.add('active');
}

function saveApiKey() {
    const key = document.getElementById('api-key-input').value;
    if (key.length < 10) {
        alert('Por favor, insira uma chave válida.');
        return;
    }
    apiKey = key;
    localStorage.setItem('jr_api_key', key);
    checkApiStatus();
    alert('Chave API configurada com sucesso!');
}

function checkApiStatus() {
    const statusText = document.getElementById('api-status-text');
    if (apiKey) {
        statusText.innerText = 'Conectado';
        statusText.className = 'status-on';
        document.getElementById('api-key-input').value = '********' + apiKey.slice(-4);
    }
}

// GERAÇÃO REAL USANDO A API DO GEMINI (OU OUTRA CADASTRADA)
async function generateApp() {
    const promptUser = document.getElementById('app-prompt').value;
    const tech = document.getElementById('app-tech').value;
    
    if (!promptUser) return alert('Descreva sua ideia primeiro.');
    if (!apiKey) return alert('Configure sua API Key antes de começar.');

    const progressDiv = document.getElementById('generation-progress');
    if (progressDiv) progressDiv.style.display = 'block';
    
    // Engenharia de Prompt para forçar a IA a devolver a estrutura separada e limpa
    const promptEngenharia = `
    Você é um gerador automático de aplicações web completas e funcionais.
    O usuário quer um aplicativo com a seguinte ideia: "${promptUser}" utilizando a tecnologia: "${tech}".
    
    Crie um aplicativo completo, moderno, responsivo, com design premium e totalmente funcional.
    Você DEVE retornar a resposta estritamente no formato JSON abaixo, sem blocos de texto Markdown antes ou depois. Certifique-se de escapar as aspas corretamente no JSON.
    
    {
      "name": "Nome curto para o App baseado na ideia",
      "html": "Todo o código estrutural do index.html (não inclua tags de estilo ou script externos, apenas a estrutura limpa)",
      "css": "Todo o código CSS do arquivo estilo.css com design moderno e responsivo",
      "js": "Todo o código JavaScript funcional do arquivo script.js que faça o app funcionar de verdade"
    }
    `;

    try {
        // Chamada para a API do Gemini
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptEngenharia }] }]
            })
        });

        const data = await response.json();
        let jsonTexto = data.candidates[0].content.parts[0].text;
        
        // Limpa possíveis marcações de bloco de código markdown que a IA possa ter colocado
        jsonTexto = jsonTexto.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const appGerado = JSON.parse(jsonTexto);

        const newApp = {
            id: Date.now(),
            name: appGerado.name || "App Customizado",
            description: promptUser,
            tech: tech,
            version: 1,
            createdAt: new Date().toLocaleDateString(),
            html: appGerado.html,
            css: appGerado.css,
            js: appGerado.js
        };
        
        apps.push(newApp);
        saveApps();
        
        document.getElementById('app-prompt').value = '';
        alert('Aplicativo completo gerado com sucesso!');
        
        showSection('my-apps');
        renderAppList();
        updateDashboard();

    } catch (error) {
        console.error(error);
        alert('Erro ao gerar o aplicativo. Verifique sua chave API ou o formato da resposta.');
    } finally {
        if (progressDiv) progressDiv.style.display = 'none';
    }
}

function renderAppList() {
    const grid = document.getElementById('apps-grid');
    grid.innerHTML = '';
    
    if (apps.length === 0) {
        grid.innerHTML = '<p>Nenhum aplicativo criado ainda.</p>';
        return;
    }

    apps.forEach(app => {
        const card = document.createElement('div');
        card.className = 'app-card';
        card.innerHTML = `
            <div class="app-card-header">${app.name}</div>
            <div class="app-card-body">
                <p><strong>Criado em:</strong> ${app.createdAt}</p>
                <p><strong>Tech:</strong> ${app.tech}</p>
                <p><strong>Versão:</strong> ${app.version}</p>
            </div>
            <div class="app-card-actions">
                <button onclick="editApp(${app.id})">Editar / Ver</button>
                <button onclick="deleteApp(${app.id})" style="color:red">Excluir</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function editApp(id) {
    const app = apps.find(a => a.id === id);
    if (!app) return;
    
    currentEditingId = id;
    document.getElementById('editing-app-name').innerText = app.name;
    document.getElementById('edit-name').value = app.name;
    
    // Preenche os campos do editor caso existam na sua UI, ou usa os códigos salvos
    showSection('editor');
    updatePreviewLive();
}

// RENDERIZAÇÃO REAL DENTRO DE UM IFRAME ISOLADO
function updatePreviewLive() {
    const app = apps.find(a => a.id === currentEditingId);
    if (!app) return;

    const name = document.getElementById('edit-name').value;
    
    // Atualiza o nome dinamicamente se alterado
    app.name = name;

    // Elemento iframe onde o app vai rodar isolado
    const previewContainer = document.getElementById('rendered-content');
    previewContainer.innerHTML = ''; // Limpa preview estático anterior

    const iframe = document.createElement('iframe');
    iframe.id = 'app-preview-frame';
    iframe.style.width = '100%';
    iframe.style.height = '500px';
    iframe.style.border = 'none';
    iframe.style.backgroundColor = '#fff';
    
    previewContainer.appendChild(iframe);

    // Monta a estrutura completa injetando o CSS e JS gerados pela IA
    const códigoCompleto = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${app.name}</title>
            <style>
                ${app.css}
            </style>
        </head>
        <body>
            ${app.html}
            <script>
                try {
                    ${app.js}
                } catch (err) {
                    console.error("Erro no script do App Gerado:", err);
                }
            <\/script>
        </body>
        </html>
    `;

    // Injeta o código de forma dinâmica no iframe para ele executar na hora
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(códigoCompleto);
    doc.close();
}

function saveCurrentApp() {
    const index = apps.findIndex(a => a.id === currentEditingId);
    if (index === -1) return;
    
    apps[index].name = document.getElementById('edit-name').value;
    apps[index].version++;
    
    saveApps();
    alert('Alterações salvas com sucesso!');
    renderAppList();
}

function deleteApp(id) {
    if (confirm('Tem certeza que deseja excluir este aplicativo? Esta ação não pode ser desfeita.')) {
        apps = apps.filter(a => a.id !== id);
        saveApps();
        renderAppList();
        updateDashboard();
    }
}

function updateDashboard() {
    const statCount = document.getElementById('stat-count');
    if(statCount) statCount.innerText = apps.length;
    
    const list = document.getElementById('activity-list');
    if (list) {
        if (apps.length > 0) {
            list.innerHTML = apps.slice(-3).reverse().map(app => `<li>Projeto "${app.name}" foi atualizado.</li>`).join('');
        } else {
            list.innerHTML = '<li>Comece configurando sua chave API para criar seu primeiro app.</li>';
        }
    }
}

function saveApps() {
    localStorage.setItem('jr_apps', JSON.stringify(apps));
}

function setPreviewSize(size) {
    const frame = document.getElementById('app-preview-frame');
    if (frame) {
        frame.className = `preview-${size}`;
    }
}

function toggleAssistant() {
    const drawer = document.getElementById('assistant-drawer');
    drawer.classList.toggle('drawer-closed');
    if (!drawer.classList.contains('drawer-closed') && document.getElementById('chat-messages').innerHTML === '') {
        addChatMessage('ai', 'Olá! Eu sou o Jesus Reina AI. Em que posso ajudar na criação do seu aplicativo hoje?');
    }
}

function addChatMessage(type, text) {
    const chat = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `msg msg-${type}`;
    div.innerText = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    
    addChatMessage('user', text);
    input.value = '';
    
    setTimeout(() => {
        if (text.toLowerCase().includes('exportar')) {
            addChatMessage('ai', 'Para exportar, clique no botão "Exportar para Vercel" para baixar seus arquivos estruturados.');
        } else {
            addChatMessage('ai', 'Estou analisando suas instruções para aplicar melhorias direto no código fonte.');
        }
    }, 1000);
}

// DOWNLOAD DOS ARQUIVOS SEPARADOS PRONTOS PARA DEPLOY (VERCEL / NETLIFY)
function exportZip() {
    const app = apps.find(a => a.id === currentEditingId);
    if (!app) return alert('Selecione ou edite um aplicativo primeiro para exportar.');

    // Função auxiliar para disparar o download individual dos arquivos estruturados
    function downloadArquivo(conteudo, nomeArquivo, tipo) {
        const blob = new Blob([conteudo], { type: tipo });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = nomeArquivo;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    // Código index.html adaptado apontando para os arquivos locais relativos
    const htmlEstruturado = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${app.name}</title>
    <link rel="stylesheet" href="estilo.css">
</head>
<body>
    ${app.html}
    <script src="script.js"></script>
</body>
</html>`;

    // Dispara o download dos 3 arquivos limpos na raiz
    downloadArquivo(htmlEstruturado, 'index.html', 'text/html');
    downloadArquivo(app.css, 'estilo.css', 'text/css');
    downloadArquivo(app.js, 'script.js', 'text/javascript');

    alert('Pronto! Os arquivos index.html, estilo.css e script.js foram baixados. Agora basta colocá-los em uma pasta e arrastar para o painel da Vercel!');
}
