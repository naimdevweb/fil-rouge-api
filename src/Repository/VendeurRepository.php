<?php

namespace App\Repository;

use App\Entity\Vendeur;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Vendeur>
 */
class VendeurRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Vendeur::class);
    }

    /**
     * @return array Returns an array of book details (title, descriptionCourte, descriptionLongue, prix, author, categories, etat)
     */
    public function findBookDetailsByVendeur(int $vendeurId): array
    {
        $qb = $this->createQueryBuilder('v')
            ->select('b.title, b.description_courte, b.description_longue, b.prix, b.author, c.name as category, e.etat as etat')
            ->join('v.books', 'b')
            ->leftJoin('b.categories', 'c')
            ->leftJoin('b.etat', 'e')
            ->where('v.id = :vendeurId')
            ->setParameter('vendeurId', $vendeurId);

        return $qb->getQuery()->getArrayResult();
    }
}