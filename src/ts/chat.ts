interface ChatMessage {
    message: string;
    sender: string;
}

class ChatClient {
    private socket: WebSocket;
    private messageContainer: HTMLDivElement;
    private messageInput: HTMLInputElement;
    private sendButton: HTMLButtonElement;
    private username: string;

    constructor() {
        this.socket = new WebSocket('ws://localhost:8080');
        this.username = `User${Math.floor(Math.random() * 1000)}`;
        this.messageContainer = document.getElementById('messageContainer') as HTMLDivElement;
        this.messageInput = document.getElementById('messageInput') as HTMLInputElement;
        this.sendButton = document.getElementById('sendButton') as HTMLButtonElement;
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.socket.onopen = () => {
            console.log('Connected to WebSocket server');
            this.addSystemMessage('Connected to chat server');
        };

        this.socket.onmessage = (event) => {
            const message: ChatMessage = JSON.parse(event.data);
            this.addMessage(message);
        };

        this.socket.onclose = () => {
            console.log('Disconnected from WebSocket server');
            this.addSystemMessage('Disconnected from chat server');
        };

        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    private sendMessage(): void {
        const message = this.messageInput.value.trim();
        if (message) {
            const chatMessage: ChatMessage = {
                message,
                sender: this.username
            };
            this.socket.send(JSON.stringify(chatMessage));
            this.messageInput.value = '';
        }
    }

    private addMessage(message: ChatMessage): void {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerHTML = `
            <strong>${message.sender}:</strong>
            <span>${message.message}</span>
        `;
        this.messageContainer.appendChild(messageElement);
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }

    private addSystemMessage(message: string): void {
        const messageElement = document.createElement('div');
        messageElement.className = 'system-message';
        messageElement.textContent = message;
        this.messageContainer.appendChild(messageElement);
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }
}

// Initialize chat when the page loads
window.addEventListener('load', () => {
    new ChatClient();
}); 
