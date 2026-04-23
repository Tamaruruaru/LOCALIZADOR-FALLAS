let inventarioMap = new Map();

window.onload = async function() {
    try {
        const respuesta = await fetch('inventario.csv');
        const contenido = await respuesta.text();
        const lineas = contenido.split(/\r?\n/);
        
        // OPTIMIZACIÓN 1: Creamos un Mapa para búsquedas instantáneas
        lineas.forEach(l => {
            if (!l.trim()) return;
            let sep = l.includes(';') ? ';' : ',';
            let columnas = l.split(sep).map(c => c.trim().replace(/^"|"$/g, ''));
            
            // Usamos la cuenta (columna 8 / índice 7) como llave
            if (columnas[7]) {
                let cuentaLimpia = columnas[7].replace(/^0+/, '');
                inventarioMap.set(cuentaLimpia, columnas);
            }
        });

        alert("✅ Base de datos lista: " + inventarioMap.size + " registros cargados.");
    } catch (e) {
        alert("Error cargando inventario.csv");
    }
};

function buscarCuentas() {
    const texto = document.getElementById('reportInput').value;
    const regex = /\d{10}/g; 
    const encontrados = texto.match(regex);
    const cuentasUnicas = encontrados ? [...new Set(encontrados)] : [];
    
    const tbody = document.querySelector("#resultTable tbody");
    tbody.innerHTML = "<tr><td colspan='4'>Ordenando resultados...</td></tr>"; 

    if (cuentasUnicas.length === 0) return alert("No se detectaron cuentas.");

    // 1. Recolectamos todos los datos en un Array para poder ordenarlos
    let resultados = [];

    cuentasUnicas.forEach(cuentaBuscada => {
        const buscar = cuentaBuscada.replace(/^0+/, '');
        const fila = inventarioMap.get(buscar);

        if (fila) {
            resultados.push({
                cuenta: cuentaBuscada,
                qr: fila[6] || "N/A",
                lat: fila[16] || "",
                lon: fila[17] || "",
                encontrado: true
            });
        } else {
            resultados.push({
                cuenta: cuentaBuscada,
                qr: "SIN REGISTRO", // Esto ayuda a mandarlos al final al ordenar
                lat: "",
                lon: "",
                encontrado: false
            });
        }
    });

    // 2. ORDENAR: Comparamos los QRs para que salgan acomodados (A-Z)
    resultados.sort((a, b) => a.qr.localeCompare(b.qr));

    // 3. GENERAR EL HTML ya ordenado
    let htmlFinal = "";
    resultados.forEach(res => {
        if (res.encontrado) {
            const urlMaps = `http://googleusercontent.com/maps.google.com/search/?api=1&query=${res.lat},${res.lon}`;
            htmlFinal += `
                <tr>
                    <td><b>${res.cuenta}</b></td>
                    <td style="color:#e67e22; font-weight:bold;">${res.qr}</td>
                    <td style="font-size: 11px;">${res.lat}, ${res.lon}</td>
                    <td><a href="${urlMaps}" target="_blank" style="background:#27ae60; color:white; padding:4px 8px; text-decoration:none; border-radius:4px; font-size:12px;">📍 Mapa</a></td>
                </tr>`;
        } else {
            htmlFinal += `
                <tr style="background:#fff5f5">
                    <td>${res.cuenta}</td>
                    <td colspan="3" style="color:#c0392b; font-size:11px;">No encontrada en inventario</td>
                </tr>`;
        }
    });

    tbody.innerHTML = htmlFinal;
}
