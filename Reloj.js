// Parámetros iniciales
const numProcesos = 4; // Número de procesos simulados
const numMarcos = 4;   // Número de marcos en memoria física

// Configuración inicial: Cada programa utiliza 1 página
let programas = Array.from({ length: numProcesos }, (_, i) => ({
    id: `P${i + 1}`,       // Identificador del programa
    memoria: 1,            // Cada programa ocupa 1 página
    usada: false,          // No usado inicialmente
    fallos: 0              // Contador de fallos
}));

let memoriaFisica = Array.from({ length: numMarcos }, () => ({
    id: null,       // Sin programa asignado inicialmente
    pagina: null,   // Sin página asignada
    usada: false,   // Bit de uso
}));

let punteroReloj = 0; // Puntero del algoritmo de reloj
let intervalo;        // Intervalo de simulación

// Referencias HTML
const logArea = document.getElementById('logArea');
const framesContainer = document.getElementById('frames');
const programList = document.getElementById('programList');
const memoryInputsContainer = document.getElementById('memoryInputs');
const pageFaultsTable = document.getElementById('pageFaultsTable').querySelector('tbody');

// Actualizar lista de programas
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

// Actualizar memoria física
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

// Registrar un fallo de página en la tabla
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

// Algoritmo de reemplazo de Reloj
function algoritmoReloj(programa, pagina) {
    while (true) {
        let frame = memoriaFisica[punteroReloj];

        // Si el bit de uso es 0, reemplazar
        if (!frame.usada) {
            frame.id = programa.id;
            frame.pagina = pagina;
            frame.usada = true;
            programa.fallos++;
            registrarFallo(programa, pagina, 'Fallo');
            punteroReloj = (punteroReloj + 1) % numMarcos;
            return;
        }

        // Si el bit de uso es 1, se limpia y avanza el puntero
        frame.usada = false;
        punteroReloj = (punteroReloj + 1) % numMarcos;
    }
}

// Simulación del acceso a páginas
function accederAPagina(programa, pagina) {
    const frame = memoriaFisica.find(f => f.id === programa.id && f.pagina === pagina);

    if (frame) {
        frame.usada = true; // Actualizar bit de uso
        registrarFallo(programa, pagina, 'Sin fallo');
    } else {
        algoritmoReloj(programa, pagina); // Aplicar algoritmo de reemplazo
    }

    actualizarMemoria();
}

// Simulación paso a paso
function iniciarSimulacion() {
    reiniciarSimulacion();

    intervalo = setInterval(() => {
        const programa = programas.find(p => !p.usada);
        if (!programa) {
            clearInterval(intervalo);
            logArea.innerHTML += 'Simulación completada.<br>';
            return;
        }

        const pagina = Math.ceil(Math.random() * programa.memoria); // Página aleatoria
        accederAPagina(programa, pagina);

        programa.usada = true;
    }, 2000);
}

// Reiniciar simulación
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

// Detener simulación
function pararSimulacion() {
    clearInterval(intervalo);
    logArea.innerHTML += 'Simulación detenida.<br>';
}

// Inicializar
actualizarProgramas();
actualizarMemoria();
document.getElementById('startSimulation').addEventListener('click', iniciarSimulacion);
document.getElementById('stopSimulation').addEventListener('click', pararSimulacion);
document.getElementById('resetSimulation').addEventListener('click', reiniciarSimulacion);
