// Obtener parámetros desde la URL
const params = new URLSearchParams(window.location.search);
const numProcesos = parseInt(params.get('procesos')) || 4; // Número de procesos seleccionados
const numMarcos = parseInt(params.get('marcos')) || 4; // Número de marcos de memoria seleccionados

// Configuración inicial basada en los parámetros seleccionados
let programas = Array.from({ length: numProcesos }, (_, i) => ({
    id: `P${i + 1}`,                  // Identificador del proceso
    memoria: 1,                        // Valor por defecto de memoria (1 página)
    usada: false,                      // Estado inicial
    fallos: 0                          // Inicialmente, sin fallos
}));

let memoriaFisica = Array.from({ length: numMarcos }, () => ({
    id: null,    // Sin proceso cargado inicialmente
    pagina: null,  // Sin página cargada
    usada: false  // Marco no utilizado
}));

let intervalo; // Variable global para el intervalo de la simulación

// Referencias a elementos HTML
let logArea = document.getElementById('logArea');
let framesContainer = document.getElementById('frames');
let programList = document.getElementById('programList');
let memoryInputsContainer = document.getElementById('memoryInputs');

// Función para actualizar la lista de programas en ejecución
function actualizarProgramas() {
    programList.innerHTML = ''; // Limpiar lista
    programas.forEach(programa => {
        let div = document.createElement('div');
        div.classList.add('program');
        div.textContent = `${programa.id} (Memoria: ${programa.memoria} pág.)`;
        div.classList.add(programa.usada ? 'active' : 'inactive'); // Estado visual
        programList.appendChild(div);
    });
}

// Función para actualizar el estado de la memoria física
function actualizarMemoria() {
    framesContainer.innerHTML = ''; // Limpiar memoria física
    memoriaFisica.forEach((frame, index) => {
        let div = document.createElement('div');
        div.classList.add('frame');
        div.textContent = frame.id ? `${frame.id} (Pág: ${frame.pagina})` : `Marco ${index + 1}`;
        div.classList.add(frame.usada ? 'active' : 'inactive'); // Estado visual
        framesContainer.appendChild(div);
    });
}

// Función para crear los controles de memoria para cada programa
function crearControlesDeMemoria() {
    memoryInputsContainer.innerHTML = ''; // Limpiar contenedores anteriores
    programas.forEach((programa, index) => {
        let div = document.createElement('div');
        div.classList.add('memory-control');
        
        let label = document.createElement('label');
        label.textContent = `Memoria de ${programa.id}: `;
        
        let input = document.createElement('input');
        input.type = 'number';
        input.value = programa.memoria; // Valor inicial del input
        input.min = 1;  // Mínimo de 1 página de memoria
        input.max = numMarcos;  // Máximo número de marcos disponibles
        input.id = `memory-${index}`;
        
        // Actualiza la memoria cuando se cambia el valor
        input.addEventListener('change', (event) => {
            programa.memoria = parseInt(event.target.value);
        });
        
        div.appendChild(label);
        div.appendChild(input);
        memoryInputsContainer.appendChild(div);
    });
}

// Función para simular el acceso a una página y detectar fallos
function accederAPagina(programa, pagina) {
    // Buscar si la página está en algún marco de memoria
    let paginaCargada = memoriaFisica.some(frame => frame.id === programa.id && frame.pagina === pagina);
    
    let estado = 'Sin fallo';  // Estado inicial
    let memoriaFisicaAsignada = '';

    if (!paginaCargada) {
        // Ha ocurrido un fallo de página
        programa.fallos++;
        estado = 'Fallo de página';
        logArea.innerHTML += `Fallo de página en el Programa ${programa.id} al intentar acceder a la página ${pagina}.<br>`;
        // Cargar la página en memoria
        cargarPaginaEnMemoria(programa, pagina);
        memoriaFisicaAsignada = `Marco ${pagina}`;
    } else {
        memoriaFisicaAsignada = `Marco ${pagina}`;
    }

    // Actualizar la tabla de fallos
    actualizarTablaFallos(programa, pagina, memoriaFisicaAsignada, estado);
}

// Función para cargar una página en memoria
function cargarPaginaEnMemoria(programa, pagina) {
    // Buscar un marco libre en la memoria
    let marcoLibre = memoriaFisica.find(frame => frame.id === null);
    
    if (marcoLibre) {
        // Si hay espacio, cargamos la página
        marcoLibre.id = programa.id;
        marcoLibre.pagina = pagina;  // Guardamos la página en el marco
        marcoLibre.usada = true;
        logArea.innerHTML += `La página ${pagina} del Programa ${programa.id} se cargó en memoria.<br>`;
        actualizarMemoria();
    } else {
        // Si no hay espacio, ejecutar algoritmo de reemplazo (por ejemplo, NRU)
        logArea.innerHTML += `No hay espacio en memoria para cargar la página ${pagina} del Programa ${programa.id}.<br>`;
        // Usar algoritmo de reemplazo de página
        algoritmoNRU();
    }
}

// Función para actualizar la tabla de fallos
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

// Algoritmo NRU: Implementación básica para cargar procesos en memoria física
function algoritmoNRU() {
    let programa = programas.find(p => !p.usada); // Encuentra el próximo programa a cargar
    if (!programa) return;

    // Verificar si hay suficientes marcos libres
    let marcosLibres = memoriaFisica.filter(frame => frame.id === null).length;
    if (marcosLibres >= programa.memoria) {
        // Cargar el programa completo en memoria
        for (let i = 0; i < programa.memoria; i++) {
            let marcoLibre = memoriaFisica.find(frame => frame.id === null);
            marcoLibre.id = programa.id;
            marcoLibre.pagina = i + 1;  // Cargar páginas del programa en memoria
            marcoLibre.usada = true;
        }
        programa.usada = true; // Marcar el programa como cargado
        logArea.innerHTML += `Programa ${programa.id} cargado (${programa.memoria} páginas).<br>`;
        actualizarProgramas();
        actualizarMemoria();
    } else {
        // No hay suficiente memoria para cargar el programa
        logArea.innerHTML += `No hay memoria suficiente para cargar el programa ${programa.id} (${programa.memoria} páginas).<br>`;
        // Avanzar al siguiente programa
        algoritmoNRU(); // Recursividad para intentar cargar el siguiente programa
    }
}

// Función para reiniciar la simulación
function reiniciarSimulacion() {
    programas = programas.map(p => ({ ...p, usada: false, fallos: 0 })); // Restablecer estado de los programas
    memoriaFisica = memoriaFisica.map(f => ({ ...f, id: null, pagina: null, usada: false })); // Vaciar memoria
    logArea.innerHTML = ''; // Limpiar logs
    actualizarProgramas();
    actualizarMemoria();
}

// Función para iniciar la simulación
function iniciarSimulacion() {
    reiniciarSimulacion(); // Resetear estado inicial
    intervalo = setInterval(() => {
        if (programas.every(p => p.usada)) { // Todos los procesos están en memoria
            clearInterval(intervalo); // Detener simulación
            logArea.innerHTML += 'Simulación completa.<br>';
        } else {
            algoritmoNRU(); // Continuar cargando procesos
        }
    }, 2000); // Intervalo de 2 segundos entre iteraciones
}

// Función para detener la simulación
function pararSimulacion() {
    clearInterval(intervalo); // Detener la simulación
    logArea.innerHTML += 'Simulación detenida.<br>';
}

// Eventos para botones de simulación
document.getElementById('startSimulation').addEventListener('click', iniciarSimulacion);
document.getElementById('stopSimulation').addEventListener('click', pararSimulacion);
document.getElementById('resetSimulation').addEventListener('click', reiniciarSimulacion);

// Inicializar la vista inicial y los controles de memoria
actualizarProgramas();
actualizarMemoria();
crearControlesDeMemoria();
