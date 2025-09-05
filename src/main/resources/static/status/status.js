let queueId = null;
let visitorToken = null;

document.addEventListener('DOMContentLoaded', function() {
    // Extract queue ID from URL path
    const pathParts = window.location.pathname.split('/');
    queueId = pathParts[pathParts.length - 1];
    
    // Check for visitor token in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    visitorToken = urlParams.get('token');
    
    if (!queueId || queueId === 'status') {
        alert('Invalid queue ID');
        window.location.href = '/';
        return;
    }
    
    loadQueueInfo();
    loadQueueStatus();
    
    if (visitorToken) {
        loadVisitorStatus();
        document.getElementById('visitorStatus').style.display = 'block';
    }
    
    // Auto-refresh every 10 seconds
    setInterval(() => {
        loadQueueStatus();
        if (visitorToken) {
            loadVisitorStatus();
        }
    }, 10000);
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
            document.getElementById('queueDescription').textContent = queue.description || '';
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
            updateGeneralStatus(status);
            updateLastUpdated();
        })
        .catch(error => {
            console.error('Error loading queue status:', error);
        });
}

function loadVisitorStatus() {
    if (!visitorToken) return;
    
    fetch(`/api/queues/entry/${visitorToken}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Invalid token');
            }
            return response.json();
        })
        .then(entry => {
            updateVisitorStatus(entry);
        })
        .catch(error => {
            console.error('Error loading visitor status:', error);
            // Hide visitor status if token is invalid
            document.getElementById('visitorStatus').style.display = 'none';
        });
}

function updateGeneralStatus(status) {
    document.getElementById('currentServing').textContent = status.currentServing || '000';
    document.getElementById('waitingCount').textContent = status.waitingCount || 0;
    document.getElementById('averageWaitTime').textContent = status.averageWaitTime || 0;
}

function updateVisitorStatus(entry) {
    document.getElementById('yourToken').textContent = `#${entry.tokenNumber}`;
    document.getElementById('yourPosition').textContent = entry.position || 0;
    document.getElementById('yourWaitTime').textContent = entry.estimatedWaitTime || 0;
    
    const statusBadge = document.getElementById('yourStatus');
    statusBadge.textContent = entry.status;
    statusBadge.className = `status-badge status-${entry.status.toLowerCase()}`;
    
    // Show notification if called
    if (entry.status === 'CALLED') {
        showCalledNotification();
    }
}

function showCalledNotification() {
    // Create a more prominent notification when visitor is called
    if (!document.getElementById('calledNotification')) {
        const notification = document.createElement('div');
        notification.id = 'calledNotification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #4CAF50;
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-size: 1.2em;
            font-weight: bold;
            z-index: 1000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            animation: pulse 2s infinite;
        `;
        notification.textContent = 'You have been called! Please proceed to the service counter.';
        document.body.appendChild(notification);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (document.getElementById('calledNotification')) {
                document.body.removeChild(notification);
            }
        }, 10000);
    }
}

function updateLastUpdated() {
    const now = new Date();
    document.getElementById('lastUpdated').textContent = now.toLocaleTimeString();
}