// service-worker-registration.js
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
            .then(registration => {
                console.log('ServiceWorker registered! Scope:', registration.scope);
                document.getElementById('sw-status').textContent = 'Registered';
            })
            .catch(error => {
                console.error('ServiceWorker registration failed:', error);
                document.getElementById('sw-status').textContent = 'Failed';
            });
    });
} else {
    document.getElementById('sw-status').textContent = 'Not supported by browser';
    console.warn('Service Workers are not supported in this browser.');
}