
const testTable = document.getElementById("test-table");


window.addEventListener("load", () => {
    gridTable = new gridjs.Grid({
        columns: ["Nombre", "Folio", "Productos", "Monto", "Fecha", "Estatus"],
        search: {
            enabled: true,
            server: {
                url: (prev, key) => `${prev}?search=${key}`
            }
        },
        sort: true,
        pagination: {
            limit: 5,
            summary: false
        },
        server: {
            url: '/oficial/operaciones/operacionesData',
            then: data => data.map(op => [
                op.nombre_cliente, 
                op.idoperacion, 
                op.tipo_operacion, 
                op.monto, 
                new Date(op.fecha).toLocaleDateString('es-MX'),
                op.estatus
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
