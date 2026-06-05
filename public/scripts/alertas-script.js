const alertasContainer = document.getElementById("alertas-table");

window.addEventListener("load", () => {
    if (alertasContainer) {
        new gridjs.Grid({
            columns: [
                { name: "Folio / ID", width: "100px" },
                { name: "Cliente Evaluado", width: "220px" },
                { name: "Motivo de Excepción / Alerta", width: "400px" },
                {
                    name: "Prioridad",
                    width: "130px",
                    formatter: (cell) => {
                        const val = cell ? cell.toLowerCase() : '';
                        if (val === "alta") {
                            return gridjs.html(`<span style="background-color: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">Alta</span>`);
                        } else if (val === "media") {
                            return gridjs.html(`<span style="background-color: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">Media</span>`);
                        } else {
                            return gridjs.html(`<span style="background-color: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;">Baja</span>`);
                        }
                    }
                },
                { 
                    name: "Estado", 
                    width: "140px",
                    formatter: (cell) => {
                        const val = cell ? cell.toLowerCase() : '';
                        if (val === "pendiente") {
                            return gridjs.html(`<span style="color: #ea580c; font-weight: bold;">Pendiente</span>`);
                        } else if (val === "investigando" || val === "en_revision") {
                            return gridjs.html(`<span style="color: #2563eb; font-weight: bold;">En Revisión</span>`);
                        } else {
                            return gridjs.html(`<span style="color: #16a34a; font-weight: bold;">Cerrada</span>`);
                        }
                    }
                },
                {
                    name: "Acción",
                    width: "120px",
                    formatter: (_, row) => {
                        // Only show "Resolver" button for pending alerts
                        return gridjs.html(`<button class="btn-resolver" onclick="window.location.href='/oficial/evaluar-alerta?alerta=${row.cells[5].data}'" style="background-color: #4d0100; color: white; padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;">Resolver</button>`);
                    }
                }
            ],
            search: { enabled: true },
            sort: true,
            pagination: { enabled: true, limit: 10 },
            server: {
                url: '/oficial/alertas/api/alertasData', 
                then: data => data.data.map(alerta => [
                    alerta.id.substring(0,8) + '...', 
                    alerta.cliente_evaluado,
                    alerta.motivo_excepcion,
                    alerta.prioridad,
                    alerta.estado,
                    alerta.id
                ])
            },
            style: {
                table: { 'font-family': 'Cambria, serif' },
                th: { 'background-color': '#4d0100', 'color': 'white', 'font-size': '15px' },
                td: { 'font-size': '14px' }
            }
        }).render(alertasContainer);
    }
});