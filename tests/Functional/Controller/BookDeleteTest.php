<?php

namespace App\Tests\Functional\Controller;

use App\Entity\Book;
use App\Entity\User;
use App\Security\Voter\BookVoter;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

class BookDeleteTest extends WebTestCase
{
    private BookVoter $voter;

    protected function setUp(): void
    {
        $this->voter = new BookVoter();
    }

    public function testDeleteBookNotAuthenticated(): void
    {
        // Arrange
        $book = new Book();
        
        /** @var TokenInterface&\PHPUnit\Framework\MockObject\MockObject $token */
        $token = $this->createMock(TokenInterface::class);
        $token->method('getUser')->willReturn(null);

        // Act
        $result = $this->voter->vote($token, $book, [BookVoter::DELETE]);

        // Assert
        $this->assertEquals(VoterInterface::ACCESS_DENIED, $result);
    }

    public function testDeleteBookAuthenticatedNotOwner(): void
    {
        // Arrange
        $user = new User();
        $anotherUser = new User();
        $book = new Book();
        $book->setUser($anotherUser);
        
        /** @var TokenInterface&\PHPUnit\Framework\MockObject\MockObject $token */
        $token = $this->createMock(TokenInterface::class);
        $token->method('getUser')->willReturn($user);

        // Act
        $result = $this->voter->vote($token, $book, [BookVoter::DELETE]);

        // Assert
        $this->assertEquals(VoterInterface::ACCESS_DENIED, $result);
    }

    public function testDeleteBookAuthenticatedOwner(): void
    {
        // Arrange
        $user = new User();
        $book = new Book();
        $book->setUser($user);
        
        /** @var TokenInterface&\PHPUnit\Framework\MockObject\MockObject $token */
        $token = $this->createMock(TokenInterface::class);
        $token->method('getUser')->willReturn($user);

        // Act
        $result = $this->voter->vote($token, $book, [BookVoter::DELETE]);

        // Assert
        $this->assertEquals(VoterInterface::ACCESS_GRANTED, $result);
    }
}