
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
        limit: 5,
        pagination: true,
        server: {
            url: '/oficial/canalInterno/canalInternoData',
            then: data => data.map(ri => [
                ri.idreporteint,
                ri.descripcion, 
                ri.fecha,
                ri.estatus,
                ri.ruta_evidencia
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
