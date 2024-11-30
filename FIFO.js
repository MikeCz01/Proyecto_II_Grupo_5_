function simulateFIFO() {
    const numFrames = parseInt(document.getElementById("numFrames").value);
    const pageSequence = document.getElementById("pageSequence").value.split(',').map(Number);
  
    if (isNaN(numFrames) || numFrames <= 0 || pageSequence.length === 0) {
      alert("Por favor, ingresa un número válido de marcos y una secuencia de páginas.");
      return;
    }
  
    const frames = [];
    const pageArrivalTimes = []; // Array para almacenar los tiempos de llegada
    const pageWaitingTimes = {}; // Objeto para almacenar los tiempos de espera de cada página
    const pageBlockTimes = {}; // Objeto para almacenar el tiempo de bloqueo de cada página
    let currentTime = 0; // Tiempo global
    let pageFaults = 0;
  
    const logOutput = document.getElementById("log-output");
    logOutput.innerHTML = "";
  
    const frameContainer = document.getElementById("frame-container");
    frameContainer.innerHTML = "";
  
    // Inicializar marcos vacíos en el DOM
    for (let i = 0; i < numFrames; i++) {
      const frameDiv = document.createElement("div");
      frameDiv.classList.add("frame");
      frameDiv.id = `frame-${i}`;
      frameContainer.appendChild(frameDiv);
    }
  
    pageSequence.forEach((page, index) => {
      const logEntry = document.createElement("div");
  
      // Si la página ya está en la memoria (HIT)
      if (frames.includes(page)) {
        logEntry.textContent = `Página ${page} encontrada (HIT).`;
        highlightFrame(page, "hit");
  
        // Actualizar tiempos de espera (solo si no se había registrado un tiempo de espera antes)
        if (!pageWaitingTimes[page]) {
          pageWaitingTimes[page] = currentTime - pageArrivalTimes[page]; // Tiempo de espera = tiempo actual - tiempo de llegada
        }
      } else {
        // Página no encontrada (FAULT)
        if (frames.length < numFrames) {
          frames.push(page);
          pageArrivalTimes[page] = currentTime; // Registrar el tiempo de llegada cuando la página se carga por primera vez
          logEntry.textContent = `Página ${page} no encontrada (FAULT). Cargada.`;
        } else {
          const removedPage = frames.shift(); // FIFO: remover la página más antigua
          pageBlockTimes[removedPage] = currentTime - pageArrivalTimes[removedPage]; // Calcular el tiempo de bloqueo
          frames.push(page);
          pageArrivalTimes[page] = currentTime; // Registrar el tiempo de llegada de la nueva página
          logEntry.textContent = `Página ${page} no encontrada (FAULT). Reemplazada página ${removedPage}.`;
          replaceFrame(removedPage, page);
        }
        pageFaults++;
      }
  
      logOutput.appendChild(logEntry);
      updateFrames(frames);
      currentTime++; // Aumentar el tiempo a cada paso
    });
  
    // Mostrar resultados al final
    const summary = document.createElement("div");
    summary.innerHTML = `<strong>Faltas de página totales:</strong> ${pageFaults}`;
    logOutput.appendChild(summary);
  
    // Mostrar tiempos de llegada, espera y bloqueo
    const timeSummary = document.createElement("div");
    timeSummary.innerHTML = `<h3>Resumen de Tiempos:</h3>`;
  
    // Mostrar tiempo de llegada
    let arrivalTimesText = `<strong>Tiempos de Llegada:</strong><br>`;
    for (const page in pageArrivalTimes) {
      arrivalTimesText += `Página ${page}: Llegó en el tiempo ${pageArrivalTimes[page]}<br>`;
    }
    timeSummary.innerHTML += arrivalTimesText;
  
    // Mostrar tiempo de espera
    let waitingTimesText = `<strong>Tiempos de Espera:</strong><br>`;
    for (const page in pageWaitingTimes) {
      waitingTimesText += `Página ${page}: Esperó ${pageWaitingTimes[page]} unidades de tiempo<br>`;
    }
    timeSummary.innerHTML += waitingTimesText;
  
    // Mostrar tiempo de bloqueo
    let blockTimesText = `<strong>Tiempos de Bloqueo:</strong><br>`;
    for (const page in pageBlockTimes) {
      blockTimesText += `Página ${page}: Fue bloqueada por ${pageBlockTimes[page]} unidades de tiempo<br>`;
    }
    timeSummary.innerHTML += blockTimesText;
  
    logOutput.appendChild(timeSummary);
  }
  
  function updateFrames(frames) {
    frames.forEach((page, index) => {
      const frameDiv = document.getElementById(`frame-${index}`);
      frameDiv.textContent = page;
      frameDiv.classList.remove("replaced", "hit");
    });
  }
  
  function highlightFrame(page, className) {
    const frameContainer = document.getElementById("frame-container").children;
    for (let frame of frameContainer) {
      if (parseInt(frame.textContent) === page) {
        frame.classList.add(className);
      }
    }
  }
  
  function replaceFrame(oldPage, newPage) {
    const frameContainer = document.getElementById("frame-container").children;
    for (let frame of frameContainer) {
      if (parseInt(frame.textContent) === oldPage) {
        frame.textContent = newPage;
        frame.classList.add("replaced");
        return;
      }
    }
  }