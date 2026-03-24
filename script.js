let emulator;
let romFile;

document.getElementById('rom-input').addEventListener('change', function(e){
  romFile = e.target.files[0];
  if(romFile) alert(`ROM selecionada: ${romFile.name}`);
});

function startGame(){
  if(!romFile){
    alert('Selecione uma ROM primeiro!');
    return;
  }

  const canvas = document.getElementById('gameCanvas');

  // Inicializa EmulatorJS para Neo Geo
  emulator = new EmulatorJS({
    canvas: canvas,
    system: 'neogeo',       // Sistema Neo Geo
    romFile: romFile,
    biosFile: 'emulator/neogeo.zip', // O BIOS do Neo Geo
  });

  emulator.loadROM();
}

// Função para os botões de controle touch
function sendKey(key){
  if(emulator) emulator.sendKey(key);
}