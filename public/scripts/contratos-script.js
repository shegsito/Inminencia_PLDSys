const testTable = document.getElementById("test-table");

window.addEventListener("load", () => {
    gridTable = new gridjs.Grid({
        columns: ["Nombre", "Productos", "Monto", "Estatus"],
        search: {
            enabled: true,
            placeholder: "Buscar por nombre de cliente...",
            server: {
                url: (prev, key) => `${prev}?search=${key}`
            },
        },
        language: {
      search: {
        placeholder: 'Buscar por nombre del cliente'
      }
    },
        sort: false,
        pagination: {
            limit: 5,
            summary: false
        },
        server: {
            url: '/oficial/contratos/contratosData',
            then: data => data.map(co => [
                co.nombre_cliente,
                co.tipo_producto, 
                co.monto,
                co.estatus
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
