<?php

namespace App\State\Provider;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Repository\AchatRepository;
use Symfony\Bundle\SecurityBundle\Security;

class AchatVendeurProvider implements ProviderInterface
{
    private AchatRepository $achatRepository;
    private Security $security;

    public function __construct(AchatRepository $achatRepository, Security $security)
    {
        $this->achatRepository = $achatRepository;
        $this->security = $security;
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): iterable
    {
        $user = $this->security->getUser();

        if (!$user) {
            throw new \LogicException('User not found');
        }
        
        /**
         * @var \App\Entity\User $user 
         */

        $vendorId = $user->getUserVendeur()->getId();

        return $this->achatRepository->findBookTitlesAndPricesByVendor($vendorId);
    }
}