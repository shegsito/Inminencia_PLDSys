const testTable = document.getElementById("test-table");

window.addEventListener("load", () => {
    gridTable = new gridjs.Grid({
        columns: ["Fecha", "Formato", "Estatus", { name: "Descargar", 
                formatter:(_, row) => {
                    const idreporte = row.cells[3].data;
                    return gridjs.html(`<a href="/oficial/descargar/${idreporte}">Ver</a>`)}}
                ],
        search: false,
        sort: false,
        pagination: {
            limit: 5,
            summary: false
        },
        server: {
            url: '/oficial/reportes/reportesData',
            then: data => data.map(r => [
                new Date(r.generado_en).toLocaleDateString('es-MX', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
}),
                r.formato, 
                r.estatus,
                r.idreporter
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
