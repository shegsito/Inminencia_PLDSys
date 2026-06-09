window.addEventListener("load", () => {
    const eventSource = new EventSource('/oficial/notificaciones-sse'); // Ajusta la URL a tu ruta real

    eventSource.onmessage = function(event) {
        const alerta = JSON.parse(event.data);
        
        // Create a toast notification for critical alerts
        const toast = document.createElement('div');
        toast.innerHTML = `
            <div style="font-family: Cambria, serif;">
                <h4 style="margin: 0 0 5px 0; font-size: 15px; text-transform: uppercase;">🚨 Alerta Crítica Detectada</h4>
                <p style="margin: 0; font-size: 14px; line-height: 1.4;">${alerta.motivo}</p>
                <span style="font-size: 12px; opacity: 0.8; display: block; margin-top: 5px;">Hora: ${alerta.fecha}</span>
            </div>
        `;

        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#4d0100', 
            color: 'white',
            padding: '15px 20px',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            zIndex: '999999',
            width: '340px',
            borderLeft: '5px solid #ff4d4d',
            transition: 'opacity 0.5s ease',
            opacity: '1'
        });

        document.body.appendChild(toast);

        // Disappear after 8 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 8000);
    };

    eventSource.onerror = function(err) {
        console.error("Desconectado del canal de alertas. Intentando reconexión...");
    };
});