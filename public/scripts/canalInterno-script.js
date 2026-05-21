
const testTable = document.getElementById("test-table");


window.addEventListener("load", () => {
    gridTable = new gridjs.Grid({
        columns: ["Folio", "Descripcion", "Fecha", "Estatus", "Ver"],
        search: {
            enabled: true,
            server: {
                url: (prev, key) => `${prev}?search=${key}`
            },
        },
        sort: true,
        pagination: {
            limit: 5,
            summary: false
        },
        server: {
            url: '/oficial/canalInterno/canalInternoData',
            then: data => data.map(ri => [
                ri.idreporteint || 'N/A',
                ri.descripcion || 'N/A', 
                ri.fecha ? new Date(ri.fecha).toLocaleDateString() : 'N/A',
                ri.estatus || 'N/A',
                ri.ruta_evidencia ? `<a href="${ri.ruta_evidencia}" target="_blank">Ver evidencia</a>` : 'N/A'
            ])
        },
        
        style: {
            table: {
                'font-family': 'Cambria, serif'
            },
        th: {
                'background-color': '#4d0100',
                'color': 'white',
                'font-size': '18px'
        },
        td: {
                'font-size': '16px'
            }
    }
}).render(testTable);
});
