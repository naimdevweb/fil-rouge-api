<?php

namespace App\Repository;

use App\Entity\Achat;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Achat>
 */
class AchatRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Achat::class);
    }

    /**
     * @return array Returns an array of book titles, vendor first names, and vendor company details
     */
    public function findBookTitlesAndVendorDetailsByUser($userId): array
    {
        return $this->createQueryBuilder('a')
            ->select('b.title', 'b.prix', 'u.user_prenom', 'v.nom_entreprise', 'v.adresse_entreprise')
            ->join('a.livre', 'b')
            ->join('a.vendeur', 'v')
            ->join('v.user', 'u')
            ->where('a.acheteur = :userId')
            ->setParameter('userId', $userId)
            ->getQuery()
            ->getArrayResult();
    }

   /**
     * @return array Returns an array of book titles and prices sold by a vendor
     */
    public function findBookTitlesAndPricesByVendor($vendorId): array
    {
        return $this->createQueryBuilder('a')
            ->select('b.title', 'b.prix')
            ->join('a.livre', 'b')
            ->where('a.vendeur = :vendorId')
            ->setParameter('vendorId', $vendorId)
            ->getQuery()
            ->getArrayResult();
    }


}