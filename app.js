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
    tbody.innerHTML = "<tr><td colspan='4'>Procesando...</td></tr>"; 

    if (cuentasUnicas.length === 0) return alert("No hay cuentas.");

    // OPTIMIZACIÓN 2: Construir todo el HTML en una variable (String Builder)
    let htmlFinal = "";

    cuentasUnicas.forEach(cuentaBuscada => {
        const buscar = cuentaBuscada.replace(/^0+/, '');
        const fila = inventarioMap.get(buscar); // Búsqueda instantánea O(1)

        if (fila) {
            const qr = fila[6] || "N/A";
            const lat = fila[16] || "";
            const lon = fila[17] || "";
            const urlMaps = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;

            htmlFinal += `
                <tr>
                    <td><b>${cuentaBuscada}</b></td>
                    <td style="color:#e67e22; font-weight:bold;">${qr}</td>
                    <td>${lat}, ${lon}</td>
                    <td><a href="${urlMaps}" target="_blank" style="background:#27ae60; color:white; padding:4px 8px; text-decoration:none; border-radius:4px; font-size:12px;">📍 Mapa</a></td>
                </tr>`;
        } else {
            htmlFinal += `<tr style="background:#fff5f5"><td>${cuentaBuscada}</td><td colspan="3" style="color:red; font-size:12px;">No encontrada</td></tr>`;
        }
    });

    // Inyectar todo el bloque de una sola vez
    tbody.innerHTML = htmlFinal;
}
