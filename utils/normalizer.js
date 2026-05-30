const normalizeText = (inputString) => {
    if (inputString === null || inputString === undefined) return '';
    return inputString
        .toString()
        .trim()
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') 
        .replace(/[^A-Z0-9 ]/g, '')     
        .replace(/\s+/g, ' ');  
};

module.exports = { normalizeText };