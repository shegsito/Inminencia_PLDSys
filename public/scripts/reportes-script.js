
const testTable = document.getElementById("test-table");


window.addEventListener("load", () => {
    gridTable = new gridjs.Grid({
        columns: ["Folio", "Descripcion", "Reportador", "Fecha", "Estatus", "Evidencias"],
        search: {
            enabled: true,
            server: {
                url: (prev, key) => `${prev}?search=${key}`
            },
        },
        sort: true,
        limit: 5,
        pagination: true,
        server: {
            url: '/oficial/reportes/reportesData',
            then: data => data.map(r => [
                r.idreporte || 'N/A',
                r.descripcion || 'N/A', 
                r.reportado_por || 'N/A',
                r.fecha ? new Date(r.fecha).toLocaleDateString() : 'N/A',
                r.estatus || 'N/A',
                r.ruta_evidencia ? `<a href="${r.ruta_evidencia}" target="_blank">Ver evidencia</a>` : 'N/A'
            ])
        },
        
        style: {
            table: {
                'font-family': 'Cambria, serif'
            },
        th: {
                'background-color': '#4d0100',
                'color': 'white'
        }
    }
}).render(testTable);
});