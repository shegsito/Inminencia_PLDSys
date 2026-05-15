
const testTable = document.getElementById("test-table");


window.addEventListener("load", () => {
    gridTable = new gridjs.Grid({
        columns: ["NOMBRE", "FOLIO", "PRODUCTOS", "MONTO", "FECHA", "ESTATUS"],
        search: {
            enabled: true,
            server: {
                url: (prev, key) => `${prev}?s=${key}`
            },
        },
        sort: true,
        pagination: true,
        server: {
            url: '/oficial/operaciones/operacionesData',
            then: data => data.map(op => [
                op.nombre_cliente, 
                op.idoperacion, 
                op.tipo_operacion, 
                op.monto, 
                op.fecha, 
                op.estatus
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
