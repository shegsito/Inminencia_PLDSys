const testTable = document.getElementById("test-table");

window.addEventListener("load", () => {
    gridTable = new gridjs.Grid({
        columns: [
            { id: 'idcontrato', hidden: true }, 
            "Nombre", 
            "Productos", 
            "Monto", 
            "Estatus",
            {
                name: "Perfil",
                formatter: (_, row) => {
                    const idContrato = row.cells[0].data;
                    return gridjs.html(`
                        <a href="/oficial/contratos/perfil/${idContrato}" 
                           style="background-color: #4d0100; color: white; padding: 6px 12px; border-radius: 4px; text-decoration: none; font-size: 12px; font-weight: bold;">
                           Configurar
                        </a>
                    `);
                }
            }
        ],
        search: {
            enabled: true,
            server: {
                url: (prev, key) => `${prev}?search=${key}`
            },
        },
        sort: false,
        pagination: {
            limit: 5,
            summary: false
        },
        server: {
            url: '/oficial/contratos/contratosData',
            then: data => data.map(co => [
                co.idcontrato,      
                co.nombre_cliente,  
                co.tipo_producto,   
                co.monto,          
                co.estatus          
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
    }).render(testTable);
});