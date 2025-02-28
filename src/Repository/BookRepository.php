<?php

namespace App\Repository;

use App\Entity\Book;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Book>
 */
class BookRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Book::class);
    }

   /**
     * @return Book[] Returns an array of Book objects
     */
    public function findOtherBooksByVendeur(Book $book): array
    {
        return $this->createQueryBuilder('b')
            ->andWhere('b.vendeur = :vendeur')
            ->andWhere('b.id != :bookId')
            ->setParameter('vendeur', $book->getVendeur())
            ->setParameter('bookId', $book->getId())
            ->getQuery()
            ->getResult();
    }

//    public function findOneBySomeField($value): ?Book
//    {
//        return $this->createQueryBuilder('b')
//            ->andWhere('b.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
