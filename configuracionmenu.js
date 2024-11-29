document.getElementById('configForm').addEventListener('submit', function (event) {
    event.preventDefault();

    // Capturar valores del formulario
    const numProcesos = parseInt(document.getElementById('numProcesos').value);
    const numMarcos = parseInt(document.getElementById('numMarcos').value);
    const algoritmo = document.getElementById('algoritmo').value;

    if (algoritmo === 'nru') {
        window.location.href = `simulador.html?procesos=${numProcesos}&marcos=${numMarcos}`;
    }else if(algoritmo === 'reloj'){
        window.location.href = `simuladorreloj.html?procesos=${numProcesos}&marcos=${numMarcos}`;
    }
    else {
        alert('Solo se ha implementado el algoritmo NRU en esta simulación.');
    }
});