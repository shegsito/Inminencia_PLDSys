
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
        language: {
      search: {
        placeholder: 'Buscar por nombre, RFC, correo...'
      }
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
                new Intl.NumberFormat('es-MX', {
                    style: 'currency', 
                    currency: 'MXN' 
                }).format(op.monto || 0), 
                new Date(op.fecha).toLocaleDateString('es-MX', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
}), 
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
