    window.addEventListener("load", () => {
  gridTable = new gridjs.Grid({
    columns: ["TIPO", "CLIENTE", "MOTIVO", "GENERADA", "PRIORIDAD", "ESTATUS"],
    search: true,
    sort: true,
    pagination: {
      limit: 5
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
        'color': 'white'
      }
    }
  }).render(document.getElementById("test-table"));
    });