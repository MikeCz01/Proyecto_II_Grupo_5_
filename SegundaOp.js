document.getElementById('config-form').addEventListener('submit', (event) => {
    event.preventDefault();

    
    const numFrames = parseInt(document.getElementById('frames').value);
    const pages = document.getElementById('pages').value.split(',').map(Number);

    
    const frames = [];
    const secondChance = [];
    //let step = 1;
    let aciertos = 0; 
    let fallos = 0; 

    // Limpiar tabla y rendimiento 
    const tableBody = document.querySelector('#simulation-table tbody');
    const performanceOutput = document.getElementById('performance-output');
    tableBody.innerHTML = '';
    performanceOutput.innerHTML = '';

    // Simulador
    pages.forEach((page) => {
        let action = '';
        const pageIndex = frames.indexOf(page);

        if (pageIndex !== -1) {
            
            secondChance[pageIndex] = 1;
            aciertos++;
            action = `Acierto: Página ${page} tiene segunda oportunidad.`;
        } else {
            
            fallos++;

            if (frames.length < numFrames) {
              
                frames.push(page);
                secondChance.push(0);
                action = `Fallo: Página ${page} agregada.`;
            } else {
                
                while (true) {
                    const victim = frames.shift();
                    const chance = secondChance.shift();

                    if (chance === 0) {
                        frames.push(page);
                        secondChance.push(0);
                        action = `Fallo: Reemplazo - Página ${victim} por ${page}.`;
                        break;
                    } else {
                        frames.push(victim);
                        secondChance.push(0);
                    }
                }
            }
        }

        // Actualizar tabla
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${page}</td>
            <td>[${frames.join(', ')}]</td>
            <td>[${secondChance.join(', ')}]</td>
            <td>${action}</td>
        `;
        tableBody.appendChild(row);
    });

    // Calcular rendimiento 
    const totalReferencias = pages.length;
    const f = fallos / totalReferencias; 
    const rendimiento = ((1 - f) * 100).toFixed(2); 

    // Mostrar 
    performanceOutput.innerHTML = `
        <strong>Rendimiento del MMU:</strong><br>
        Total de referencias: ${totalReferencias}<br>
        Aciertos: ${aciertos}<br>
        Fallos: ${fallos}<br>
        <strong>Porcentaje de rendimiento: ${rendimiento}%</strong>
    `;
});
