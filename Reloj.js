
const numProcesos = 4; 
const numMarcos = 4;   


let programas = Array.from({ length: numProcesos }, (_, i) => ({
    id: `P${i + 1}`,       
    memoria: 1,            
    usada: false,          
    fallos: 0             
}));

let memoriaFisica = Array.from({ length: numMarcos }, () => ({
    id: null,       
    pagina: null,   
    usada: false,   
}));

let punteroReloj = 0;
let intervalo;        


const logArea = document.getElementById('logArea');
const framesContainer = document.getElementById('frames');
const programList = document.getElementById('programList');
const memoryInputsContainer = document.getElementById('memoryInputs');
const pageFaultsTable = document.getElementById('pageFaultsTable').querySelector('tbody');


function actualizarProgramas() {
    programList.innerHTML = '';
    programas.forEach(programa => {
        let div = document.createElement('div');
        div.className = 'program';
        div.textContent = `${programa.id} (${programa.memoria} pág.)`;
        div.classList.add(programa.usada ? 'active' : 'inactive');
        programList.appendChild(div);
    });
}


function actualizarMemoria() {
    framesContainer.innerHTML = '';
    memoriaFisica.forEach((frame, index) => {
        let div = document.createElement('div');
        div.className = 'frame p-2 border text-center';
        div.textContent = frame.id
            ? `${frame.id} (Pág: ${frame.pagina})`
            : `Marco ${index + 1}`;
        div.style.backgroundColor = frame.usada ? '#d4edda' : '#f8d7da';
        framesContainer.appendChild(div);
    });
}


function registrarFallo(programa, pagina, estado) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${programa.id}</td>
        <td>${pagina}</td>
        <td>${estado === 'Fallo' ? 'Reemplazo' : 'Asignado'}</td>
        <td>${estado}</td>
    `;
    pageFaultsTable.appendChild(row);
}


function algoritmoReloj(programa, pagina) {
    while (true) {
        let frame = memoriaFisica[punteroReloj];

        
        if (!frame.usada) {
            frame.id = programa.id;
            frame.pagina = pagina;
            frame.usada = true;
            programa.fallos++;
            registrarFallo(programa, pagina, 'Fallo');
            punteroReloj = (punteroReloj + 1) % numMarcos;
            return;
        }


        frame.usada = false;
        punteroReloj = (punteroReloj + 1) % numMarcos;
    }
}

function accederAPagina(programa, pagina) {
    const frame = memoriaFisica.find(f => f.id === programa.id && f.pagina === pagina);

    if (frame) {
        frame.usada = true; 
        registrarFallo(programa, pagina, 'Sin fallo');
    } else {
        algoritmoReloj(programa, pagina); 
    }

    actualizarMemoria();
}


function iniciarSimulacion() {
    reiniciarSimulacion();

    intervalo = setInterval(() => {
        const programa = programas.find(p => !p.usada);
        if (!programa) {
            clearInterval(intervalo);
            logArea.innerHTML += 'Simulación completada.<br>';
            return;
        }

        const pagina = Math.ceil(Math.random() * programa.memoria); 
        accederAPagina(programa, pagina);

        programa.usada = true;
    }, 2000);
}


function reiniciarSimulacion() {
    programas.forEach(p => (p.usada = false));
    memoriaFisica.forEach(f => {
        f.id = null;
        f.pagina = null;
        f.usada = false;
    });
    punteroReloj = 0;
    logArea.innerHTML = '';
    pageFaultsTable.innerHTML = '';
    actualizarProgramas();
    actualizarMemoria();
}


function pararSimulacion() {
    clearInterval(intervalo);
    logArea.innerHTML += 'Simulación detenida.<br>';
}


actualizarProgramas();
actualizarMemoria();
document.getElementById('startSimulation').addEventListener('click', iniciarSimulacion);
document.getElementById('stopSimulation').addEventListener('click', pararSimulacion);
document.getElementById('resetSimulation').addEventListener('click', reiniciarSimulacion);
