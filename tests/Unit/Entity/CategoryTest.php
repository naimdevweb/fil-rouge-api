<?php

namespace App\Tests\Unit\Entity;

use App\Entity\Book;
use App\Entity\Category;
use PHPUnit\Framework\TestCase;

class CategoryTest extends TestCase
{
    public function testCategoryCreation(): void
    {
        // Arrange
        $category = new Category();
        $category->setName('Technology');

        // Assert
        $this->assertEquals('Technology', $category->getName());
        $this->assertEmpty($category->getBooks());
    }

    public function testAddAndRemoveBook(): void
    {
        // Arrange
        $category = new Category();
        $book = new Book();
        
        // Act & Assert - Add
        $category->addBook($book);
        $this->assertCount(1, $category->getBooks());
        $this->assertTrue($category->getBooks()->contains($book));
        
        // Act & Assert - Remove
        $category->removeBook($book);
        $this->assertCount(0, $category->getBooks());
        $this->assertFalse($category->getBooks()->contains($book));
    }
}