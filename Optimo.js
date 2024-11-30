// Variables globales
let programs = []; // Lista de programas
let physicalMemory = []; // Memoria física
let virtualMemory = []; // Memoria virtual
let physicalMemorySize = 3; // Tamaño fijo de la memoria física
let pageFaults = 0;

// Evento para agregar un programa
document.getElementById("addProgram").addEventListener("click", () => {
  const programId = programs.length + 1;
  const pagesInput = prompt(`Ingrese las páginas para el Programa ${programId}, separadas por comas:`);

  // Validar la entrada
  if (!pagesInput) {
    alert("No ingresó ningún dato.");
    return;
  }

  const pages = pagesInput.split(",").map(Number);
  if (pages.some(isNaN)) {
    alert("Entrada inválida. Por favor, ingrese números separados por comas.");
    return;
  }

  // Agregar programa a la lista global
  programs.push({ id: programId, pages });

  // Mostrar el programa en la lista
  const listItem = document.createElement("li");
  listItem.textContent = `Programa ${programId}: ${pages.join(", ")}`;
  document.getElementById("programList").appendChild(listItem);

  // Mostrar el botón de iniciar ejecución si hay al menos un programa
  document.getElementById("startExecution").style.display = "block";
});

// Evento para iniciar la ejecución
document.getElementById("startExecution").addEventListener("click", () => {
  if (!programs.length) {
    alert("No hay programas para ejecutar.");
    return;
  }

  // Reiniciar variables y resultados
  const resultTable = document.getElementById("resultTable").getElementsByTagName("tbody")[0];
  resultTable.innerHTML = "";
  pageFaults = 0;
  physicalMemory = [];
  virtualMemory = [];

  // Procesar cada programa
  programs.forEach((program, programIndex) => {
    program.pages.forEach((page, pageIndex) => {
      const status = physicalMemory.includes(page) ? "Acierto" : "Fallo";

      if (status === "Fallo") {
        if (physicalMemory.length < physicalMemorySize) {
          physicalMemory.push(page);
        } else {
          // Algoritmo óptimo: determinar la página a reemplazar
          const futurePages = programs.slice(programIndex)
            .flatMap((p, idx) =>
              idx === 0 ? p.pages.slice(pageIndex + 1) : p.pages
            );

          let farthestIndex = -1;
          let farthestDistance = -1;

          physicalMemory.forEach((frame, index) => {
            const nextUse = futurePages.indexOf(frame);
            if (nextUse === -1 || nextUse > farthestDistance) {
              farthestDistance = nextUse === -1 ? Infinity : nextUse;
              farthestIndex = index;
            }
          });

          // Reemplazar la página más lejana en el futuro
          physicalMemory[farthestIndex] = page;
        }
        pageFaults++;
      }

      if (!virtualMemory.includes(page)) {
        virtualMemory.push(page);
      }

      // Agregar fila a la tabla
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${program.id}</td>
        <td>${page}</td>
        <td>[${physicalMemory.join(", ")}]</td>
        <td>[${virtualMemory.join(", ")}]</td>
        <td>${status === "Fallo" ? `Fallo: Página ${page} cargada` : `Acierto: Página ${page} ya está`}</td>
      `;
      resultTable.appendChild(row);
    });
  });

  // Actualizar estadísticas
  const totalReferences = programs.flatMap((p) => p.pages).length;
  const faultRate = ((pageFaults / totalReferences) * 100).toFixed(2);
  const performance = (100 - faultRate).toFixed(2);

  document.getElementById("pageFaults").textContent = pageFaults;
  document.getElementById("faultRate").textContent = `${faultRate}%`;
  document.getElementById("performance").textContent = `${performance}%`;

  // Mostrar resultados
  document.getElementById("resultSection").style.display = "block";
});
