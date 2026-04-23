let baseDeDatos = [];

// 1. Carga automática (asegúrate que el nombre del archivo sea idéntico en GitHub)
window.onload = async function() {
    try {
        const respuesta = await fetch('SEM 17 Cuentas inventariadas Ciudad Juarez.xlsx - Sheet1.csv');
        const contenido = await respuesta.text();
        
        // Detectamos si usa coma o punto y coma
        const separador = contenido.includes(';') ? ';' : ',';
        const lineas = contenido.split(/\r?\n/);
        
        baseDeDatos = lineas
            .filter(l => l.trim() !== "")
            .map(l => l.split(separador).map(celda => 
                celda.trim().replace(/^"|"$/g, '') // ELIMINA COMILLAS EXTRAS
            ));
        
        console.log("Inventario cargado. Columnas detectadas:", baseDeDatos[0]);
    } catch (e) {
        console.error("Error al cargar:", e);
    }
};

function buscarCuentas() {
    const input = document.getElementById('reportInput').value;
    const regex = /\d{10}/g; 
    const encontrados = input.match(regex);
    const cuentasUnicas = encontrados ? [...new Set(encontrados)] : [];
    
    const tabla = document.querySelector("#resultTable tbody");
    tabla.innerHTML = "";

    if (cuentasUnicas.length === 0) return alert("No hay cuentas de 10 dígitos.");

    cuentasUnicas.forEach(cuentaBuscada => {
        // Normalizamos: quitamos ceros a la izquierda
        const buscar = cuentaBuscada.replace(/^0+/, '');

        // BÚSQUEDA TOTAL: Buscamos en toda la fila (r)
        const fila = baseDeDatos.find(r => {
            return r.some(celda => celda.replace(/^0+/, '') === buscar);
        });

        if (fila) {
            // Según el análisis de tu archivo:
            // QR está en la G (índice 6)
            // Latitud está en la Q (índice 16)
            // Longitud está en la R (índice 17)
            const qr = fila[6] || "N/A";
            const lat = fila[16] || "";
            const lon = fila[17] || "";
            
            const linkMapa = (lat && lon) 
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
            tabla.innerHTML += `<tr><td>${cuentaBuscada}</td><td colspan="3" style="color:red;">No encontrada en el Excel</td></tr>`;
        }
    });
}
