<?php

namespace App\Helpers;

use Symfony\Component\Console\Helper\QuestionHelper;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\Question;
use Ratchet\ConnectionInterface;

class WebSocketQuestionHelper extends QuestionHelper {
    private $connection;
    private $responseCallback;
    private $isWaiting = false;
    private $pendingQuestions = [];

    public function setConnection(ConnectionInterface $connection) {
        echo "Setting connection for WebSocketQuestionHelper\n";
        $this->connection = $connection;
    }

    public function ask(InputInterface $input, OutputInterface $output, Question $question): mixed {
        echo "WebSocketQuestionHelper::ask called with question: " . $question->getQuestion() . "\n";
        
        if (!$this->connection) {
            throw new \RuntimeException('WebSocket connection not set');
        }

        $message = json_encode([
            'type' => 'question',
            'question' => $question->getQuestion()
        ]);
        echo "Sending question to client: {$message}\n";
        
        try {
            $this->connection->send($message);
            echo "Message sent successfully\n";
            return "";
        } catch (\Exception $e) {
            echo "Error sending message: " . $e->getMessage() . "\n";
            throw $e;
        }
    }

    public function handleResponse($response) {
        echo "WebSocketQuestionHelper::handleResponse called with: {$response}\n";
        $this->responseCallback = $response;
        $this->isWaiting = false;
    }
} 
