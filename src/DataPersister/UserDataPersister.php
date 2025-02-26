<?php
namespace App\DataPersister;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use App\Entity\Vendeur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserDataPersister implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserPasswordHasherInterface $passwordHasher
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if ($data instanceof User) {
            if ($data->getPassword()) {
                $hashedPassword = $this->passwordHasher->hashPassword($data, $data->getPassword());
                $data->setPassword($hashedPassword);
                $data->setRoles(['ROLE_USER']);
            }

            $this->entityManager->persist($data);
            $this->entityManager->flush();
        }

        if ($data instanceof Vendeur) {
            $user = $data->getUser();
            if ($user) {
                $user->setRoles(['ROLE_VENDEUR',"ROLE_USER"]);
            }

            $this->entityManager->persist($data);
            $this->entityManager->flush();
        }

        return $data;
    }
}