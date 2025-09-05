// Status Display Page Logic
document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const queueId = getPathParameter() || urlParams.get('queue');
    const tokenNumber = urlParams.get('token');
    
    let queueStatus = null;
    let isVisitorView = !!tokenNumber; // Check if this is a visitor viewing their status

    // Initialize WebSocket connection for real-time updates
    try {
        await websocket.connect();
        websocket.subscribe(`/topic/queue/${queueId}`, (data) => {
            updateStatusDisplay(data);
        });
        console.log('WebSocket connected for status display');
    } catch (error) {
        console.error('WebSocket connection failed:', error);
    }

    // Load initial queue status
    await loadQueueStatus();

    // Set up auto-refresh as fallback
    setInterval(loadQueueStatus, 30000); // Refresh every 30 seconds

    async function loadQueueStatus() {
        try {
            queueStatus = await QueueAPI.getQueueStatus(queueId);
            updateStatusDisplay(queueStatus);
            
            // If this is a visitor view, also load their specific entry data
            if (isVisitorView && tokenNumber) {
                await loadVisitorStatus();
            }
        } catch (error) {
            console.error('Error loading queue status:', error);
            document.getElementById('queueName').textContent = 'ERROR LOADING QUEUE';
        }
    }

    async function loadVisitorStatus() {
        try {
            const entryData = await QueueAPI.getEntryByToken(tokenNumber);
            updateVisitorSpecificInfo(entryData);
        } catch (error) {
            console.error('Error loading visitor status:', error);
        }
    }

    function updateStatusDisplay(status) {
        queueStatus = status;
        
        // Update queue name
        document.getElementById('queueName').textContent = status.queueName.toUpperCase();
        
        // Update current serving number with animation
        const currentServingElement = document.getElementById('currentServing');
        if (currentServingElement.textContent !== status.currentServing) {
            currentServingElement.style.transform = 'scale(1.1)';
            currentServingElement.textContent = status.currentServing;
            setTimeout(() => {
                currentServingElement.style.transform = 'scale(1)';
            }, 200);
        }
        
        // Update next visitor
        document.getElementById('nextVisitor').textContent = status.nextVisitor;
        
        // Update waiting count
        const waitingCount = status.waitingCount;
        document.getElementById('waitingCount').textContent = waitingCount;
        document.getElementById('waitingPlural').textContent = waitingCount !== 1 ? 's' : '';
    }

    function updateVisitorSpecificInfo(entry) {
        // If this is a visitor view, we could show additional personalized information
        // For now, we'll just update the page title to include their token
        document.title = `Queue Status - Token #${entry.tokenNumber}`;
        
        // You could add visitor-specific UI elements here
        if (entry.status === 'CALLED') {
            // Show a prominent notification that they've been called
            showVisitorNotification('You have been called! Please proceed to the counter.', 'success');
        } else if (entry.status === 'IN_PROGRESS') {
            showVisitorNotification('You are currently being served.', 'info');
        }
    }

    function showVisitorNotification(message, type) {
        // Create a notification banner for the visitor
        const existingNotification = document.querySelector('.visitor-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `visitor-notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }

    // Clean up WebSocket connection when page is closed
    window.addEventListener('beforeunload', function() {
        if (websocket) {
            websocket.disconnect();
        }
    });
});