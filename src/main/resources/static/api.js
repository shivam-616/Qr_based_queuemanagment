// API Base Configuration
const API_BASE_URL = 'http://localhost:8080/api';

// Utility function for making API requests
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    try {
        const response = await fetch(url, config);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Queue Management API
const QueueAPI = {
    // Create a new queue
    createQueue: async (queueData) => {
        return await apiRequest('/queues', {
            method: 'POST',
            body: JSON.stringify(queueData)
        });
    },

    // Get queue by ID
    getQueue: async (queueId) => {
        return await apiRequest(`/queues/${queueId}`);
    },

    // Join a queue
    joinQueue: async (queueId, visitorData) => {
        return await apiRequest(`/queues/${queueId}/join`, {
            method: 'POST',
            body: JSON.stringify(visitorData)
        });
    },

    // Get queue status
    getQueueStatus: async (queueId) => {
        return await apiRequest(`/queues/${queueId}/status`);
    },

    // Call next visitor (admin)
    callNextVisitor: async (queueId) => {
        return await apiRequest(`/queues/${queueId}/call-next`, {
            method: 'POST',
            body: JSON.stringify({})
        });
    },

    // Get entry by token
    getEntryByToken: async (tokenNumber) => {
        return await apiRequest(`/queues/entry/${tokenNumber}`);
    },

    // Complete service
    completeService: async (entryId) => {
        return await apiRequest(`/queues/entry/${entryId}/complete`, {
            method: 'POST',
            body: JSON.stringify({})
        });
    }
};

// WebSocket Connection for Real-time Updates
class WebSocketManager {
    constructor() {
        this.socket = null;
        this.stompClient = null;
        this.connected = false;
    }

    connect() {
        return new Promise((resolve, reject) => {
            try {
                // Using SockJS for WebSocket connection
                this.socket = new SockJS('http://localhost:8080/ws');
                this.stompClient = Stomp.over(this.socket);
                
                this.stompClient.connect({}, (frame) => {
                    console.log('Connected to WebSocket: ' + frame);
                    this.connected = true;
                    resolve(frame);
                }, (error) => {
                    console.error('WebSocket connection error:', error);
                    reject(error);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    disconnect() {
        if (this.stompClient && this.connected) {
            this.stompClient.disconnect();
            this.connected = false;
            console.log('WebSocket disconnected');
        }
    }

    subscribe(destination, callback) {
        if (this.stompClient && this.connected) {
            return this.stompClient.subscribe(destination, (message) => {
                try {
                    const data = JSON.parse(message.body);
                    callback(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            });
        }
        return null;
    }

    send(destination, message) {
        if (this.stompClient && this.connected) {
            this.stompClient.send(destination, {}, JSON.stringify(message));
        }
    }
}

// Global WebSocket instance
const websocket = new WebSocketManager();

// Utility Functions
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.classList.remove('show');
    }
}

function showLoader(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
        const textElement = button.querySelector('.btn-text');
        const loaderElement = button.querySelector('.loader');
        if (textElement) textElement.style.display = 'none';
        if (loaderElement) loaderElement.style.display = 'block';
        button.disabled = true;
    }
}

function hideLoader(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
        const textElement = button.querySelector('.btn-text');
        const loaderElement = button.querySelector('.loader');
        if (textElement) textElement.style.display = 'inline';
        if (loaderElement) loaderElement.style.display = 'none';
        button.disabled = false;
    }
}

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function getPathParameter(index = -1) {
    const pathParts = window.location.pathname.split('/').filter(part => part);
    return index === -1 ? pathParts[pathParts.length - 1] : pathParts[index];
}

// Format time helper
function formatWaitTime(minutes) {
    if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes > 0 ? remainingMinutes + ' minute' + (remainingMinutes !== 1 ? 's' : '') : ''}`;
    }
}

// Copy to clipboard helper
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Text copied to clipboard');
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            console.log('Text copied to clipboard');
        } catch (err) {
            console.error('Could not copy text: ', err);
        }
        document.body.removeChild(textArea);
    }
}