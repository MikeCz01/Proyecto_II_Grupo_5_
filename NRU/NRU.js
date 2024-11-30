function simulateNRU() {
    const numFrames = parseInt(document.getElementById("numFrames").value);
    const pageSequence = document.getElementById("pageSequence").value.split(',').map(Number);
  
    if (isNaN(numFrames) || numFrames <= 0 || pageSequence.length === 0) {
      alert("Por favor, ingresa un número válido de marcos y una secuencia de páginas.");
      return;
    }
  
    const frames = [];
    const pageArrivalTimes = {}; // Tiempos de llegada de cada página
    const pageWaitingTimes = {}; // Tiempos de espera
    const pageBlockTimes = {}; // Tiempos de bloqueo
    let currentTime = 0; // Tiempo actual global
    let pageFaults = 0;
  
    const logOutput = document.getElementById("log-output");
    const tableBody = document.getElementById("result-table-body");
  
    logOutput.innerHTML = "";
    tableBody.innerHTML = "";
  
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
      const row = document.createElement("tr");
  
      // Verificar si la página está en memoria (HIT)
      if (frames.includes(page)) {
        logEntry.textContent = `Página ${page} encontrada (HIT).`;
        highlightFrame(page, "hit");
  
        if (!pageWaitingTimes[page]) {
          pageWaitingTimes[page] = currentTime - pageArrivalTimes[page]; // Calcular tiempo de espera
        }
  
        // Agregar fila a la tabla
        row.innerHTML = `<td>Programa ${index + 1}</td>
                         <td>${page}</td>
                         <td>${frames.join(", ")}</td>
                         <td>HIT</td>
                         <td>${pageWaitingTimes[page] || 0}</td>
                         <td>0</td>`;
      } else {
        // Página no encontrada (FAULT)
        if (frames.length < numFrames) {
          frames.push(page);
          pageArrivalTimes[page] = currentTime; // Registrar el tiempo de llegada
          logEntry.textContent = `Página ${page} no encontrada (FAULT). Cargada.`;
        } else {
          const removedPage = frames.shift(); // Reemplazar la página más antigua
          pageBlockTimes[removedPage] = currentTime - pageArrivalTimes[removedPage]; // Calcular tiempo de bloqueo
          frames.push(page);
          pageArrivalTimes[page] = currentTime; // Registrar tiempo de llegada
          logEntry.textContent = `Página ${page} no encontrada (FAULT). Reemplazada página ${removedPage}.`;
          replaceFrame(removedPage, page);
        }
        pageFaults++;
  
        // Agregar fila a la tabla
        row.innerHTML = `<td>Programa ${index + 1}</td>
                         <td>${page}</td>
                         <td>${frames.join(", ")}</td>
                         <td>FAULT</td>
                         <td>${pageWaitingTimes[page] || 0}</td>
                         <td>${pageBlockTimes[page] || 0}</td>`;
      }
  
      logOutput.appendChild(logEntry);
      tableBody.appendChild(row);
      updateFrames(frames);
      currentTime++; // Incrementar el tiempo global
    });
  
    // Resumen de resultados en el cuadro de logs
    const summary = document.createElement("div");
    summary.innerHTML = `<strong>Faltas de página totales:</strong> ${pageFaults}<br>`;
    
    // Mostrar tiempos de llegada, espera y bloqueo en los logs
    summary.innerHTML += `<h4>Resumen de Tiempos:</h4>`;
  
    // Tiempos de llegada
    summary.innerHTML += `<strong>Tiempos de Llegada:</strong><br>`;
    for (const page in pageArrivalTimes) {
      summary.innerHTML += `Página ${page}: Llegó en el tiempo ${pageArrivalTimes[page]}<br>`;
    }
  
    // Tiempos de espera
    summary.innerHTML += `<strong>Tiempos de Espera:</strong><br>`;
    for (const page in pageWaitingTimes) {
      summary.innerHTML += `Página ${page}: Esperó ${pageWaitingTimes[page]} unidades de tiempo<br>`;
    }
  
    // Tiempos de bloqueo
    summary.innerHTML += `<strong>Tiempos de Bloqueo:</strong><br>`;
    for (const page in pageBlockTimes) {
      summary.innerHTML += `Página ${page}: Fue bloqueada por ${pageBlockTimes[page]} unidades de tiempo<br>`;
    }
  
    logOutput.appendChild(summary);
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
  