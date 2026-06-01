// Utilitários de Armazenamento local
const Storage = { 
  save: (key, val) => localStorage.setItem('sw_' + key, JSON.stringify(val)), 
  get: (key) => JSON.parse(localStorage.getItem('sw_' + key)) 
};

// Músicas Padrão (Mock)
const mockTracks = [
  {id:1, title:'Ocean Breezes', artist:'Lofi Chill', art:'https://picsum.photos/seed/1/300', url:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', genre:'Lofi'},
  {id:2, title:'Midnight City', artist:'Synthwave Pro', art:'https://picsum.photos/seed/2/300', url:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', genre:'Electronic'},
  {id:3, title:'Mountain Trek', artist:'Nature Sounds', art:'https://picsum.photos/seed/3/300', url:'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', genre:'Ambient'}
];

// Estado da Aplicação
let state = { 
  tracks: Storage.get('tracks') || mockTracks, 
  playlists: Storage.get('playlists') || [{id:1, name:'Favoritos', tracks:[]}], 
  favorites: Storage.get('favorites') || [], 
  currentView: 'home', 
  currentTrackIndex: -1, 
  isPlaying: false, 
  shuffle: false, 
  repeat: false 
};

const audio = new Audio();

// Seleção de Elementos DOM
const elements = { 
  view: document.getElementById('dynamic-view'), 
  nav: document.querySelectorAll('nav li'), 
  playBtn: document.getElementById('btn-play-pause'), 
  progress: document.getElementById('progress-bar'), 
  track: document.getElementById('progress-track'), 
  curTime: document.getElementById('current-time'), 
  totTime: document.getElementById('total-time'), 
  vol: document.getElementById('volume-slider'), 
  search: document.getElementById('global-search'), 
  themeBtn: document.getElementById('theme-toggle'),
  nextBtn: document.getElementById('btn-next'),
  prevBtn: document.getElementById('btn-prev'),
  driveBtn: document.getElementById('drive-connect-btn')
};

// Inicialização
function init() { 
  renderView('home'); 
  attachListeners(); 
}

// Ouvintes de Eventos (Event Listeners)
function attachListeners() { 
  elements.nav.forEach(li => li.addEventListener('click', () => { 
    elements.nav.forEach(n => n.classList.remove('active')); 
    li.classList.add('active'); 
    renderView(li.dataset.view); 
  })); 

  elements.playBtn.addEventListener('click', togglePlay); 
  
  elements.vol.addEventListener('input', (e) => audio.volume = e.target.value / 100); 
  
  elements.track.addEventListener('click', (e) => { 
    const rect = elements.track.getBoundingClientRect(); 
    const pos = (e.clientX - rect.left) / rect.width; 
    if(audio.duration) audio.currentTime = pos * audio.duration; 
  }); 

  // Atualização automática de progresso usando eventos nativos
  audio.addEventListener('timeupdate', updateProgress);

  // Avanço automático quando a música acaba
  audio.addEventListener('ended', () => {
    if (state.repeat) {
      audio.currentTime = 0;
      audio.play();
    } else {
      playNext();
    }
  });

  // Listener Corrigido para Pesquisa Global
  elements.search.addEventListener('input', (e) => { 
    const query = e.target.value.toLowerCase(); 
    const filtered = state.tracks.filter(t => t.title.toLowerCase().includes(query) || t.artist.toLowerCase().includes(query)); 
    
    state.currentView = 'search';
    elements.view.innerHTML = `<div style='padding:32px'><h2>Resultados da Pesquisa</h2><div class='grid-container'>${renderCards(filtered)}</div></div>`;
  }); 

  elements.themeBtn.addEventListener('click', () => { 
    document.getElementById('app').classList.toggle('light-theme'); 
  }); 

  elements.nextBtn.addEventListener('click', playNext); 
  elements.prevBtn.addEventListener('click', playPrev); 
  
  elements.driveBtn.addEventListener('click', () => {
    alert('Integração com Google Drive: Solicitando permissões OAuth2... (Simulado)');
  }); 
}

// Renderização de Telas Dinâmicas
function renderView(view) { 
  state.currentView = view; 
  let html = ''; 
  
  switch(view) { 
    case 'home': 
      html = `<div style='padding:32px'><h2>Bem-vindo de volta</h2><div class='grid-container'>${renderCards(state.tracks)}</div></div>`; 
      break; 
    case 'library': 
      html = `<div style='padding:32px; display:flex; justify-content:space-between; align-items:center;'><h2>Toda sua Música</h2><button class='main-btn' onclick='importLocal()'>+</button></div><div class='grid-container'>${renderCards(state.tracks)}</div>`; 
      break; 
    case 'playlists': 
      html = `<div style='padding:32px; display:flex; justify-content:space-between; align-items:center;'><h2>Suas Playlists</h2><button id='new-pl' style='background:var(--accent); border:none; padding:8px 16px; border-radius:20px; color:white; font-weight:bold; cursor:pointer;' onclick='createPlaylist()'>Criar Nova</button></div><div class='grid-container'>${renderPlaylists()}</div>`; 
      break; 
    case 'favorites': 
      const favs = state.tracks.filter(t => state.favorites.includes(t.id)); 
      html = `<div style='padding:32px'><h2>Favoritos</h2><div class='grid-container'>${renderCards(favs)}</div></div>`; 
      break; 
    default: 
      html = `<div style='padding:32px'><h2>${view.charAt(0).toUpperCase() + view.slice(1)}</h2><p>Página em desenvolvimento...</p></div>`; 
  } 
  elements.view.innerHTML = html; 
}

// Renderizadores de Cards Auxiliares
function renderCards(list) { 
  if(list.length === 0) return '<p style="color:var(--text-dim)">Nenhuma música encontrada.</p>';
  return list.map((t) => `<div class='card' onclick='playTrackById(${t.id})'><img src='${t.art}' alt='Capa'><h4>${t.title}</h4><p>${t.artist}</p></div>`).join(''); 
}

function renderPlaylists() { 
  return state.playlists.map(pl => `<div class='card' onclick='alert("Abrindo playlist...")'><div style='height:150px; background:#333; display:flex; align-items:center; justify-content:center; font-size:3rem; border-radius:4px;'>🎵</div><h4>${pl.name}</h4><p>${pl.tracks.length} músicas</p></div>`).join(''); 
}

// Mecânicas do Áudio Player
function playTrackById(id) { 
  const idx = state.tracks.findIndex(t => t.id === id); 
  if(idx !== -1) { 
    state.currentTrackIndex = idx; 
    const track = state.tracks[idx]; 
    audio.src = track.url; 
    audio.play()
      .then(() => {
        state.isPlaying = true; 
        updatePlayerUI(track); 
      })
      .catch(err => console.log("Erro ao reproduzir faixa: ", err));
  } 
}

function togglePlay() { 
  if(!audio.src && state.tracks.length > 0) {
    playTrackById(state.tracks[0].id); 
  } else if(audio.paused) { 
    audio.play(); 
    state.isPlaying = true; 
  } else { 
    audio.pause(); 
    state.isPlaying = false; 
  } 
  elements.playBtn.innerHTML = state.isPlaying ? '⏸' : '▶'; 
}

function playNext() { 
  if(state.tracks.length === 0) return;
  let next = state.currentTrackIndex + 1; 
  if(next >= state.tracks.length) next = 0; 
  playTrackById(state.tracks[next].id); 
}

function playPrev() { 
  if(state.tracks.length === 0) return;
  let prev = state.currentTrackIndex - 1; 
  if(prev < 0) prev = state.tracks.length - 1; 
  playTrackById(state.tracks[prev].id); 
}

function updatePlayerUI(track) { 
  document.getElementById('player-title').innerText = track.title; 
  document.getElementById('player-artist').innerText = track.artist; 
  document.getElementById('player-art').src = track.art; 
  elements.playBtn.innerHTML = '⏸'; 
}

function updateProgress() { 
  if(audio.duration) { 
    const perc = (audio.currentTime / audio.duration) * 100; 
    elements.progress.style.width = perc + '%'; 
    elements.curTime.innerText = formatTime(audio.currentTime); 
    elements.totTime.innerText = formatTime(audio.duration); 
  } 
}

function formatTime(sec) { 
  const m = Math.floor(sec / 60); 
  const s = Math.floor(sec % 60); 
  return `${m}:${s < 10 ? '0' : ''}${s}`; 
}

// Manipulação do Usuário (Criar Playlists e Importar Arquivos)
function createPlaylist() { 
  const name = prompt('Nome da Playlist:'); 
  if(name) { 
    state.playlists.push({id: Date.now(), name, tracks: []}); 
    Storage.save('playlists', state.playlists); 
    renderView('playlists'); 
  } 
}

function importLocal() { 
  const input = document.createElement('input'); 
  input.type = 'file'; 
  input.accept = 'audio/*'; 
  input.onchange = (e) => { 
    const file = e.target.files[0]; 
    if(!file) return;
    
    const url = URL.createObjectURL(file); 
    const newTrack = { 
      id: Date.now(), 
      title: file.name.replace(/\.[^/.]+$/, ''), 
      artist: 'Arquivo Local', 
      art: 'https://via.placeholder.com/300/1db954/ffffff?text=MP3', 
      url 
    }; 
    state.tracks.push(newTrack); 
    Storage.save('tracks', state.tracks); 
    renderView('library'); 
  }; 
  input.click(); 
}

// Inicia o app
init();
