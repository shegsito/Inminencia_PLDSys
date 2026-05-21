
const testTable = document.getElementById("test-table");


window.addEventListener("load", () => {
    gridTable = new gridjs.Grid({
        columns: ["Nombre", "Productos", "Monto", "Estatus"],
        search: {
            enabled: true,
            server: {
                url: (prev, key) => `${prev}?search=${key}`
            },
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
