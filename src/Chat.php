<?php

namespace App;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use App\Helpers\WebSocketQuestionHelper;

class Chat implements MessageComponentInterface {
    protected $clients;
    protected $commandHandler;
    protected $questionHelpers;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
        $this->commandHandler = new CommandHandler();
        $this->questionHelpers = new \SplObjectStorage;
        echo "Chat server started!\n";
    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);
        $this->questionHelpers[$conn] = new WebSocketQuestionHelper();
        $this->questionHelpers[$conn]->setConnection($conn);
        echo "New connection! ({$conn->resourceId})\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        $data = json_decode($msg, true);
        echo "Received message: " . print_r($data, true) . "\n";
        
        if (isset($data['type']) && $data['type'] === 'question_response') {
            echo "Handling question response: " . print_r($data, true) . "\n";
            $this->questionHelpers[$from]->setConnection($from);
            $this->questionHelpers[$from]->handleResponse($data['response']);
            
            // Send the formatted response back to the client
            $message = json_encode([
                'type' => 'command_response',
                'command' => 'echo',
                'result' => "Hello, {$data['response']}!"
            ]);
            $from->send($message);
            return;
        }
        
        if (isset($data['command'])) {
            echo "Executing command: {$data['command']} with args: " . print_r($data['args'] ?? [], true) . "\n";
            $this->commandHandler->setConnection($from);
            $result = $this->commandHandler->handleCommand($data['command'], $data['args'] ?? []);
            echo "Command result: " . print_r($result, true) . "\n";
            return;
        }

        foreach ($this->clients as $client) {
            $client->send($msg);
        }
    }

    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);
        unset($this->questionHelpers[$conn]);
        echo "Connection {$conn->resourceId} has disconnected\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "An error has occurred: {$e->getMessage()}\n";
        $conn->close();
    }
} 
