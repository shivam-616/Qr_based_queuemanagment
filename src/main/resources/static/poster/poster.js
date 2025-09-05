let queueId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Extract queue ID from URL path
    const pathParts = window.location.pathname.split('/');
    queueId = pathParts[pathParts.length - 1];
    
    if (!queueId || queueId === 'poster') {
        alert('Invalid queue ID');
        window.location.href = '/';
        return;
    }
    
    loadQueueInfo();
    loadQueueStatus();
    
    // Auto-refresh every 30 seconds
    setInterval(loadQueueStatus, 30000);
});

function loadQueueInfo() {
    fetch(`/api/queues/${queueId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Queue not found');
            }
            return response.json();
        })
        .then(queue => {
            document.getElementById('queueName').textContent = queue.name;
            document.getElementById('queueDescription').textContent = queue.description || 'Join our queue by scanning the QR code below';
            
            // Display QR code
            if (queue.qrCode) {
                const qrContainer = document.getElementById('qrCodeContainer');
                qrContainer.innerHTML = `<img src="data:image/png;base64,${queue.qrCode}" alt="QR Code">`;
            }
            
            // Set manual join link
            const manualLink = document.getElementById('manualJoinLink');
            manualLink.href = `/visitor/${queueId}`;
        })
        .catch(error => {
            console.error('Error loading queue info:', error);
            alert('Queue not found');
            window.location.href = '/';
        });
}

function loadQueueStatus() {
    fetch(`/api/queues/${queueId}/status`)
        .then(response => response.json())
        .then(status => {
            document.getElementById('currentServing').textContent = status.currentServing || '000';
            document.getElementById('waitingCount').textContent = status.waitingCount || 0;
            document.getElementById('averageWaitTime').textContent = status.averageWaitTime || 0;
        })
        .catch(error => {
            console.error('Error loading queue status:', error);
        });
}