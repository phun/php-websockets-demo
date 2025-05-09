<?php

namespace App;

use Ratchet\ConnectionInterface;
use Symfony\Component\Console\Application;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\BufferedOutput;
use App\Helpers\WebSocketQuestionHelper;

class CommandHandler {
    private $connection;
    private $application;
    private $questionHelper;

    public function __construct() {
        $this->application = new Application();
        $this->application->add(new Commands\EchoCommand());
        $this->application->setAutoExit(false);
        $this->questionHelper = new WebSocketQuestionHelper();
        echo "CommandHandler initialized\n";
    }

    public function setConnection(ConnectionInterface $connection) {
        $this->connection = $connection;
        echo "Setting connection for CommandHandler\n";
        $this->questionHelper->setConnection($connection);
        $this->application->getHelperSet()->set($this->questionHelper, 'question');
    }

    public function handleCommand(string $command, array $args = []): string {
        echo "Handling command: {$command} with args: " . print_r($args, true) . "\n";
        
        $input = new ArrayInput(['command' => $command, 'args' => $args]);
        $output = new BufferedOutput();
        
        $this->application->run($input, $output);
        $result = $output->fetch();
        echo "Command result: {$result}\n";

        // Send the response back to the client
        if ($this->connection) {
            $message = json_encode([
                'type' => 'command_response',
                'command' => $command,
                'result' => $result
            ]);
            $this->connection->send($message);
        }

        return $result;
    }
} 
