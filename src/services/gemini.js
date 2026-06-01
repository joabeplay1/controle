import { storage } from './storage';

export async function generateAppFromPrompt(prompt, currentCode = null) {
  const apiKey = storage.getApiKey();
  if (!apiKey) throw new Error("Por favor, configure sua chave API do Gemini primeiro.");

  const systemInstruction = `Você é um gerador de aplicações web frontend de página única (SPA). 
  Você deve responder ESTRITAMENTE com um objeto JSON válido contendo três chaves: "html", "css" e "js". 
  Não adicione markdown, blocos de código (\`\`\`json) ou explicações textuais fora do JSON.
  Estrutura esperada: { "html": "...", "css": "...", "js": "..." }`;

  const userPrompt = currentCode 
    ? `Código Atual HTML: ${currentCode.html}\nCSS: ${currentCode.css}\nJS: ${currentCode.js}\n\nSolicitação de alteração do usuário: ${prompt}`
    : `Crie um aplicativo completo baseado nesse prompt: ${prompt}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error?.message || "Erro ao consultar o Gemini.");
  }

  const data = await response.json();
  const textResponse = data.candidates[0].content.parts[0].text;
  return JSON.parse(textResponse);
}
