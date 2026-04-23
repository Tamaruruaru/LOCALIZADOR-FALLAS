let baseDeDatos = [];

// Esto carga el archivo automáticamente al abrir la web
window.onload = async function() {
    try {
        // Asegúrate de que el nombre del archivo en GitHub sea exactamente este:
        const respuesta = await fetch('SEM 17 Cuentas inventariadas Ciudad Juarez.xlsx');
        const contenido = await respuesta.text();
        
        // Detectar separador (coma o punto y coma)
        const separador = contenido.includes(';') ? ';' : ',';
        const lineas = contenido.split(/\r?\n/);
        
        baseDeDatos = lineas
            .filter(l => l.trim() !== "")
            .map(l => l.split(separador).map(celda => celda.trim().replace(/^"|"$/g, '')));
        
        console.log("Inventario cargado automáticamente:", baseDeDatos[0]);
        document.body.insertAdjacentHTML('afterbegin', '<p style="color:green; padding:10px;">✅ Inventario cargado automáticamente</p>');
    } catch (error) {
        console.error("Error cargando el archivo:", error);
        alert("No se pudo cargar el archivo automático. Revisa que el nombre sea correcto en el repo.");
    }
};

function buscarCuentas() {
    const input = document.getElementById('reportInput').value;
    // Buscamos cualquier serie de 10 números
    const regex = /\d{10}/g;
    const encontrados = input.match(regex);
    const cuentasUnicas = encontrados ? [...new Set(encontrados)] : [];
    
    const tabla = document.querySelector("#resultTable tbody");
    tabla.innerHTML = "";

    if (cuentasUnicas.length === 0) {
        alert("No se encontraron cuentas de 10 dígitos.");
        return;
    }

    cuentasUnicas.forEach(cuentaBuscada => {
        const buscar = cuentaBuscada.replace(/^0+/, '');

        // BÚSQUEDA TODOTERRENO: Busca en TODO el renglón, no solo en una columna
        const fila = baseDeDatos.find(r => r.join('|').replace(/0+/g, '').includes(buscar));

        if (fila) {
            // Basado en tu archivo real: QR es col 6, Lat es 16, Lon es 17
            const qr = fila[6] || "N/A";
            const lat = fila[16];
            const lon = fila[17];
            
            const tr = `
                <tr>
                    <td><b>${cuentaBuscada}</b></td>
                    <td style="color:#e67e22; font-weight:bold;">${qr}</td>
                    <td>${lat}, ${lon}</td>
                    <td><a href="https://www.google.com/maps?q=${lat},${lon}" target="_blank" style="background:#27ae60; color:white; padding:5px; text-decoration:none; border-radius:4px;">📍 Mapa</a></td>
                </tr>`;
            tabla.innerHTML += tr;
        } else {
            tabla.innerHTML += `<tr><td>${cuentaBuscada}</td><td colspan="3" style="color:red;">No encontrada en el Excel</td></tr>`;
        }
    });
}
