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
    tbody.innerHTML = "<tr><td colspan='4'>Agrupando por QR...</td></tr>"; 

    if (cuentasUnicas.length === 0) return alert("No hay cuentas.");

    let resultados = [];

    // 1. Extraer datos de la memoria
    cuentasUnicas.forEach(cuentaBuscada => {
        const buscar = cuentaBuscada.replace(/^0+/, '');
        const fila = inventarioMap.get(buscar);

        if (fila) {
            resultados.push({
                cuenta: cuentaBuscada,
                qr: fila[6] || "Z-SIN-QR", // Usamos Z para mandarlos al final
                lat: fila[16] || "",
                lon: fila[17] || "",
                encontrado: true
            });
        } else {
            resultados.push({
                cuenta: cuentaBuscada,
                qr: "Z-NO-ENCONTRADA", 
                lat: "",
                lon: "",
                encontrado: false
            });
        }
    });

    // 2. ORDEN NATURAL (Acomoda TP2 antes de TP10 y agrupa por QR)
    const colador = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
    resultados.sort((a, b) => colador.compare(a.qr, b.qr));

    // 3. RENDERIZAR (Construir tabla)
    let htmlFinal = "";
    let ultimoQR = "";

    resultados.forEach(res => {
        // Separador visual opcional: si cambia el QR, podemos poner una línea o espacio
        const estiloFila = res.encontrado ? "" : "background:#fff5f5; color:#c0392b;";
        const qrMostrable = res.encontrado ? res.qr : "NO ENCONTRADA";

        if (res.encontrado) {
            const urlMaps = `https://www.google.com/maps/search/?api=1&query=${res.lat},${res.lon}`;
            htmlFinal += `
                <tr style="${estiloFila}">
                    <td><b>${res.cuenta}</b></td>
                    <td style="color:#d35400; font-weight:bold; border-left: 3px solid #e67e22;">${qrMostrable}</td>
                    <td style="font-size: 11px;">${res.lat}, ${res.lon}</td>
                    <td><a href="${urlMaps}" target="_blank" style="background:#27ae60; color:white; padding:4px 8px; text-decoration:none; border-radius:4px; font-size:11px;">📍 Mapa</a></td>
                </tr>`;
        } else {
            htmlFinal += `
                <tr style="${estiloFila}">
                    <td>${res.cuenta}</td>
                    <td colspan="3" style="font-style: italic;">Sin registro en inventario</td>
                </tr>`;
        }
    });

    tbody.innerHTML = htmlFinal;
}
}
