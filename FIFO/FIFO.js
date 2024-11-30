function simulateFIFO() {
  const numFrames = parseInt(document.getElementById("numFrames").value);
  const pageSequence = document.getElementById("pageSequence").value.split(',').map(Number);

  if (isNaN(numFrames) || numFrames <= 0 || pageSequence.length === 0) {
    alert("Por favor, ingresa un número válido de marcos y una secuencia de páginas.");
    return;
  }

  const frames = [];
  const pageArrivalTimes = {}; // Tiempos de llegada para cada página
  const pageWaitingTimes = {}; // Tiempos de espera para cada página
  const pageBlockTimes = {}; // Tiempos de bloqueo para cada página
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

  // Limpiar tabla de resultados al inicio
  const pageFaultsTableBody = document.getElementById("pageFaultsTableBody");
  pageFaultsTableBody.innerHTML = "";

  pageSequence.forEach((page, index) => {
    const logEntry = document.createElement("div");

    // Si la página ya está en la memoria (HIT)
    if (frames.includes(page)) {
      logEntry.textContent = `Página ${page} encontrada (HIT).`;
      highlightFrame(page, "hit");

      // Calcular tiempo de espera solo si no se había registrado antes
      if (!pageWaitingTimes[page]) {
        pageWaitingTimes[page] = currentTime - pageArrivalTimes[page]; // Espera = tiempo actual - tiempo de llegada
      }

      // Actualizar tabla con HIT
      addToTable(page, frames, "HIT", pageWaitingTimes[page], 0);
    } else {
      // Página no encontrada (FAULT)
      if (frames.length < numFrames) {
        frames.push(page);
        pageArrivalTimes[page] = currentTime; // Registrar el tiempo de llegada
        logEntry.textContent = `Página ${page} no encontrada (FAULT). Cargada.`;
      } else {
        const removedPage = frames.shift(); // FIFO: remover la página más antigua
        pageBlockTimes[removedPage] = currentTime - pageArrivalTimes[removedPage]; // Bloqueo = tiempo actual - tiempo de llegada de la página reemplazada
        frames.push(page);
        pageArrivalTimes[page] = currentTime; // Registrar el tiempo de llegada de la nueva página
        logEntry.textContent = `Página ${page} no encontrada (FAULT). Reemplazada página ${removedPage}.`;
        replaceFrame(removedPage, page);
      }
      pageFaults++;

      // Actualizar tabla con FAULT
      addToTable(page, frames, "FAULT", pageWaitingTimes[page] || 0, pageBlockTimes[page] || 0);
    }

    logOutput.appendChild(logEntry);
    updateFrames(frames);
    currentTime++; // Incrementar el tiempo global
  });

  // Mostrar resultados al final
  const summary = document.createElement("div");
  summary.innerHTML = `<strong>Faltas de página totales:</strong> ${pageFaults}`;
  logOutput.appendChild(summary);
}

// Actualizar los marcos en pantalla
function updateFrames(frames) {
  frames.forEach((page, index) => {
    const frameDiv = document.getElementById(`frame-${index}`);
    frameDiv.textContent = page;
    frameDiv.classList.remove("replaced", "hit");
  });
}

// Resaltar el marco correspondiente
function highlightFrame(page, className) {
  const frameContainer = document.getElementById("frame-container").children;
  for (let frame of frameContainer) {
    if (parseInt(frame.textContent) === page) {
      frame.classList.add(className);
    }
  }
}

// Reemplazar un marco
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

// Agregar una fila a la tabla
function addToTable(page, frames, status, waitTime, blockTime) {
  const tableBody = document.getElementById("pageFaultsTableBody");

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>Programa</td>
    <td>${page}</td>
    <td>${frames.join(', ')}</td>
    <td>${status}</td>
    <td>${waitTime || 0}</td>
    <td>${blockTime || 0}</td>
  `;
  tableBody.appendChild(row);
}
