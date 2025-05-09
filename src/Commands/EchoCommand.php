<?php

namespace App\Commands;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Question\Question;

class EchoCommand extends Command {
    protected function configure() {
        $this
            ->setName('echo')
            ->setDescription('Echo back the input')
            ->addArgument('args', InputArgument::IS_ARRAY, 'Arguments to echo');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int {
        $args = $input->getArgument('args');
        $output->writeln(implode(' ', $args));

        /** @var \Symfony\Component\Console\Helper\QuestionHelper $helper */
        $helper = $this->getHelper('question');
        $question = new Question('What is your name? ');
        $name = $helper->ask($input, $output, $question);

        if ($name) {
            $output->writeln("Hello, {$name}!");
        }

        return Command::SUCCESS;
    }
}
