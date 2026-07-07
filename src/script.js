const GEMINI_MODELS=["gemini-2.5-flash","gemini-2.0-flash"];
const GROQ_MODELS=["llama-3.3-70b-versatile","deepseek-r1-distill-llama-70b","llama3-70b-8192"];
let isGenerating=false,abortController=null,currentCode="",editMode=false,currentProjectId=null,fsView="desktop";
const STORAGE_KEY="omega_projects_v2";

const SYSTEM_PROMPT=`
OMEGA AUTO SOFTWARE FACTORY — MODO PROFISSIONAL AVANÇADO

IDENTIDADE: IA de engenharia de software sênior. Pensa como engenheiro da Apple + arquiteto full-stack.

MISSÃO: Criar software REAL, COMPLETO, BONITO e 100% FUNCIONAL que impressione ao abrir.

CAPACIDADES: web apps multi-view, dashboards com Chart.js CDN, games canvas, lojas, SaaS, CRMs, redes sociais.

PROCESSO OBRIGATÓRIO: 1.Analise profundamente 2.Defina arquitetura e design system 3.Planeje interações e animações 4.Escreva TODO código mentalmente 5.Gere saída final completa.

PADRÕES: Design system com variáveis CSS, Google Fonts, responsivo Grid/Flex, animações, dark mode, localStorage, micro-interações, acessibilidade básica, roteamento por hash para multi-tela.

CDN PERMITIDOS: Chart.js(cdn.jsdelivr.net/npm/chart.js), Sortable.js, Marked.js, DayJS.

COMPLETUDE ABSOLUTA: 100% das funções completas. ZERO "// resto aqui", "// TODO". Cada botão funciona. Cada form valida. Cada lista tem empty state.

PROIBIDO: código parcial, placeholder Lorem ipsum, botão sem ação, markdown, crases, comentários de omissão, design genérico sem personalidade.

FORMATO SAGRADO: APENAS HTML. Primeira linha: <!DOCTYPE html>. CSS em <style>. JS em <script>. Última linha: </html>. NADA antes ou depois.
`;

// ── Particle background ─────────────────────────────────────────────────────
function initParticles(){
  const c=document.getElementById("particles");if(!c)return;
  const ctx=c.getContext("2d");let w,h,stars=[],rot=0;
  function resize(){w=c.width=innerWidth;h=c.height=innerHeight;}
  function mk(){stars=[];const n=Math.min(160,Math.floor(w*h/9000));for(let i=0;i<n;i++)stars.push({a:Math.random()*Math.PI*2,r:Math.random()*Math.max(w,h)*0.6,z:Math.random()*0.8+0.2,sz:Math.random()*1.4+0.3,tw:Math.random()*Math.PI*2});}
  resize();mk();
  addEventListener("resize",()=>{resize();mk();});
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  function loop(){
    ctx.clearRect(0,0,w,h);
    const cx=w/2,cy=h/2;
    if(!reduced)rot+=0.0006;
    // nebula glow
    const grd=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(w,h)*0.5);
    grd.addColorStop(0,"rgba(124,58,237,0.08)");
    grd.addColorStop(0.5,"rgba(56,40,120,0.04)");
    grd.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=grd;ctx.fillRect(0,0,w,h);
    for(const s of stars){
      s.tw+=0.018;
      const ang=s.a+rot;
      const x=cx+Math.cos(ang)*s.r*s.z;
      const y=cy+Math.sin(ang)*s.r*s.z*0.7;
      const a=0.35+Math.abs(Math.sin(s.tw))*0.6*s.z;
      ctx.beginPath();
      ctx.arc(x,y,s.sz*s.z,0,Math.PI*2);
      ctx.fillStyle="rgba(190,180,255,"+a.toFixed(3)+")";
      ctx.fill();
    }
    requestAnimationFrame(loop);
  }
  loop();
}

// ── Storage ──────────────────────────────────────────────────────────────────
function getProjects(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]")}catch{return[]}}
function saveProjects(ps){localStorage.setItem(STORAGE_KEY,JSON.stringify(ps))}
function saveCurrentProject(){
  if(!currentCode)return;
  const ps=getProjects();
  const name=document.getElementById("prompt").value.trim().slice(0,40)||"Projeto sem nome";
  if(currentProjectId){
    const idx=ps.findIndex(p=>p.id===currentProjectId);
    if(idx>=0){ps[idx]={...ps[idx],code:currentCode,prompt:document.getElementById("prompt").value,updatedAt:Date.now()};saveProjects(ps);renderHistory();return;}
  }
  const p={id:Date.now().toString(),name,prompt:document.getElementById("prompt").value,code:currentCode,createdAt:Date.now(),updatedAt:Date.now()};
  ps.unshift(p);saveProjects(ps);currentProjectId=p.id;renderHistory();
}
function renderHistory(){
  const ps=getProjects();
  const el=document.getElementById("history-list");
  if(!ps.length){el.innerHTML='<p style="font-size:11px;color:var(--muted);padding:8px;text-align:center;font-style:italic">Nenhum projeto salvo</p>';return;}
  el.innerHTML=ps.map(p=>`
    <div class="history-item" onclick="loadProject('${p.id}')">
      <div style="flex:1;min-width:0">
        <div style="font-size:12px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</div>
        <div style="font-size:10px;color:var(--muted)">${new Date(p.updatedAt).toLocaleDateString("pt-BR",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
      </div>
      <button class="del-btn" onclick="event.stopPropagation();delProject('${p.id}')" title="Excluir">🗑</button>
    </div>
  `).join("");
}
function loadProject(id){
  const p=getProjects().find(x=>x.id===id);
  if(!p)return;
  currentCode=p.code;currentProjectId=p.id;
  document.getElementById("prompt").value=p.prompt||"";
  showCode(p.code);addLog("📂 Projeto carregado: "+p.name);
}
function delProject(id){
  const ps=getProjects().filter(p=>p.id!==id);
  saveProjects(ps);
  if(currentProjectId===id){currentProjectId=null;}
  renderHistory();addLog("🗑 Projeto excluído.");
}
function newProject(){
  currentCode="";currentProjectId=null;
  document.getElementById("prompt").value="";
  document.getElementById("output-frame").style.display="none";
  document.getElementById("preview-empty").style.display="flex";
  document.getElementById("code-output").style.display="none";
  document.getElementById("code-empty").style.display="flex";
  document.getElementById("copy-btn").disabled=true;
  document.getElementById("download-btn").disabled=true;
  document.getElementById("split-btn").disabled=true;
  document.getElementById("fs-btn").disabled=true;
  document.getElementById("dl-split-btn").disabled=true;
  addLog("✚ Novo projeto iniciado.");
}

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded",()=>{
  initParticles();
  atualizarModelos();configurarResponsivo();renderHistory();
  document.getElementById("generate-btn").addEventListener("click",gerarProjeto);
  document.getElementById("stop-btn").addEventListener("click",pararGeracao);
  document.getElementById("api-provider").addEventListener("change",atualizarModelos);
  document.getElementById("eye-btn").addEventListener("click",()=>{const i=document.getElementById("api-key");i.type=i.type==="password"?"text":"password";});
  document.getElementById("prompt").addEventListener("keydown",e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey))gerarProjeto();});
  addEventListener("keydown",e=>{if(e.key==="Escape")closeFullscreen();});
  window.addEventListener("message",e=>{
    if(e.data?.type==="omega_text_edit"&&e.data.html){
      currentCode="<!DOCTYPE html>\n"+e.data.html;
      document.getElementById("code-output").textContent=currentCode;
      saveCurrentProject();
    }
  });
});

function atualizarModelos(){
  const p=document.getElementById("api-provider").value;
  const s=document.getElementById("model-select");
  const m=p==="gemini"?GEMINI_MODELS:GROQ_MODELS;
  s.innerHTML=m.map(x=>`<option value="${x}">${x}</option>`).join("");
}
function addLog(txt){
  const log=document.getElementById("status-log");
  const p=document.createElement("p");p.textContent=new Date().toLocaleTimeString()+" — "+txt;
  log.appendChild(p);log.scrollTop=log.scrollHeight;
}
function isCodeCut(c){
  const t=c.trim();
  if(!t.toLowerCase().endsWith("</html>"))return true;
  if(!t.toLowerCase().includes("</body>"))return true;
  const so=(t.match(/<script/gi)||[]).length,sc=(t.match(/<\/script>/gi)||[]).length;
  if(so>sc)return true;
  const op=(t.match(/\{/g)||[]).length,cl=(t.match(/\}/g)||[]).length;
  if(op-cl>5)return true;
  return false;
}
function cleanCode(raw){
  let code=raw.replace(/<think>[\s\S]*?<\/think>/gi,"").replace(/```html\s*/gi,"").replace(/```javascript\s*/gi,"").replace(/```css\s*/gi,"").replace(/```\s*/g,"").replace(/^[\s\S]*?(?=<!DOCTYPE html>|<html)/i,"").trim();
  if(!code.toLowerCase().startsWith("<!doctype")){const idx=code.toLowerCase().indexOf("<html");if(idx>0)code=code.substring(idx);code="<!DOCTYPE html>\n"+code;}
  if(!code.toLowerCase().includes("<html")){code=`<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n<meta charset="UTF-8">\n<style>body{font-family:Arial,sans-serif;padding:20px}</style>\n</head>\n<body>\n${code}\n</body>\n</html>`;}
  if(isCodeCut(code)){const so=(code.match(/<script/gi)||[]).length,sc=(code.match(/<\/script>/gi)||[]).length;let fix=code;for(let i=0;i<so-sc;i++)fix+="\n}catch(e){}\n
