
const alertasRecientes = document.getElementById("alertas-recientes");
const clientesRecientes = document.getElementById("clientes-recientes");
const operacionesRecientes = document.getElementById("operaciones-recientes");

window.addEventListener("load", () => {

    const alertasGrid = new gridjs.Grid({
        columns: ["Alertas recientes", "Prioridad"],
        sort: true,
        pagination: {
            limit: 5,
            prevButton: false,
            nextButton: false,
            summary: false,
            buttonsCount: false
        },
        server: {
            url: '/oficial/dashboard/api/alertasDataDashboard',
            then: data => data.map(alerta => [
                alerta.motivo, 
                alerta.prioridad
            ])
        },
        
        style: {
            table: {
                'font-family': 'Cambria, serif',
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
}).render(alertasRecientes);

const clientesGrid = new gridjs.Grid({
        columns: ["Clientes recientes", "Riesgo"],
        sort: true,
        pagination: {
            limit: 5,
            prevButton: false,
            nextButton: false,
            summary: false,
            buttonsCount: false
        },
        server: {
            url: '/oficial/dashboard/api/clientesDataDashboard',
            then: data => data.map(cliente => [
                cliente.nombre_cliente, 
                cliente.nivel_riesgo
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
}).render(clientesRecientes);

const operacionesGrid = new gridjs.Grid({
        columns: ["Cliente", "Producto", "Monto", "Fecha"],
        sort: true,
        pagination: {
            limit: 5,
            prevButton: false,
            nextButton: false,
            summary: false,
            buttonsCount: false
        },
        server: {
            url: '/oficial/dashboard/api/operacionesDataDashboard',
            then: data => data.map(op => [
                op.nombre_cliente, 
                op.tipo_operacion, 
                op.monto, 
                new Date(op.fecha).toLocaleDateString('es-MX')
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
}).render(operacionesRecientes);
});
