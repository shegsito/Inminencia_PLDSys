
const alertasRecientes = document.getElementById("alertas-recientes");
const clientesRecientes = document.getElementById("clientes-recientes");
const operacionesRecientes = document.getElementById("operaciones-recientes");

window.addEventListener("load", () => {
    gridTable = new gridjs.Grid({
        columns: ["Alertas recientes", "Prioridad"],
        sort: true,
        pagination: true,
        server: {
            url: '/api/operaciones/data',
            then: data => data.map(op => [
                op.nombre_cliente, op.idoperacion, op.tipo_operacion, op.monto, op.fecha, op.estatus
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
}).render(alertasRecientes);

gridTable = new gridjs.Grid({
        columns: ["Clientes recientes", "Riesgo"],
        sort: true,
        pagination: true,
        server: {
            url: '/api/operaciones/data',
            then: data => data.map(op => [
                op.nombre_cliente, op.idoperacion, op.tipo_operacion, op.monto, op.fecha, op.estatus
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
}).render(clientesRecientes);

gridTable = new gridjs.Grid({
        columns: ["CLIENTE", "PRODUCTO", "MONTO", "FECHA"],
        sort: true,
        pagination: true,
        server: {
            url: '/api/operaciones/data',
            then: data => data.map(op => [
                op.nombre_cliente, op.idoperacion, op.tipo_operacion, op.monto, op.fecha, op.estatus
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
}).render(operacionesRecientes);
});
