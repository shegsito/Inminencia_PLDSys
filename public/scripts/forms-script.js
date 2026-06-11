document.addEventListener('DOMContentLoaded', () => {
    const url = new URLSearchParams(window.location.search);
        
    if (url.get('success') === 'true') {
        alert('Datos registrados exitosamente.');
        
        //prevent resend of message in case of refresh
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});