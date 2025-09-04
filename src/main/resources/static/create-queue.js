// Create Queue Page Logic
document.addEventListener('DOMContentLoaded', function() {
    const queueForm = document.getElementById('queueForm');
    const askVisitorDetailsToggle = document.getElementById('askVisitorDetails');
    const visitorInputPreview = document.getElementById('visitorInputPreview');
    const createForm = document.getElementById('createForm');
    const successPage = document.getElementById('successPage');

    // Toggle visitor input preview
    askVisitorDetailsToggle.addEventListener('change', function() {
        if (this.checked) {
            visitorInputPreview.style.display = 'block';
        } else {
            visitorInputPreview.style.display = 'none';
        }
    });

    // Handle form submission
    queueForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const queueName = document.getElementById('queueName').value.trim();
        const askVisitorDetails = document.getElementById('askVisitorDetails').checked;

        if (!queueName) {
            showError('errorMessage', 'Please enter a queue name');
            return;
        }

        hideError('errorMessage');
        showLoader('createBtn');

        try {
            const queueData = {
                name: queueName,
                description: '',
                askVisitorDetails: askVisitorDetails
            };

            const response = await QueueAPI.createQueue(queueData);
            
            // Show success page with queue details
            showSuccessPage(response);
            
        } catch (error) {
            hideLoader('createBtn');
            showError('errorMessage', 'Failed to create queue. Please try again.');
            console.error('Error creating queue:', error);
        }
    });

    function showSuccessPage(queueData) {
        hideLoader('createBtn');
        
        // Hide create form and show success page
        createForm.style.display = 'none';
        successPage.style.display = 'block';
        
        // Populate success page with queue data
        document.getElementById('createdQueueName').textContent = queueData.name.toUpperCase();
        document.getElementById('visitorLink').href = queueData.visitorLink;
        document.getElementById('visitorLink').textContent = queueData.visitorLink;
        document.getElementById('posterLink').href = queueData.posterLink;
        document.getElementById('posterLink').textContent = queueData.posterLink;
        document.getElementById('adminLink').href = queueData.adminLink;
        document.getElementById('adminLink').textContent = queueData.adminLink;
        document.getElementById('statusLink').href = queueData.statusDisplayLink;
        document.getElementById('statusLink').textContent = queueData.statusDisplayLink;

        // Handle button clicks
        document.getElementById('copyAllBtn').addEventListener('click', function() {
            const allLinks = `
Queue: ${queueData.name}
Visitor Link: ${queueData.visitorLink}
Poster: ${queueData.posterLink}
Admin: ${queueData.adminLink}
Status Display: ${queueData.statusDisplayLink}
            `;
            copyToClipboard(allLinks);
            this.textContent = '✓ Copied!';
            setTimeout(() => {
                this.textContent = '📋 Copy all';
            }, 2000);
        });

        document.getElementById('createMoreBtn').addEventListener('click', function() {
            window.location.reload();
        });
    }
});