interface ChatMessage {
    message: string;
    sender: string;
}

interface CommandMessage {
    command: string;
    args?: string[];
}

interface CommandResponse {
    type: 'command_response';
    command: string;
    result: string;
}

interface QuestionMessage {
    type: 'question';
    question: string;
}

class ChatClient {
    private socket: WebSocket;
    private messageContainer: HTMLDivElement;
    private messageInput: HTMLInputElement;
    private sendButton: HTMLButtonElement;
    private username: string;
    private isWaitingForQuestion: boolean = false;

    constructor() {
        console.log('Initializing WebSocket connection...');
        this.socket = new WebSocket('ws://localhost:8080');
        this.username = `User${Math.floor(Math.random() * 1000)}`;
        this.messageContainer = document.getElementById('messageContainer') as HTMLDivElement;
        this.messageInput = document.getElementById('messageInput') as HTMLInputElement;
        this.sendButton = document.getElementById('sendButton') as HTMLButtonElement;
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.socket.onopen = () => {
            console.log('WebSocket connection established');
            this.addSystemMessage('Connected to chat server');
        };

        this.socket.onmessage = (event) => {
            console.log('Raw WebSocket message received:', event);
            console.log('Message data:', event.data);
            const data = JSON.parse(event.data);
            console.log('Parsed data:', data);
            
            if (data.type === 'question') {
                console.log('Handling question:', data);
                this.handleQuestion(data as QuestionMessage);
            } else if (data.type === 'command_response') {
                console.log('Handling command response:', data);
                this.addSystemMessage(`Command '${data.command}' result: ${data.result}`);
            } else {
                console.log('Handling regular message:', data);
                this.addMessage(data as ChatMessage);
            }
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.addSystemMessage('WebSocket error occurred');
        };

        this.socket.onclose = (event) => {
            console.log('WebSocket connection closed:', event.code, event.reason);
            this.addSystemMessage('Disconnected from chat server');
        };

        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    private handleQuestion(question: QuestionMessage): void {
        console.log('Handling question:', question);
        this.isWaitingForQuestion = true;
        this.messageInput.placeholder = question.question;
        this.messageInput.value = '';
        this.messageInput.focus();
        this.addSystemMessage(`Question: ${question.question}`);
    }

    private sendMessage(): void {
        const message = this.messageInput.value.trim();
        if (!message) return;

        if (this.isWaitingForQuestion) {
            this.socket.send(JSON.stringify({
                type: 'question_response',
                response: message
            }));
            this.isWaitingForQuestion = false;
            this.messageInput.placeholder = 'Type your message...';
        } else if (message.startsWith('/')) {
            // Handle command
            const [command, ...args] = message.slice(1).split(' ');
            const commandMessage: CommandMessage = {
                command,
                args
            };
            this.socket.send(JSON.stringify(commandMessage));
        } else {
            // Handle regular message
            const chatMessage: ChatMessage = {
                message,
                sender: this.username
            };
            this.socket.send(JSON.stringify(chatMessage));
        }
        
        this.messageInput.value = '';
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
