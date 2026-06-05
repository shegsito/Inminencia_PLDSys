const testTable = document.getElementById("test-table");

window.addEventListener("load", () => {
    gridTable = new gridjs.Grid({
        columns: [
            { id: 'idcontrato', name: 'ID', hidden: true },
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
            placeholder: "Buscar por nombre de cliente...",
            server: {
                url: (prev, key) => `${prev}?search=${key}`
            },
        },
        language: {
            search: {
                placeholder: 'Buscar por nombre del cliente'
            }
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
                new Intl.NumberFormat('es-MX', {
                    style: 'currency', 
                    currency: 'MXN' 
                }).format(co.monto || 0), 
                co.estatus,         
                null              
            ])
        },
        className: {
            table: 'global-custom-table',
            th: 'global-custom-th',
            td: 'global-custom-td',
            search: 'global-custom-search'
        }
    }).render(testTable);
});