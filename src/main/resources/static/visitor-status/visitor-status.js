// Visitor Status Page Logic
document.addEventListener('DOMContentLoaded', async function() {
    const queueId = getUrlParameter('queue');
    const tokenNumber = getUrlParameter('token');
    let entryData = null;
    let notificationSetupCompleted = false;

    if (!queueId || !tokenNumber) {
        showError('errorMessage', 'Invalid queue or token information');
        return;
    }

    // Initialize WebSocket connection for real-time updates
    try {
        await websocket.connect();
        websocket.subscribe(`/topic/queue/${queueId}`, (data) => {
            updateVisitorStatus();
        });
        console.log('WebSocket connected for visitor status');
        
        // Simulate notification setup completion after WebSocket connects
        setTimeout(() => {
            completeNotificationSetup();
        }, 2000);
        
    } catch (error) {
        console.error('WebSocket connection failed:', error);
    }

    // Load initial visitor status
    await updateVisitorStatus();

    // Set up auto-refresh as fallback
    setInterval(updateVisitorStatus, 30000); // Refresh every 30 seconds

    // Handle quit button
    document.getElementById('quitBtn').addEventListener('click', quitQueue);

    async function updateVisitorStatus() {
        try {
            entryData = await QueueAPI.getEntryByToken(tokenNumber);
            displayVisitorStatus(entryData);
            hideError('errorMessage');
        } catch (error) {
            console.error('Error loading visitor status:', error);
            showError('errorMessage', 'Failed to load your queue status. Please refresh the page.');
        }
    }

    function displayVisitorStatus(entry) {
        // Update queue name
        document.getElementById('queueName').textContent = entry.queue.name.toUpperCase();
        
        // Update token number
        document.getElementById('tokenNumber').textContent = entry.tokenNumber;
        
        // Update position text and status
        const position = entry.position;
        let positionText, statusText;
        
        if (entry.status === 'CALLED') {
            positionText = 'You have been called!';
            statusText = '— please proceed to the counter';
        } else if (entry.status === 'IN_PROGRESS') {
            positionText = 'You are being served';
            statusText = '— thank you for waiting';
        } else if (entry.status === 'COMPLETED') {
            positionText = 'Service completed';
            statusText = '— thank you for using our service';
        } else {
            // WAITING status
            if (position === 1) {
                positionText = 'You are 1st in the queue';
                statusText = '— almost there!';
            } else if (position === 2) {
                positionText = 'You are 2nd in the queue';
                statusText = entry.estimatedWaitTime ? `— approximately ${entry.estimatedWaitTime} minutes` : '— please wait';
            } else if (position === 3) {
                positionText = 'You are 3rd in the queue';
                statusText = entry.estimatedWaitTime ? `— approximately ${entry.estimatedWaitTime} minutes` : '— please wait';
            } else {
                positionText = `You are ${position}th in the queue`;
                statusText = entry.estimatedWaitTime ? `— approximately ${entry.estimatedWaitTime} minutes` : '— please wait';
            }
        }
        
        document.getElementById('positionText').textContent = positionText;
        document.getElementById('positionStatus').textContent = statusText;
        
        // Change circle color based on status
        const circle = document.querySelector('.position-circle');
        circle.classList.remove('called', 'in-progress', 'completed');
        
        if (entry.status === 'CALLED') {
            circle.classList.add('called');
        } else if (entry.status === 'IN_PROGRESS') {
            circle.classList.add('in-progress');
        } else if (entry.status === 'COMPLETED') {
            circle.classList.add('completed');
        }
    }

    function completeNotificationSetup() {
        if (!notificationSetupCompleted) {
            const notificationSetup = document.getElementById('notificationSetup');
            notificationSetup.innerHTML = '<span style="color: #10b981;">✓ Notifications active</span>';
            notificationSetupCompleted = true;
        }
    }

    function quitQueue() {
        if (confirm('Are you sure you want to quit the queue? You will lose your position.')) {
            // In a real implementation, you would call an API to remove the visitor
            // For now, just redirect to home page
            alert('You have left the queue.');
            window.location.href = '../index.html';
        }
    }

    // Clean up WebSocket connection when page is closed
    window.addEventListener('beforeunload', function() {
        if (websocket) {
            websocket.disconnect();
        }
    });
});