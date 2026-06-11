const alertasContainer = document.getElementById("alertas-table");

window.addEventListener("load", () => {
    if (alertasContainer) {
        new gridjs.Grid({
            columns: [
                { name: "ID", width: "100px" },
                { name: "Cliente Evaluado", width: "220px" },
                { name: "Motivo de Excepción / Alerta", width: "400px" },
                {
                    name: "Prioridad",
                    width: "130px",
                    formatter: (cell) => {
                        if (!cell) return '';
                        
                        if (cell.includes('|')) {
                            const partes = cell.split('|').map(p => p.trim());
                            const titulo = partes.shift(); 
                            
                            let html = `<div style="display: flex; flex-direction: column; gap: 6px; padding: 4px 0;">`;
                            html += `<strong style="color: #4d0100; font-size: 14px;">${titulo}</strong>`;
                            
                            partes.forEach(parte => {
                                html += `
                                    <span style="background-color: #f8fafc; padding: 6px 10px; border-left: 3px solid #b91c1c; border-radius: 4px; font-size: 13px; color: #475569; display: block;">
                                        • ${parte}
                                    </span>`;
                            });
                            
                            html += `</div>`;
                            return gridjs.html(html);
                        }
                        
                        return gridjs.html(`<span style="font-size: 13px;">${cell}</span>`);
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
                        if (window.isAuditor) return gridjs.html('');
                        return gridjs.html(`<button class="btn-resolver" onclick="window.location.href='/oficial/evaluar-alerta?alerta=${row.cells[5].data}'" style="background-color: #4d0100; color: white; padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold;">Resolver</button>`);
                    }
                }
            ],
            search: { enabled: true },
            language: {
      search: {
        placeholder: 'Buscar por nombre del cliente, prioridad, estado...'
      }
    },
            sort: true,
            pagination: { enabled: true, limit: 10 },
            server: {
                url: '/oficial/alertas/api/alertasData', 
                then: data => data.data.map(alerta => [
                    gridjs.html(`<span title="${alerta.id}" style="font-family:Cambria,Cochin,Georgia,Times,'Times New Roman',serif;font-size:0.85em;color:#555;">${alerta.id.substring(0,8)}...</span>`),
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