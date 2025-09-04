// Admin Dashboard Logic
document.addEventListener('DOMContentLoaded', async function() {
    const queueId = getPathParameter(); // Get queue ID from URL path
    let queueStatus = null;

    // Initialize WebSocket connection for real-time updates
    try {
        await websocket.connect();
        websocket.subscribe(`/topic/queue/${queueId}`, (data) => {
            updateDashboard(data);
        });
        console.log('WebSocket connected for admin dashboard');
    } catch (error) {
        console.error('WebSocket connection failed:', error);
    }

    // Load initial queue status
    await loadQueueStatus();

    // Set up auto-refresh as fallback
    setInterval(loadQueueStatus, 30000); // Refresh every 30 seconds

    // Event listeners
    document.getElementById('inviteNextBtn').addEventListener('click', inviteNextVisitor);
    document.getElementById('inviteByNumberBtn').addEventListener('click', inviteByNumber);
    document.getElementById('addVisitorBtn').addEventListener('click', addVisitor);
    document.getElementById('removeVisitorsBtn').addEventListener('click', removeAllVisitors);

    async function loadQueueStatus() {
        try {
            queueStatus = await QueueAPI.getQueueStatus(queueId);
            updateDashboard(queueStatus);
        } catch (error) {
            console.error('Error loading queue status:', error);
            showError('errorMessage', 'Failed to load queue status.');
        }
    }

    function updateDashboard(status) {
        queueStatus = status;
        
        // Update queue name
        document.getElementById('queueName').textContent = status.queueName.toUpperCase();
        
        // Update waiting count
        const waitingCount = status.waitingCount;
        document.getElementById('waitingCount').textContent = waitingCount;
        document.getElementById('waitingPlural').textContent = waitingCount !== 1 ? 's waiting' : ' waiting';
        
        // Update current serving number with animation
        const currentServingElement = document.getElementById('currentServing');
        if (currentServingElement.textContent !== status.currentServing) {
            currentServingElement.style.transform = 'scale(1.1)';
            currentServingElement.textContent = status.currentServing;
            setTimeout(() => {
                currentServingElement.style.transform = 'scale(1)';
            }, 200);
        }
        
        // Enable/disable invite next button
        const inviteNextBtn = document.getElementById('inviteNextBtn');
        if (waitingCount === 0) {
            inviteNextBtn.disabled = true;
            inviteNextBtn.querySelector('.btn-text').textContent = 'No visitors waiting';
        } else {
            inviteNextBtn.disabled = false;
            inviteNextBtn.querySelector('.btn-text').textContent = 'Invite next';
        }
        
        hideError('errorMessage');
    }

    async function inviteNextVisitor() {
        if (queueStatus.waitingCount === 0) {
            showError('errorMessage', 'No visitors waiting in queue');
            return;
        }

        showLoader('inviteNextBtn');
        hideError('errorMessage');

        try {
            const response = await QueueAPI.callNextVisitor(queueId);
            console.log('Next visitor called:', response);
            // Dashboard will be updated via WebSocket
        } catch (error) {
            console.error('Error calling next visitor:', error);
            showError('errorMessage', 'Failed to call next visitor. Please try again.');
        } finally {
            hideLoader('inviteNextBtn');
        }
    }

    function inviteByNumber() {
        const visitorNumber = prompt('Enter visitor number to invite:');
        if (visitorNumber && visitorNumber.trim()) {
            // This would require a specific API endpoint
            alert(`Feature to invite visitor #${visitorNumber} will be implemented.`);
        }
    }

    function addVisitor() {
        const visitorName = prompt('Enter visitor name to add manually:');
        if (visitorName && visitorName.trim()) {
            // This would require manually adding a visitor
            alert(`Feature to manually add visitor "${visitorName}" will be implemented.`);
        }
    }

    function removeAllVisitors() {
        if (confirm('Are you sure you want to remove all waiting visitors from the queue?')) {
            // This would require a specific API endpoint
            alert('Feature to remove all visitors will be implemented.');
        }
    }

    // Clean up WebSocket connection when page is closed
    window.addEventListener('beforeunload', function() {
        if (websocket) {
            websocket.disconnect();
        }
    });
});