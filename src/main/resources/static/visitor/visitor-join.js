let queueId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Extract queue ID from URL path
    const pathParts = window.location.pathname.split('/');
    queueId = pathParts[pathParts.length - 1];
    
    if (!queueId || queueId === 'visitor') {
        alert('Invalid queue ID');
        window.location.href = '/';
        return;
    }
    
    loadQueueInfo();
    loadQueueStatus();
    
    // Setup form submission
    document.getElementById('joinForm').addEventListener('submit', handleJoinQueue);
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
            
            // Show additional fields if required
            if (queue.askVisitorDetails) {
                document.getElementById('phoneGroup').style.display = 'block';
                document.getElementById('emailGroup').style.display = 'block';
            }
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
            document.getElementById('waitingCount').textContent = status.waitingCount || 0;
            document.getElementById('averageWaitTime').textContent = status.averageWaitTime || 0;
        })
        .catch(error => {
            console.error('Error loading queue status:', error);
        });
}

function handleJoinQueue(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const joinData = {
        name: formData.get('visitorName'),
        phone: formData.get('visitorPhone') || '',
        email: formData.get('visitorEmail') || ''
    };
    
    // Disable the join button
    const joinBtn = document.getElementById('joinBtn');
    joinBtn.disabled = true;
    joinBtn.textContent = 'Joining...';
    
    fetch(`/api/queues/${queueId}/join`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(joinData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to join queue');
        }
        return response.json();
    })
    .then(result => {
        showSuccessMessage(result);
    })
    .catch(error => {
        console.error('Error joining queue:', error);
        alert('Failed to join queue. Please try again.');
        
        // Re-enable the join button
        joinBtn.disabled = false;
        joinBtn.textContent = 'Join Queue';
    });
}

function showSuccessMessage(result) {
    // Hide the form
    document.getElementById('joinForm').style.display = 'none';
    
    // Show success message
    const successMessage = document.getElementById('successMessage');
    document.getElementById('tokenNumber').textContent = `#${result.tokenNumber}`;
    document.getElementById('position').textContent = result.position;
    document.getElementById('estimatedWait').textContent = result.estimatedWaitTime;
    
    // Set up status link
    const statusLink = document.getElementById('statusLink');
    statusLink.href = `/status/${queueId}?token=${result.tokenNumber}`;
    
    successMessage.style.display = 'block';
}