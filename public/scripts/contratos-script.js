
const testTable = document.getElementById("test-table");


window.addEventListener("load", () => {
    gridTable = new gridjs.Grid({
        columns: ["NOMBRE", "PRODUCTOS", "MONTO", "VIGENCIA", "ESTATUS"],
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
            then: data => data.map(co => [
                co.nombre_cliente,
                op.tipo_operacion, 
                op.monto, 
                co.vigencia, 
                co.estatus
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
