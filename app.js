let baseDeDatos = [];

window.onload = async function() {
    try {
        // Usamos el nombre corto y nuevo
        const respuesta = await fetch('inventario.csv');
        const contenido = await respuesta.text();
        
        const lineas = contenido.split(/\r?\n/);
        
        baseDeDatos = lineas
            .filter(l => l.trim() !== "")
            .map(l => {
                // Separamos por coma o punto y coma
                let sep = l.includes(';') ? ';' : ',';
                return l.split(sep).map(celda => celda.trim().replace(/^"|"$/g, ''));
            });

        console.log("Inventario cargado. Columnas:", baseDeDatos[0].length);
        if(baseDeDatos[0].length > 1) {
            document.body.insertAdjacentHTML('afterbegin', '<p style="color:green; font-weight:bold;">✅ Base de datos conectada</p>');
        }
    } catch (e) {
        console.error("Error al cargar el CSV:", e);
        alert("Error: No se encontró el archivo inventario.csv en el servidor.");
    }
};

function buscarCuentas() {
    const texto = document.getElementById('reportInput').value;
    const regex = /\d{10}/g; 
    const encontrados = texto.match(regex);
    const cuentasUnicas = encontrados ? [...new Set(encontrados)] : [];
    
    const tabla = document.querySelector("#resultTable tbody");
    tabla.innerHTML = ""; 

    if (cuentasUnicas.length === 0) return alert("No se detectaron cuentas de 10 dígitos.");

    cuentasUnicas.forEach(cuentaBuscada => {
        const buscar = cuentaBuscada.replace(/^0+/, ''); // Quitar ceros a la izquierda

        // Buscamos en toda la fila por seguridad
        const fila = baseDeDatos.find(r => r.some(c => c.replace(/^0+/, '') === buscar));

        if (fila) {
            // Buscamos los datos por su forma (TP para QR, 31 para Lat, -106 para Lon)
            const qr = fila.find(c => c.toUpperCase().startsWith('TP')) || "N/A";
            const lat = fila.find(c => c.startsWith('31.')) || "";
            const lon = fila.find(c => c.includes('-106.')) || "";
            
            const urlMaps = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;

            tabla.innerHTML += `
                <tr>
                    <td><b>${cuentaBuscada}</b></td>
                    <td style="color:#e67e22; font-weight:bold;">${qr}</td>
                    <td>${lat}, ${lon}</td>
                    <td><a href="${urlMaps}" target="_blank" style="background:#27ae60; color:white; padding:5px 10px; text-decoration:none; border-radius:4px;">📍 Mapa</a></td>
                </tr>`;
        } else {
            tabla.innerHTML += `<tr><td>${cuentaBuscada}</td><td colspan="3" style="color:red;">No encontrada en inventario</td></tr>`;
        }
    });
}
