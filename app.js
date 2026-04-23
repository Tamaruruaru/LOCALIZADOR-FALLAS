// 1. Carga automática mejorada
window.onload = async function() {
    try {
        const respuesta = await fetch('SEM 17 Cuentas inventariadas Ciudad Juarez.xlsx - Sheet1.csv');
        const contenido = await respuesta.text();
        
        const lineas = contenido.split(/\r?\n/);
        
        baseDeDatos = lineas
            .filter(l => l.trim() !== "")
            .map(l => {
                // Esta línea detecta automáticamente si es coma, punto y coma o tabulador
                let sep = l.includes(';') ? ';' : (l.includes('\t') ? '\t' : ',');
                return l.split(sep).map(celda => celda.trim().replace(/^"|"$/g, ''));
            });
        
        // REVISIÓN DE SEGURIDAD
        if (baseDeDatos[0].length <= 1) {
            console.error("Error: Seguimos detectando solo 1 columna. Revisando separadores alternos...");
        }

        console.log("Inventario cargado. Columnas reales:", baseDeDatos[0].length);
        alert("Listo. Se detectaron " + baseDeDatos[0].length + " columnas.");
    } catch (e) {
        console.error("Error al cargar el archivo:", e);
    }
};

// 2. Búsqueda ultra-sensible
function buscarCuentas() {
    const input = document.getElementById('reportInput').value;
    const regex = /\d{10}/g; 
    const encontrados = input.match(regex);
    const cuentasUnicas = encontrados ? [...new Set(encontrados)] : [];
    
    const tabla = document.querySelector("#resultTable tbody");
    tabla.innerHTML = "";

    if (cuentasUnicas.length === 0) return alert("No hay cuentas de 10 dígitos.");

    cuentasUnicas.forEach(cuentaBuscada => {
        const buscar = cuentaBuscada.replace(/^0+/, '');

        // Buscamos en TODA la fila para no fallar por número de columna
        const fila = baseDeDatos.find(r => {
            return r.some(celda => celda.replace(/^0+/, '') === buscar);
        });

        if (fila) {
            // Buscamos el QR que empiece con 'TP' o que esté en la posición que suele estar
            const qr = fila.find(c => c.startsWith('TP')) || fila[6] || "N/A";
            
            // Buscamos coordenadas (celdas que tengan un punto y empiecen con 31 o -106)
            const lat = fila.find(c => c.startsWith('31.')) || "Sin Lat";
            const lon = fila.find(c => c.includes('-106.')) || "Sin Lon";
            
            const linkMapa = (lat !== "Sin Lat") 
                ? `<a href="https://www.google.com/maps?q=${lat},${lon}" target="_blank" style="background:#27ae60; color:white; padding:5px 10px; text-decoration:none; border-radius:4px;">📍 Ver Mapa</a>`
                : "Sin GPS";

            tabla.innerHTML += `
                <tr>
                    <td><b>${cuentaBuscada}</b></td>
                    <td style="color:#e67e22; font-weight:bold;">${qr}</td>
                    <td>${lat}, ${lon}</td>
                    <td>${linkMapa}</td>
                </tr>`;
        } else {
            tabla.innerHTML += `<tr><td>${cuentaBuscada}</td><td colspan="3" style="color:red;">No encontrada</td></tr>`;
        }
    });
}
