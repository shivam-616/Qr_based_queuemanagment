let queueId = null;
let socket = null;

// Initialize the admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Extract queue ID from URL path
    const pathParts = window.location.pathname.split('/');
    queueId = pathParts[pathParts.length - 1];
    
    if (!queueId || queueId === 'admin') {
        alert('Invalid queue ID');
        window.location.href = '/';
        return;
    }
    
    loadQueueInfo();
    loadQueueStatus();
    setupWebSocket();
    
    // Refresh data every 30 seconds
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
            updateDashboard(status);
        })
        .catch(error => {
            console.error('Error loading queue status:', error);
        });
}

function updateDashboard(status) {
    // Update statistics
    document.getElementById('waitingCount').textContent = status.waitingCount || 0;
    document.getElementById('calledCount').textContent = status.calledCount || 0;
    document.getElementById('completedCount').textContent = status.completedCount || 0;
    document.getElementById('averageWaitTime').textContent = status.averageWaitTime || 0;
    
    // Update current serving
    document.getElementById('currentServing').textContent = status.currentServing || '000';
    document.getElementById('nextVisitor').textContent = status.nextVisitor || '000';
    
    // Update queue entries
    updateQueueEntries(status.waitingEntries || []);
}

function updateQueueEntries(entries) {
    const container = document.getElementById('queueEntries');
    
    if (entries.length === 0) {
        container.innerHTML = '<div class="queue-item"><div>No visitors in queue</div></div>';
        return;
    }
    
    container.innerHTML = entries.map(entry => `
        <div class="queue-item ${entry.status === 'CALLED' ? 'current-serving' : ''}">
            <div class="token-number">#${entry.tokenNumber}</div>
            <div class="visitor-info">
                <div class="visitor-name">${entry.visitorName || 'Anonymous'}</div>
                <div class="visitor-details">
                    Position: ${entry.position} | 
                    Wait: ~${entry.estimatedWaitTime} min |
                    Joined: ${new Date(entry.joinedAt).toLocaleTimeString()}
                </div>
            </div>
            <div class="status-badge status-${entry.status.toLowerCase()}">${entry.status}</div>
            ${entry.status === 'CALLED' ? 
                `<button class="btn-complete" onclick="completeService('${entry.id}')">Complete</button>` : 
                ''
            }
        </div>
    `).join('');
}

function callNextVisitor() {
    fetch(`/api/queues/${queueId}/call-next`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('No visitors waiting');
        }
        return response.json();
    })
    .then(result => {
        console.log('Called visitor:', result);
        loadQueueStatus(); // Refresh the display
    })
    .catch(error => {
        console.error('Error calling next visitor:', error);
        alert('No visitors waiting in queue');
    });
}

function completeService(entryId) {
    fetch(`/api/queues/entry/${entryId}/complete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(result => {
        console.log('Completed service:', result);
        loadQueueStatus(); // Refresh the display
    })
    .catch(error => {
        console.error('Error completing service:', error);
        alert('Failed to complete service');
    });
}

function pauseQueue() {
    // Implementation for pausing queue
    alert('Pause queue functionality to be implemented');
}

function resumeQueue() {
    // Implementation for resuming queue
    alert('Resume queue functionality to be implemented');
}

function setupWebSocket() {
    // WebSocket implementation for real-time updates
    // This would connect to your WebSocket endpoint
    console.log('WebSocket setup for real-time updates');
}