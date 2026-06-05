
const testTable = document.getElementById("test-table");


window.addEventListener("load", () => {
    gridTable = new gridjs.Grid({
        columns: ["Folio", 
            "Descripción", 
            "Fecha", 
            "Estatus", 
            { name: "Evidencia", 
                formatter:(_, row) => {
                    return gridjs.html(`<a href="/oficial/evidencia/${row.cells[0].data}">Ver evidencia</a>`)}}
        ],
        sort: true,
        pagination: {
            limit: 5,
            summary: false
        },
        server: {
            url: '/oficial/canalInterno/canalInternoData',
            then: data => data.map(ri => [
                ri.idreporteint,
                ri.descripcion, 
                new Date(ri.fecha).toLocaleDateString('es-MX', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
}),
                ri.estatus
            ])
        },
        className: {
            table: 'global-custom-table',
            th: 'global-custom-th',
            td: 'global-custom-td',
            search: 'global-custom-search'
        }
}).render(testTable);
});
