let installingWorker;
let waitingWorker;

function showUpdateBar() {
    document.getElementById('snackbar').className = 'show';    
}

document.getElementById('reload-button').addEventListener('click', function(){
    if (waitingWorker){
        waitingWorker.postMessage({ action: 'skipWaiting' });    
    }    
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then(reg => {
        waitingWorker = reg.waiting;
        reg.onupdatefound = () => {
            installingWorker = reg.installing;
            installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                    waitingWorker = installingWorker;
                    showUpdateBar();
                }
            };
        };

        if (reg.waiting) {
            showUpdateBar();
        }
    });

    let refreshing;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (refreshing) return;
        window.location.reload();
        refreshing = true;
    });
}