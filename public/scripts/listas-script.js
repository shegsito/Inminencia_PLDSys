const listasPEPContainer = document.getElementById("listas-PEP");
const listasLPBContainer = document.getElementById("listas-LPB");
const historialListasContainer = document.getElementById("historial-listas");

window.addEventListener("load", () => {
    
    if (listasPEPContainer) {
        new gridjs.Grid({
            columns: ["Versión PEP", "Estado", "Cargada", "Documento"],
            sort: true,
            pagination: false,
            server: {
                url: '/oficial/listas/api/listasPEPData',
                then: data => data.data.map(lista => [
                    lista.version, 
                    lista.estado, 
                    lista.cargada_en,
                    gridjs.html('<a href="/oficial/listas/download/PEP" style="color: #4d0100; font-weight: bold; text-decoration: underline;">Descargar</a>')
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
            columns: ["Versión LPB", "Estado", "Cargada", "Documento"],
            sort: true,
            pagination: false,
            server: {
                url: '/oficial/listas/api/listasLPBData',
                then: data => data.data.map(lista => [
                    lista.version, 
                    lista.estado, 
                    lista.cargada_en, 
                    gridjs.html('<a href="/oficial/listas/download/LPB" style="color: #4d0100; font-weight: bold; text-decoration: underline;">Descargar</a>')
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
                then: data => data.data.map(historial => [
                    historial.tipo_lista, 
                    historial.version, 
                    historial.cargada_en,
                    historial.estado, 
                    gridjs.html(`<a href="/oficial/listas/download/${historial.tipo_lista}" style="color: #4d0100; font-weight: bold; text-decoration: underline;">Descargar</a>`)
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