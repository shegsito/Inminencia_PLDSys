
const testTable = document.getElementById("test-table");


window.addEventListener("load", () => {
    gridTable = new gridjs.Grid({
        columns: ["Nombre", "Folio", "Productos", "Monto", "Fecha", "Estatus"],
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
            url: '/operador/operaciones/operacionesData',
            then: data => data.map(op => [
                op.nombre_cliente, 
                op.idoperacion, 
                op.tipo_operacion, 
                op.monto, 
                new Date(op.fecha).toLocaleDateString('es-MX'), 
                op.estatus
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
