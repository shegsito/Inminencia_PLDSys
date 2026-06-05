
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
        className: {
            table: 'global-custom-table',
            th: 'global-custom-th',
            td: 'global-custom-td',
            search: 'global-custom-search'
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
        className: {
            table: 'global-custom-table',
            th: 'global-custom-th',
            td: 'global-custom-td',
            search: 'global-custom-search'
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
                new Intl.NumberFormat('es-MX', {
                    style: 'currency', 
                    currency: 'MXN' 
                }).format(op.monto || 0), 
                new Date(op.fecha).toLocaleDateString('es-MX', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
})
            ])
        },
        className: {
            table: 'global-custom-table',
            th: 'global-custom-th',
            td: 'global-custom-td',
            search: 'global-custom-search'
        }
}).render(operacionesRecientes);
});
