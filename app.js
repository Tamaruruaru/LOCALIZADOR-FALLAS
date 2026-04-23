let inventarioMap = new Map();

window.onload = async function() {
    try {
        const respuesta = await fetch('inventario.csv');
        const contenido = await respuesta.text();
        const lineas = contenido.split(/\r?\n/);
        
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

        console.log("Base de datos lista: " + inventarioMap.size + " registros.");
    } catch (e) {
        console.error("Error cargando inventario.csv");
    }
};

function buscarCuentas() {
    const texto = document.getElementById('reportInput').value;
    const regex = /\d{10}/g; 
    const encontrados = texto.match(regex);
    const cuentasUnicas = encontrados ? [...new Set(encontrados)] : [];
    
    const tbody = document.querySelector("#resultTable tbody");
    tbody.innerHTML = "<tr><td colspan='4'>Procesando y agrupando...</td></tr>"; 

    if (cuentasUnicas.length === 0) return alert("No se detectaron números de cuenta.");

    let encontradosLista = [];
    let noEncontradosLista = [];

    // 1. Clasificación
    cuentasUnicas.forEach(cuentaBuscada => {
        const buscar = cuentaBuscada.replace(/^0+/, '');
        const fila = inventarioMap.get(buscar);

        if (fila) {
            encontradosLista.push({
                cuenta: cuentaBuscada,
                qr: (fila[6] || "SIN QR").trim().toUpperCase(),
                lat: fila[16] || "",
                lon: fila[17] || ""
            });
        } else {
            noEncontradosLista.push(cuentaBuscada);
        }
    });

    // 2. Ordenar por QR (A-Z y numérico)
    encontradosLista.sort((a, b) => a.qr.localeCompare(b.qr, undefined, {numeric: true, sensitivity: 'base'}));

    // 3. Generar HTML (Rápido)
    let htmlFinal = "";
    let ultimoQR = "";

    encontradosLista.forEach(res => {
        // Marcamos visualmente cuando cambia el QR para ver los grupos
        const estiloQR = (res.qr !== ultimoQR && ultimoQR !== "") ? "border-top: 2px solid #2c3e50;" : "";
        ultimoQR = res.qr;

        // URL Estándar de Google Maps
        const urlMaps = `https://www.google.com/maps/search/?api=1&query=${res.lat},${res.lon}`;

        htmlFinal += `
            <tr style="${estiloQR}">
                <td><b>${res.cuenta}</b></td>
                <td style="color:#d35400; font-weight:bold; background: #fff8f0;">${res.qr}</td>
                <td style="font-size: 11px; color: #666;">${res.lat}, ${res.lon}</td>
                <td><a href="${urlMaps}" target="_blank" style="background:#27ae60; color:white; padding:4px 8px; text-decoration:none; border-radius:4px; font-size:11px;">📍 Ver Mapa</a></td>
            </tr>`;
    });

    // No encontrados al final
    noEncontradosLista.forEach(cuenta => {
        htmlFinal += `
            <tr style="background:#fff5f5; color:#c0392b;">
                <td>${cuenta}</td>
                <td colspan="3" style="font-style: italic; font-size: 11px;">No encontrada en inventario SEM 17</td>
            </tr>`;
    });

    tbody.innerHTML = htmlFinal;
}
