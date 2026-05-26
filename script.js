const splashScreen = document.getElementById('splash-screen');
const mainApp = document.getElementById('main-app');
const gameGrid = document.getElementById('game-grid');
const gamePlayScreen = document.getElementById('game-play-screen');
const settingsScreen = document.getElementById('settings-screen');
const romImportScreen = document.getElementById('rom-import-screen');
const playingGameTitle = document.getElementById('playing-game-title');
const romFileInput = document.getElementById('rom-file-input');
const selectedRomInfo = document.getElementById('selected-rom-info');
const arcadeSelectSound = document.getElementById('arcade-select-sound');
const arcadeStartSound = document.getElementById('arcade-start-sound');
const arcadeBgMusic = document.getElementById('arcade-bg-music');
const sidebarMenuItems = document.querySelectorAll('.sidebar-menu-item');

let currentScreen = 'home';
let games = [];

// Mock game data
const mockGames = [
    { id: 'kof98', name: 'The King of Fighters \'98', category: 'Neo Geo', cover: 'https://via.placeholder.com/180x180/ff0055/ffffff?text=KOF98' },
    { id: 'mslug', name: 'Metal Slug', category: 'Neo Geo', cover: 'https://via.placeholder.com/180x180/ff0055/ffffff?text=MSLUG' },
    { id: 'sf2ce', name: 'Street Fighter II\' CE', category: 'CPS1', cover: 'https://via.placeholder.com/180x180/ff0055/ffffff?text=SF2CE' },
    { id: 'msh', name: 'Marvel Super Heroes', category: 'CPS2', cover: 'https://via.placeholder.com/180x180/ff0055/ffffff?text=MSH' },
    { id: 'sf33s', name: 'Street Fighter III 3rd Strike', category: 'CPS3', cover: 'https://via.placeholder.com/180x180/ff0055/ffffff?text=SF33S' },
    { id: 'outrun', name: 'Out Run', category: 'Sega Arcade', cover: 'https://via.placeholder.com/180x180/ff0055/ffffff?text=OUTRUN' },
    { id: 'garou', name: 'Garou: Mark of the Wolves', category: 'Neo Geo', cover: 'https://via.placeholder.com/180x180/ff0055/ffffff?text=GAROU' },
    { id: 'punisher', name: 'The Punisher', category: 'CPS1', cover: 'https://via.placeholder.com/180x180/ff0055/ffffff?text=PUNISHER' },
    { id: 'dino', name: 'Cadillacs and Dinosaurs', category: 'CPS1', cover: 'https://via.placeholder.com/180x180/ff0055/ffffff?text=DINO' },
    { id: 'sfa3', name: 'Street Fighter Alpha 3', category: 'CPS2', cover: 'https://via.placeholder.com/180x180/ff0055/ffffff?text=SFA3' },
    { id: 'vampire', name: 'Vampire Savior', category: 'CPS2', cover: 'https://via.placeholder.com/180x180/ff0055/ffffff?text=VAMPIRE' },
    { id: 'jojoba', name: 'JoJo\'s Bizarre Adventure', category: 'CPS3', cover: 'https://via.placeholder.com/180x180/ff0055/ffffff?text=JOJOBA' },
    { id: 'daytona', name: 'Daytona USA', category: 'Sega Arcade', cover: 'https://via.placeholder.com/180x180/ff0055/ffffff?text=DAYTONA' },
    { id: 'ssf2t', name: 'Super Street Fighter II Turbo', category: 'CPS1', cover: 'https://via.placeholder.com/180x180/ff0055/ffffff?text=SSF2T' },
    { id: 'samsho', name: 'Samurai Shodown', category: 'Neo Geo', cover: 'https://via.placeholder.com/180x180/ff0055/ffffff?text=SAMSHO' },
    { id: 'fatalf', name: 'Fatal Fury Special', category: 'Neo Geo', cover: 'https://via.placeholder.com/180x180/ff0055/ffffff?text=FATALF' },
    { id: 'xmen', name: 'X-Men: Children of the Atom', category: 'CPS2', cover: 'https://via.placeholder.com/180x180/ff0055/ffffff?text=XMEN' },
    { id: 'alienvs', name: 'Alien vs. Predator', category: 'CPS2', cover: 'https://via.placeholder.com/180x180/ff0055/ffffff?text=ALIENVS' },
    { id: 'powerinst', name: 'Power Instinct', category: 'MAME Arcade', cover: 'https://via.placeholder.com/180x180/ff0055/ffffff?text=POWERINST' },
    { id: 'rtype', name: 'R-Type', category: 'MAME Arcade', cover: 'https://via.placeholder.com/180x180/ff0055/ffffff?text=RTYPE' },
    { id: 'gng', name: 'Ghosts \'n Goblins', category: 'MAME Arcade', cover: 'https://via.placeholder.com/180x180/ff0055/ffffff?text=GNG' },
    { id: 'wonderboy', name: 'Wonder Boy', category: 'Sega Arcade', cover: 'https://via.placeholder.com/180x180/ff0055/ffffff?text=WONDERBOY' },
    { id: 'goldenaxe', name: 'Golden Axe', category: 'Sega Arcade', cover: 'https://via.placeholder.com/180x180/ff0055/ffffff?text=GOLDENAXE' },
    { id: 'mk', name: 'Mortal Kombat', category: 'MAME Arcade', cover: 'https://via.placeholder.com/180x180/ff0055/ffffff?text=MK' },
    { id: 'tekken3', name: 'Tekken 3 (PS1)', category: 'PlayStation 1', cover: 'https://via.placeholder.com/180x180/ff0055/ffffff?text=TEKKEN3' },
    { id: 'crashb', name: 'Crash Bandicoot (PS1)', category: 'PlayStation 1', cover: 'https://via.placeholder.com/180x180/ff0055/ffffff?text=CRASHB' },
];

function loadGames(filterCategory = null, searchTerm = '') {
    gameGrid.innerHTML = '';
    let filteredGames = games;

    if (filterCategory && filterCategory !== 'Todos os Jogos') {
        if (filterCategory === 'Favorites') {
            filteredGames = filteredGames.filter(game => game.isFavorite);
        } else if (filterCategory === 'History') {
            filteredGames = filteredGames.filter(game => game.lastPlayed);
            filteredGames.sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed));
        } else {
            filteredGames = filteredGames.filter(game => game.category === filterCategory);
        }
    }

    if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        filteredGames = filteredGames.filter(game =>
            game.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            game.category.toLowerCase().includes(lowerCaseSearchTerm)
        );
    }

    if (filteredGames.length === 0) {
        gameGrid.innerHTML = '<p style="text-align: center; color: var(--neon-red); font-size: 1.2em; margin-top: 50px;">Nenhum jogo encontrado nesta categoria ou com este termo de busca.</p>';
        return;
    }

    filteredGames.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.classList.add('game-card');
        gameCard.innerHTML = `
            <img src="${game.cover}" alt="${game.name} Cover" class="game-card-cover">
            <div class="game-card-info">
                <h3 class="game-card-title">${game.name}</h3>
                <p class="game-card-category">${game.category}</p>
            </div>
        `;
        gameCard.onclick = () => startGame(game.name);
        gameGrid.appendChild(gameCard);
    });
}

function startGame(gameName) {
    arcadeStartSound.play();
    playingGameTitle.textContent = `Carregando ${gameName}...`;
    showScreen('gamePlay');
    setTimeout(() => {
        playingGameTitle.textContent = `Jogando: ${gameName}`;
    }, 2000);
}

function exitGame() {
    arcadeSelectSound.play();
    showScreen('home');
}

function showScreen(screenId) {
    document.querySelectorAll('#main-app > div').forEach(screen => screen.classList.remove('active'));
    document.querySelectorAll('#main-app > section').forEach(screen => screen.classList.remove('active'));
    gamePlayScreen.classList.remove('active');
    settingsScreen.classList.remove('active');
    romImportScreen.classList.remove('active');

    sidebarMenuItems.forEach(item => item.classList.remove('active'));

    if (screenId === 'home') {
        document.getElementById('home-screen').classList.add('active');
        document.querySelector('.sidebar-menu-item[data-screen="home"]').classList.add('active');
        loadGames();
    } else if (screenId === 'gamePlay') {
        gamePlayScreen.classList.add('active');
    } else if (screenId === 'settings') {
        settingsScreen.classList.add('active');
    } else if (screenId === 'romImport') {
        romImportScreen.classList.add('active');
        selectedRomInfo.textContent = 'Nenhum arquivo selecionado.'; 
        romFileInput.value = ''; 
    }
    currentScreen = screenId;
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        splashScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        showScreen('home'); 
        arcadeBgMusic.play().catch(e => console.log("Autoplay prevented:", e));
    }, 3000);

    games = [...mockGames];
    loadGames();

    sidebarMenuItems.forEach(item => {
        item.addEventListener('click', () => {
            arcadeSelectSound.play();
            sidebarMenuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const category = item.dataset.category;
            if (category) {
                loadGames(category);
            } else {
                loadGames(); 
            }
            document.getElementById('game-search').value = ''; 
        });
    });

    romFileInput.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            let fileNames = Array.from(files).map(file => file.name).join(', ');
            selectedRomInfo.textContent = `Selecionado: ${fileNames}`;
        } else {
            selectedRomInfo.textContent = 'Nenhum arquivo selecionado.';
        }
    });

    document.getElementById('game-search').addEventListener('input', (event) => {
        const searchTerm = event.target.value;
        const activeCategoryItem = document.querySelector('.sidebar-menu-item.active');
        const currentCategory = activeCategoryItem ? activeCategoryItem.dataset.category : null;
        loadGames(currentCategory, searchTerm);
    });
});

function simulateSaveState() {
    arcadeSelectSound.play();
    alert('Save State simulado!');
}

function simulateLoadState() {
    arcadeSelectSound.play();
    alert('Load State simulado!');
}

let turboMode = false;
function toggleTurboMode() {
    arcadeSelectSound.play();
    turboMode = !turboMode;
    alert(`Modo Turbo: ${turboMode ? 'ATIVADO' : 'DESATIVADO'}`);
}

let crtShader = true;
function toggleShader() {
    arcadeSelectSound.play();
    crtShader = !crtShader;
    alert(`Shader CRT: ${crtShader ? 'ATIVADO' : 'DESATIVADO'}`);
}

function saveSettings() {
    arcadeSelectSound.play();
    alert('Configurações salvas (simulado)!');
    showScreen('home');
}

function processRomFiles() {
    arcadeStartSound.play();
    const files = romFileInput.files;
    if (files.length === 0) {
        alert('Por favor, selecione pelo menos um arquivo de ROM.');
        return;
    }

    alert(`Simulando processamento de ${files.length} ROMs. (Nenhuma emulação real ocorrerá)`);
    if (files.length > 0) {
        const newGameName = files[0].name.replace(/\.(zip|7z|rom|bin|iso)$/i, '').replace(/_/g, ' ');
        const newGame = {
            id: `custom-${Date.now()}`,
            name: newGameName,
            category: 'MAME Arcade',
            cover: 'https://via.placeholder.com/180x180/00ffff/000000?text=NOVA+ROM'
        };
        games.push(newGame);
        alert(`"${newGameName}" adicionado à sua biblioteca (simulado)!`);
    }
    showScreen('home');
}

function searchGames() {
    arcadeSelectSound.play();
    const searchTerm = document.getElementById('game-search').value;
    const activeCategoryItem = document.querySelector('.sidebar-menu-item.active');
    const currentCategory = activeCategoryItem ? activeCategoryItem.dataset.category : null;
    loadGames(currentCategory, searchTerm);
}

function autoDownloadCovers() {
    arcadeSelectSound.play();
    alert('Simulando download automático de capas...');
}

document.getElementById('arcade-music').addEventListener('change', (event) => {
    if (event.target.checked) {
        arcadeBgMusic.play().catch(e => console.log("Autoplay prevented:", e));
    } else {
        arcadeBgMusic.pause();
    }
});

document.getElementById('master-volume').addEventListener('input', (event) => {
    const volume = event.target.value / 100;
    arcadeBgMusic.volume = volume;
    arcadeSelectSound.volume = volume;
    arcadeStartSound.volume = volume;
});
