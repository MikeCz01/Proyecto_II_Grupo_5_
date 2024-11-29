
const params = new URLSearchParams(window.location.search);
const numProcesos = parseInt(params.get('procesos')) || 4; 
const numMarcos = parseInt(params.get('marcos')) || 4;


let programas = Array.from({ length: numProcesos }, (_, i) => ({
    id: `P${i + 1}`,                  
    memoria: 1,                        
    usada: false,                     
    fallos: 0                          
}));

let memoriaFisica = Array.from({ length: numMarcos }, () => ({
    id: null,    
    pagina: null,  
    usada: false  
}));

let intervalo; 


let logArea = document.getElementById('logArea');
let framesContainer = document.getElementById('frames');
let programList = document.getElementById('programList');
let memoryInputsContainer = document.getElementById('memoryInputs');


function actualizarProgramas() {
    programList.innerHTML = ''; 
    programas.forEach(programa => {
        let div = document.createElement('div');
        div.classList.add('program');
        div.textContent = `${programa.id} (Memoria: ${programa.memoria} pág.)`;
        div.classList.add(programa.usada ? 'active' : 'inactive');
        programList.appendChild(div);
    });
}


function actualizarMemoria() {
    framesContainer.innerHTML = ''; 
    memoriaFisica.forEach((frame, index) => {
        let div = document.createElement('div');
        div.classList.add('frame');
        div.textContent = frame.id ? `${frame.id} (Pág: ${frame.pagina})` : `Marco ${index + 1}`;
        div.classList.add(frame.usada ? 'active' : 'inactive'); 
        framesContainer.appendChild(div);
    });
}


function crearControlesDeMemoria() {
    memoryInputsContainer.innerHTML = ''; 
    programas.forEach((programa, index) => {
        let div = document.createElement('div');
        div.classList.add('memory-control');
        
        let label = document.createElement('label');
        label.textContent = `Memoria de ${programa.id}: `;
        
        let input = document.createElement('input');
        input.type = 'number';
        input.value = programa.memoria; 
        input.min = 1; 
        input.max = numMarcos; 
        input.id = `memory-${index}`;
        
       
        input.addEventListener('change', (event) => {
            programa.memoria = parseInt(event.target.value);
        });
        
        div.appendChild(label);
        div.appendChild(input);
        memoryInputsContainer.appendChild(div);
    });
}


function accederAPagina(programa, pagina) {
   
    let paginaCargada = memoriaFisica.some(frame => frame.id === programa.id && frame.pagina === pagina);
    
    let estado = 'Sin fallo';  
    let memoriaFisicaAsignada = '';

    if (!paginaCargada) {
       
        programa.fallos++;
        estado = 'Fallo de página';
        logArea.innerHTML += `Fallo de página en el Programa ${programa.id} al intentar acceder a la página ${pagina}.<br>`;
       
        cargarPaginaEnMemoria(programa, pagina);
        memoriaFisicaAsignada = `Marco ${pagina}`;
    } else {
        memoriaFisicaAsignada = `Marco ${pagina}`;
    }

    
    actualizarTablaFallos(programa, pagina, memoriaFisicaAsignada, estado);
}


function cargarPaginaEnMemoria(programa, pagina) {
    
    let marcoLibre = memoriaFisica.find(frame => frame.id === null);
    
    if (marcoLibre) {
        
        marcoLibre.id = programa.id;
        marcoLibre.pagina = pagina;  
        marcoLibre.usada = true;
        logArea.innerHTML += `La página ${pagina} del Programa ${programa.id} se cargó en memoria.<br>`;
        actualizarMemoria();
    } else {
       
        logArea.innerHTML += `No hay espacio en memoria para cargar la página ${pagina} del Programa ${programa.id}.<br>`;
        
        algoritmoNRU();
    }
}


function actualizarTablaFallos(programa, pagina, memoriaFisicaAsignada, estado) {
    const pageFaultsTable = document.getElementById('pageFaultsTable').getElementsByTagName('tbody')[0];
    let row = document.createElement('tr');
    
    let cellProgram = document.createElement('td');
    cellProgram.textContent = programa.id;
    row.appendChild(cellProgram);
    
    let cellPage = document.createElement('td');
    cellPage.textContent = pagina;
    row.appendChild(cellPage);

    let cellMemoriaFisica = document.createElement('td');
    cellMemoriaFisica.textContent = memoriaFisicaAsignada;
    row.appendChild(cellMemoriaFisica);

    let cellEstado = document.createElement('td');
    cellEstado.textContent = estado;
    row.appendChild(cellEstado);
    
    pageFaultsTable.appendChild(row);
}


function algoritmoNRU() {
    let programa = programas.find(p => !p.usada); 
    if (!programa) return;

   
    let marcosLibres = memoriaFisica.filter(frame => frame.id === null).length;
    if (marcosLibres >= programa.memoria) {
       
        for (let i = 0; i < programa.memoria; i++) {
            let marcoLibre = memoriaFisica.find(frame => frame.id === null);
            marcoLibre.id = programa.id;
            marcoLibre.pagina = i + 1;  
            marcoLibre.usada = true;
        }
        programa.usada = true;
        logArea.innerHTML += `Programa ${programa.id} cargado (${programa.memoria} páginas).<br>`;
        actualizarProgramas();
        actualizarMemoria();
    } else {
       
        logArea.innerHTML += `No hay memoria suficiente para cargar el programa ${programa.id} (${programa.memoria} páginas).<br>`;
        
        algoritmoNRU(); 
    }
}


function reiniciarSimulacion() {
    programas = programas.map(p => ({ ...p, usada: false, fallos: 0 })); 
    memoriaFisica = memoriaFisica.map(f => ({ ...f, id: null, pagina: null, usada: false })); 
    logArea.innerHTML = ''; 
    actualizarProgramas();
    actualizarMemoria();
}


function iniciarSimulacion() {
    reiniciarSimulacion(); l
    intervalo = setInterval(() => {
        if (programas.every(p => p.usada)) { 
            clearInterval(intervalo);
            logArea.innerHTML += 'Simulación completa.<br>';
        } else {
            algoritmoNRU(); 
        }
    }, 2000);
}


function pararSimulacion() {
    clearInterval(intervalo); 
    logArea.innerHTML += 'Simulación detenida.<br>';
}


document.getElementById('startSimulation').addEventListener('click', iniciarSimulacion);
document.getElementById('stopSimulation').addEventListener('click', pararSimulacion);
document.getElementById('resetSimulation').addEventListener('click', reiniciarSimulacion);


actualizarProgramas();
actualizarMemoria();
crearControlesDeMemoria();
