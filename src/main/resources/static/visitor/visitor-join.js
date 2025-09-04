// Visitor Join Page Logic
document.addEventListener('DOMContentLoaded', async function() {
    const queueId = getPathParameter(); // Get queue ID from URL path
    const visitorForm = document.getElementById('visitorForm');
    const joinForm = document.getElementById('joinForm');
    const successMessage = document.getElementById('successMessage');
    
    let queueData = null;

    // Load queue information
    try {
        queueData = await QueueAPI.getQueue(queueId);
        document.getElementById('queueName').textContent = queueData.name.toUpperCase();
        
        // Show additional fields if queue asks for visitor details
        if (queueData.askVisitorDetails) {
            document.getElementById('additionalFields').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading queue:', error);
        showError('errorMessage', 'Queue not found or no longer active.');
        return;
    }

    // Handle form submission
    visitorForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const visitorName = document.getElementById('visitorName').value.trim();
        const visitorPhone = document.getElementById('visitorPhone').value.trim();
        const visitorEmail = document.getElementById('visitorEmail').value.trim();

        if (!visitorName) {
            showError('errorMessage', 'Please enter your name');
            return;
        }

        hideError('errorMessage');
        showLoader('joinBtn');

        try {
            const visitorData = {
                name: visitorName
            };

            // Add optional fields if queue asks for details
            if (queueData.askVisitorDetails) {
                if (visitorPhone) visitorData.phone = visitorPhone;
                if (visitorEmail) visitorData.email = visitorEmail;
            }

            const response = await QueueAPI.joinQueue(queueId, visitorData);
            
            // Show success message
            showSuccessMessage(response);
            
        } catch (error) {
            hideLoader('joinBtn');
            if (error.message.includes('not active')) {
                showError('errorMessage', 'This queue is no longer active.');
            } else {
                showError('errorMessage', 'Failed to join queue. Please try again.');
            }
            console.error('Error joining queue:', error);
        }
    });

    function showSuccessMessage(joinResponse) {
        hideLoader('joinBtn');
        
        // Hide join form and show success message
        joinForm.style.display = 'none';
        successMessage.style.display = 'block';
        
        document.getElementById('successQueueName').textContent = joinResponse.queueName;
        
        // Redirect to visitor status page after 3 seconds
        setTimeout(() => {
            window.location.href = `../visitor-status/index.html?queue=${queueId}&token=${joinResponse.tokenNumber}`;
        }, 3000);
    }
});