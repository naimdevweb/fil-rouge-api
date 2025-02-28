<?php

namespace App\DataPersister;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserUpdateDataPersister implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly Security $security,
        private readonly UserPasswordHasherInterface $passwordHasher
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): User
    {
        if ($data instanceof User) {
            /**
             * @var User
             */
            $currentUser = $this->security->getUser();
            

            // Update only the fields that are provided
            if ($data->getEmail()) {
                $currentUser->setEmail($data->getEmail());
            }
            if ($data->getUserPrenom()) {
                $currentUser->setUserPrenom($data->getUserPrenom());
            }
            if ($data->getUserNom()) {
                $currentUser->setUserNom($data->getUserNom());
            }
            if ($data->getTel()) {
                $currentUser->setTel($data->getTel());
            }
            if($data->getPassword()) {
                $hashedPassword = $this->passwordHasher->hashPassword($currentUser, $data->getPassword());
                $currentUser->setPassword($hashedPassword);
            }

            $this->entityManager->persist($currentUser);
            $this->entityManager->flush();
        }

        return $data;
    }
}