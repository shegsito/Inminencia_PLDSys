const listasPEPContainer = document.getElementById("listas-PEP");
const listasLPBContainer = document.getElementById("listas-LPB");
const historialListasContainer = document.getElementById("historial-listas");

window.addEventListener("load", () => {
    
    if (listasPEPContainer) {
        new gridjs.Grid({
            columns: ["Versión", "Estado", "Cargada", "Documento"],
            sort: true,
            pagination: false,
            server: {
                url: '/oficial/listas/api/listasPEPData',
                then: data => data.map(lista => [
                    lista.version, 
                    lista.estado, 
                    lista.cargada_en,
                    `<a href="/oficial/documentos/${lista.id}" target="_blank" style="color: #4d0100; font-weight: bold;">Ver documento</a>`
                ])
            },
            style: {
                table: { 'font-family': 'Cambria, serif' },
                th: { 'background-color': '#4d0100', 'color': 'white', 'font-size': '16px' },
                td: { 'font-size': '14px' }
            }
        }).render(listasPEPContainer); 
    }

    if (listasLPBContainer) {
        new gridjs.Grid({
            columns: ["Versión", "Estado", "Cargada", "Documento"],
            sort: true,
            pagination: false,
            server: {
                url: '/oficial/listas/api/listasLPBData',
                then: data => data.map(lista => [
                    lista.version, 
                    lista.estado, 
                    lista.cargada_en, 
                    `<a href="/oficial/documentos/${lista.id}" target="_blank" style="color: #4d0100; font-weight: bold;">Ver documento</a>`
                ])
            },
            style: {
                table: { 'font-family': 'Cambria, serif' },
                th: { 'background-color': '#4d0100', 'color': 'white', 'font-size': '16px' },
                td: { 'font-size': '14px' }
            }
        }).render(listasLPBContainer); 
    }

    if (historialListasContainer) {
        new gridjs.Grid({
            columns: ["Tipo Lista", "Versión", "Cargada", "Estado", "Descargar Historial"],
            sort: true,
            pagination: false,
            server: {
                url: '/oficial/listas/api/historialListasData',
                then: data => data.map(historial => [
                    historial.tipo_lista, 
                    historial.version, 
                    historial.cargada_en,
                    historial.estado, 
                    `<a href="/oficial/documentos/${historial.id}" target="_blank" style="color: #4d0100; font-weight: bold;">Descargar</a>`
                ])
            },
            style: {
                table: { 'font-family': 'Cambria, serif' },
                th: { 'background-color': '#4d0100', 'color': 'white', 'font-size': '16px' },
                td: { 'font-size': '14px' }
            }
        }).render(historialListasContainer);
    }
});