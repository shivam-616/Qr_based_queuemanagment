// Poster Page Logic
document.addEventListener('DOMContentLoaded', async function() {
    const queueId = getPathParameter(); // Get queue ID from URL path
    let queueData = null;

    // Load queue information and QR code
    try {
        queueData = await QueueAPI.getQueue(queueId);
        document.getElementById('queueName').textContent = queueData.name;
        
        if (queueData.qrCode) {
            displayQRCode(queueData.qrCode);
        } else {
            throw new Error('QR code not found');
        }
    } catch (error) {
        console.error('Error loading queue data:', error);
        document.getElementById('queueName').textContent = 'ERROR';
        document.getElementById('qrLoader').innerHTML = '<p style="color: #ef4444;">Failed to load QR code</p>';
    }

    // Event listeners
    document.getElementById('printBtn').addEventListener('click', printPoster);
    document.getElementById('downloadBtn').addEventListener('click', downloadQRCode);

    function displayQRCode(qrCodeBase64) {
        const qrImage = document.getElementById('qrCodeImage');
        const qrLoader = document.getElementById('qrLoader');
        
        // Create full data URL if not already present
        const qrCodeDataUrl = qrCodeBase64.startsWith('data:') ? qrCodeBase64 : `data:image/png;base64,${qrCodeBase64}`;
        
        qrImage.src = qrCodeDataUrl;
        qrImage.onload = function() {
            qrLoader.style.display = 'none';
            qrImage.style.display = 'block';
        };
        qrImage.onerror = function() {
            qrLoader.innerHTML = '<p style="color: #ef4444;">Failed to load QR code</p>';
        };
    }

    function printPoster() {
        // Trigger browser print dialog
        window.print();
    }

    function downloadQRCode() {
        if (!queueData || !queueData.qrCode) {
            alert('QR code not available for download');
            return;
        }

        try {
            // Create download link
            const link = document.createElement('a');
            const qrCodeDataUrl = queueData.qrCode.startsWith('data:') ? queueData.qrCode : `data:image/png;base64,${queueData.qrCode}`;
            link.href = qrCodeDataUrl;
            link.download = `${queueData.name}-qr-code.png`;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('QR code download initiated');
        } catch (error) {
            console.error('Error downloading QR code:', error);
            alert('Failed to download QR code');
        }
    }
});