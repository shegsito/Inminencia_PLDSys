const listasPEPContainer = document.getElementById("listas-PEP");
const listasLPBContainer = document.getElementById("listas-LPB");
const historialListasContainer = document.getElementById("historial-listas");

const formatearFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-MX', {
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric'
    });
};

const formatearEstado = (estado) => {
    const esActivo = estado === true || String(estado).toLowerCase() === 'true' || String(estado).toLowerCase() === 'activo' || String(estado).toLowerCase() === 'vigente';
    
    if (esActivo) {
        return gridjs.html('<span style="background-color: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 9999px; font-size: 14px; font-weight: 600; display: inline-block; text-align: center;">Activo</span>');
    } else {
        return gridjs.html('<span style="background-color: #fee2e2; color: #991b1b; padding: 4px 12px; border-radius: 9999px; font-size: 14px; font-weight: 600; display: inline-block; text-align: center;">Inactivo</span>');
    }
};

window.addEventListener("load", () => {
    
    if (listasPEPContainer) {
        new gridjs.Grid({
            columns: ["Versión PEP", "Estado", "Cargada", "Documento"],
            sort: true,
            pagination: false,
            server: {
                url: '/oficial/listas/api/listasPEPData',
                then: data => data.data.map(lista => [
                    formatearFecha(lista.cargada_en), 
                    formatearEstado(lista.estado),     
                    formatearFecha(lista.cargada_en),
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
                    formatearFecha(lista.cargada_en), 
                    formatearEstado(lista.estado),     
                    formatearFecha(lista.cargada_en),
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
                    formatearFecha(historial.cargada_en), 
                    formatearEstado(historial.estado),     
                    formatearFecha(historial.cargada_en),
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