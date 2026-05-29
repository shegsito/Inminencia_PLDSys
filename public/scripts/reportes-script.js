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
                new Date(r.generado_en).toLocaleDateString('es-MX'),
                r.formato, 
                r.estatus,
                r.idreporter
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
