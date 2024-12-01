// Obtener referencia al formulario
document.getElementById('configForm').addEventListener('submit', function (event) {
    event.preventDefault();

    // Capturar los valores del formulario
    const virtualMemory = parseInt(document.getElementById('virtualMemory').value);
    const physicalMemory = parseInt(document.getElementById('physicalMemory').value);
    const algoritmo = document.getElementById('algoritmo').value;

    // Verificar que los valores sean válidos
    if (virtualMemory <= 0 || physicalMemory <= 0) {
        alert('Los tamaños de memoria deben ser mayores a 0.');
        return;
    }

    // Mostrar en la consola para depuración
    console.log(`Algoritmo seleccionado: ${algoritmo}`);
    console.log(`Memoria Virtual: ${virtualMemory} MB`);
    console.log(`Memoria Física: ${physicalMemory} marcos`);

    // Redirigir según el algoritmo seleccionado
    switch (algoritmo) {
        case 'nru':
            console.log('Redirigiendo a NRU');
            window.location.href = `./NRU/simuladorNRU.html?virtualMemory=${virtualMemory}&physicalMemory=${physicalMemory}`;
            break;
        case 'reloj':
            console.log('Redirigiendo a Reloj');
            window.location.href = `./Reloj/simuladorReloj.html?virtualMemory=${virtualMemory}&physicalMemory=${physicalMemory}`;
            break;
        case 'fifo':
            console.log('Redirigiendo a FIFO');
            window.location.href = `./FIFO/VistaFIFO.html?virtualMemory=${virtualMemory}&physicalMemory=${physicalMemory}`;
            break;
        case 'optimo':
            console.log('Redirigiendo a Óptimo');
            window.location.href = `./Optimo/simulador.Optimo.html?virtualMemory=${virtualMemory}&physicalMemory=${physicalMemory}`;
            break;
        case 'segunda-oportunidad':
            console.log('Redirigiendo a Segunda Oportunidad');
            window.location.href = `./SegundaOp/SegundaOp.html?virtualMemory=${virtualMemory}&physicalMemory=${physicalMemory}`;
            break;
        default:
            alert('Seleccione un algoritmo de reemplazo válido.');
    }
});
