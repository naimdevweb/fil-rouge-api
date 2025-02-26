<?php

namespace App\State\Provider;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Repository\VendeurRepository;

class BookCollectionProvider implements ProviderInterface
{
    private VendeurRepository $vendeurRepository;

    public function __construct(VendeurRepository $vendeurRepository)
    {
        $this->vendeurRepository = $vendeurRepository;
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): iterable
    {
        $vendeurId = $uriVariables['id'];
        return $this->vendeurRepository->findBookDetailsByVendeur((int) $vendeurId);
    }
}