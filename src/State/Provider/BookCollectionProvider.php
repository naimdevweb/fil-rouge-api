<?php

namespace App\State\Provider;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Entity\Book;
use App\Repository\BookRepository;

class BookCollectionProvider implements ProviderInterface
{
    private BookRepository $bookRepository;

    public function __construct(BookRepository $bookRepository)
    {
        $this->bookRepository = $bookRepository;
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): array
    {
        $bookId = $uriVariables['id'];
        $book = $this->bookRepository->find($bookId);

        if (!$book) {
            throw new \RuntimeException('Book not found');
        }

        return $this->bookRepository->findOtherBooksByVendeur($book);
    }
}