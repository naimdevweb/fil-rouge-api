<?php

namespace App\DataPersister;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\Post;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Book;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

class BookDataPersister implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly Security $security
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Book
    {
        if ($data instanceof Book && $operation instanceof Post) {
            /**
             * @var User $user
             */
            $user = $this->security->getUser();
            $data->setVendeur($user->getUserVendeur());
        }

        $this->entityManager->persist($data);
        $this->entityManager->flush();

        return $data;
    }
}