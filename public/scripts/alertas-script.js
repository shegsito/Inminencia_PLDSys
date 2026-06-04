    window.addEventListener("load", () => {
  gridTable = new gridjs.Grid({
    columns: ["Tipo", "Cliente", "Motivo", "Generada", "Prioridad", "Estatus"],
    search: true,
    language: {
      search: {
        placeholder: 'Buscar por nombre del cliente'
      }
    },
    sort: true,
    pagination: {
            limit: 5,
            summary: false
        },
    server: {
      url: "/oficial/alertas/api/alertasData",
      then: data => data.map(alerta => [ 
                    alerta.tipo || 'N/A', 
                    alerta.nombre_cliente || 'N/A', 
                    alerta.motivo || 'N/A', 
                    alerta.generada_en ? new Date(alerta.generada_en).toLocaleDateString('es-MX', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
}) : 'N/A', 
                    alerta.prioridad || 'N/A', 
                    alerta.estatus || 'N/A'
                ])
    },
    className: {
            table: 'global-custom-table',
            th: 'global-custom-th',
            td: 'global-custom-td',
            search: 'global-custom-search'
        }
  }).render(document.getElementById("test-table"));
    });