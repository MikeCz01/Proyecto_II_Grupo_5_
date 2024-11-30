function simulateClock() {
    const numFrames = parseInt(document.getElementById("numFrames").value);
    const pageSequence = document.getElementById("pageSequence").value.split(',').map(Number);
  
    if (isNaN(numFrames) || numFrames <= 0 || pageSequence.length === 0) {
      alert("Por favor, ingresa un número válido de marcos y una secuencia de páginas.");
      return;
    }
  
    const frames = new Array(numFrames).fill(null); // Marco de páginas
    const useBits = new Array(numFrames).fill(0); // Bits de uso
    const pageArrivalTimes = {}; // Tiempos de llegada para cada página
    const pageWaitingTimes = {}; // Tiempos de espera para cada página
    const pageBlockTimes = {}; // Tiempos de bloqueo para cada página
    let currentTime = 0; // Tiempo global
    let pageFaults = 0;
    let pointer = 0; // Puntero del reloj
  
    const logOutput = document.getElementById("log-output");
    logOutput.innerHTML = "";
  
    const frameContainer = document.getElementById("frame-container");
    frameContainer.innerHTML = "";
  
    // Inicializar marcos vacíos en el DOM
    for (let i = 0; i < numFrames; i++) {
      const frameDiv = document.createElement("div");
      frameDiv.classList.add("frame", "border", "rounded", "p-3", "mx-2", "text-center");
      frameDiv.style.width = "50px";
      frameDiv.style.backgroundColor = "#f8f9fa";
      frameDiv.id = `frame-${i}`;
      frameContainer.appendChild(frameDiv);
    }
  
    // Limpiar tabla de resultados al inicio
    const pageFaultsTableBody = document.getElementById("pageFaultsTableBody");
    pageFaultsTableBody.innerHTML = "";
  
    pageSequence.forEach((page) => {
      const logEntry = document.createElement("div");
  
      // Verificar si la página ya está en memoria (HIT)
      let hitIndex = frames.indexOf(page);
      if (hitIndex !== -1) {
        logEntry.textContent = `Página ${page} encontrada (HIT).`;
        useBits[hitIndex] = 1; // Actualizar bit de uso
        highlightFrame(page, "bg-success text-white");
  
        // Calcular tiempo de espera si no se ha registrado antes
        if (!pageWaitingTimes[page]) {
          pageWaitingTimes[page] = currentTime - pageArrivalTimes[page];
        }
  
        addToTable(page, "HIT", frames.join(', '), pageWaitingTimes[page], 0);
      } else {
        // Página no encontrada (FAULT)
        while (true) {
          // Si el marco señalado tiene un bit de uso de 0, reemplazar
          if (useBits[pointer] === 0) {
            const replacedPage = frames[pointer];
            frames[pointer] = page; // Reemplazar página
            useBits[pointer] = 1; // Establecer bit de uso a 1
            pageArrivalTimes[page] = currentTime; // Registrar tiempo de llegada
  
            if (replacedPage !== null) {
              pageBlockTimes[replacedPage] = currentTime - (pageArrivalTimes[replacedPage] || currentTime);
            }
  
            pointer = (pointer + 1) % numFrames; // Mover el puntero
            break;
          }
  
          // Si el marco señalado tiene un bit de uso de 1, limpiar y mover puntero
          useBits[pointer] = 0;
          pointer = (pointer + 1) % numFrames;
        }
  
        pageFaults++;
        logEntry.textContent = `Página ${page} no encontrada (FAULT).`;
        addToTable(page, "FAULT", frames.join(', '), pageWaitingTimes[page] || 0, pageBlockTimes[page] || 0);
      }
  
      logOutput.appendChild(logEntry);
      updateFrames(frames);
      currentTime++; // Incrementar tiempo global
    });
  
    // Mostrar resultados finales
    const summary = document.createElement("div");
    summary.innerHTML = `<strong>Faltas de página totales:</strong> ${pageFaults}`;
    logOutput.appendChild(summary);
  }
  
  // Función para actualizar los marcos en el DOM
  function updateFrames(frames) {
    frames.forEach((page, index) => {
      const frameDiv = document.getElementById(`frame-${index}`);
      frameDiv.textContent = page !== null ? page : '-';
      frameDiv.className = "frame border rounded p-3 mx-2 text-center"; // Resetear clases
    });
  }
  
  // Función para resaltar un marco específico
  function highlightFrame(page, className) {
    const frameContainer = document.getElementById("frame-container").children;
    for (let frame of frameContainer) {
      if (parseInt(frame.textContent) === page) {
        frame.classList.add(...className.split(' '));
      }
    }
  }
  
  // Función para agregar filas a la tabla de resultados
  function addToTable(page, status, memoryState, waitTime, blockTime) {
    const tableBody = document.getElementById("pageFaultsTableBody");
  
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${page}</td>
      <td>${status}</td>
      <td>${memoryState}</td>
      <td>${waitTime || 0}</td>
      <td>${blockTime || 0}</td>
    `;
    tableBody.appendChild(row);
  }
  