
const testTable = document.getElementById("test-table");


window.addEventListener("load", () => {
    gridTable = new gridjs.Grid({
        columns: ["Folio", "Fecha", "Estatus"],
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
            url: '/operador/caso-estatus/casoStatusData',
            then: data => data.map(ri => [
                ri.idreporteint, 
                new Date(ri.fecha).toLocaleDateString('es-MX'),
                ri.estatus
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
