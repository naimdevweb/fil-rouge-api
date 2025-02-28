<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Book;
use App\Entity\Etat;
use PHPUnit\Framework\TestCase;

class EtatTest extends TestCase
{
    public function testEtatCreation(): void
    {
        // Arrange
        $etat = new Etat();
        $etat->setName('Disponible');

        // Assert
        $this->assertEquals('Disponible', $etat->getName());
        $this->assertEmpty($etat->getBooks());
    }

    public function testAddAndRemoveBook(): void
    {
        // Arrange
        $etat = new Etat();
        $book = new Book();
        
        // Act & Assert - Add
        $etat->addBook($book);
        $this->assertCount(1, $etat->getBooks());
        $this->assertTrue($etat->getBooks()->contains($book));
        
        // Act & Assert - Remove
        $etat->removeBook($book);
        $this->assertCount(0, $etat->getBooks());
        $this->assertFalse($etat->getBooks()->contains($book));
    }
}