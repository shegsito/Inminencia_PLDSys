    window.addEventListener("load", () => {
  gridTable = new gridjs.Grid({
    columns: ["Tipo", "Cliente", "Motivo", "Generada", "Prioridad", "Estatus"],
    search: true,
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
                    alerta.generada_en ? new Date(alerta.generada_en).toLocaleDateString() : 'N/A', 
                    alerta.prioridad || 'N/A', 
                    alerta.estatus || 'N/A'
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
  }).render(document.getElementById("test-table"));
    });