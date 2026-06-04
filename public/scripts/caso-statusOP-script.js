const testTable = document.getElementById("test-table");

window.addEventListener("load", () => {
    gridTable = new gridjs.Grid({
        columns: ["Folio", "Fecha", "Estatus"],
        search: false,
        sort: true,
        pagination: {
            limit: 5,
            summary: false
        },
        server: {
            url: '/operador/caso-estatus/casoEstatusData',
            then: data => data.map(ri => [
                ri.idreporteint, 
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
