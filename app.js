let baseDeDatos = [];

// 1. Carga y limpieza del archivo
document.getElementById('csvFile').addEventListener('change', function(e) {
    const reader = new FileReader();
    reader.onload = function() {
        const contenido = reader.result;
        // Detectamos el separador (punto y coma o coma)
        const separador = contenido.includes(';') ? ';' : ',';
        const lineas = contenido.split(/\r?\n/);
        
        baseDeDatos = lineas
            .filter(l => l.trim() !== "") // Quitamos líneas vacías
            .map(l => l.split(separador).map(celda => 
                celda.trim().replace(/^"|"$/g, '') // Quitamos espacios y comillas
            ));
        
        console.log("Primer fila detectada:", baseDeDatos[0]);
        alert("Archivo cargado con éxito. Se detectaron " + (baseDeDatos.length - 1) + " registros.");
    };
    reader.readAsText(e.target.files[0]);
});

// 2. Proceso de búsqueda
function buscarCuentas() {
    const input = document.getElementById('reportInput').value;
    const regex = /\d{10}/g; // Busca bloques de 10 números
    const encontrados = input.match(regex);
    const cuentasUnicas = encontrados ? [...new Set(encontrados)] : [];
    
    const tabla = document.querySelector("#resultTable tbody");
    tabla.innerHTML = "";

    if (cuentasUnicas.length === 0) {
        alert("No se encontraron números de 10 dígitos en el texto pegado.");
        return;
    }

    cuentasUnicas.forEach(cuentaBuscada => {
        // Quitamos ceros a la izquierda para comparar (ej: 0142... -> 142...)
        const buscar = cuentaBuscada.replace(/^0+/, '');

        // Buscamos en la columna 8 (índice 7)
        const fila = baseDeDatos.find(r => {
            if (!r[7]) return false;
            return r[7].replace(/^0+/, '') === buscar;
        });

        if (fila) {
            const qr = fila[6];      // Columna G
            const lat = fila[16];    // Columna Q
            const lon = fila[17];    // Columna R
            const coords = `${lat},${lon}`;
            
            // Link de Google Maps corregido
            const urlMaps = `https://www.google.com/maps/search/?api=1&query=${coords}`;

            tabla.innerHTML += `
                <tr>
                    <td><b>${cuentaBuscada}</b></td>
                    <td style="color: #d35400; font-weight: bold;">${qr}</td>
                    <td>${coords}</td>
                    <td><a href="${urlMaps}" target="_blank" class="btn-map">📍 Abrir Mapa</a></td>
                </tr>`;
        } else {
            tabla.innerHTML += `
                <tr style="background: #fff0f0;">
                    <td>${cuentaBuscada}</td>
                    <td colspan="3" style="color: #c0392b;">No encontrado en el Excel SEM 17</td>
                </tr>`;
        }
    });
}