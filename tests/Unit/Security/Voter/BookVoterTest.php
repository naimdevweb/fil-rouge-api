<?php

namespace App\Tests\Unit\Security\Voter;

use App\Entity\Book;
use App\Entity\User;
use App\Entity\Vendeur;
use App\Security\Voter\BookVoter;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

class BookVoterTest extends TestCase
{
    private BookVoter $voter;
    
    protected function setUp(): void
    {
        $this->voter = new BookVoter();
    }

    // Test si un utilisateur propriétaires d'un livre peut le modifier
    public function testVoteOnEditForBookOwner(): void
    {
        // Arrange
        $user = new User();
        $user->setRoles(['ROLE_VENDEUR']);
        $user->setEmail('test@example.com');
        $user->setTel('0606060606');
        $user->setPassword('password');
        $user->setUserNom('Test Nom');
        $user->setUserPrenom('Test Prenom');

        $vendeur = new Vendeur();
        $user->setUserVendeur($vendeur);
        $vendeur->setAdresseEntreprise('Test Adresse_entreprise');
        $vendeur->setNomEntreprise('Test Nom_entreprise');
        $book = new Book();
        $book->setVendeur($vendeur);
       
        
        /** @var TokenInterface&\PHPUnit\Framework\MockObject\MockObject $token */
        $token = $this->createMock(TokenInterface::class);
        $token->method('getUser')->willReturn($user);

        // Act
        $result = $this->voter->vote($token, $book, [BookVoter::EDIT]);

        // Assert
        $this->assertEquals(VoterInterface::ACCESS_GRANTED, $result);
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
        $anotherUser = new Vendeur();
        $book = new Book();
        $book->setVendeur($anotherUser);
        
        /** @var TokenInterface&\PHPUnit\Framework\MockObject\MockObject $token */
        $token = $this->createMock(TokenInterface::class);
        $token->method('getUser')->willReturn($user);

        // Act
        $result = $this->voter->vote($token, $book, [BookVoter::DELETE]);

        // Assert
        $this->assertEquals(VoterInterface::ACCESS_DENIED, $result);
    }


    public function testEditBookNotAuthenticated(): void
    {
        // Arrange
        $book = new Book();
        
        /** @var TokenInterface&\PHPUnit\Framework\MockObject\MockObject $token */
        $token = $this->createMock(TokenInterface::class);
        $token->method('getUser')->willReturn(null);

        // Act
        $result = $this->voter->vote($token, $book, [BookVoter::EDIT]);

        // Assert
        $this->assertEquals(VoterInterface::ACCESS_DENIED, $result);
    }

    public function testEditBookAuthenticatedNotOwner(): void
    {
        // Arrange
        $user = new User();
        $anotherUser = new Vendeur();
        $book = new Book();
        $book->setVendeur($anotherUser);
        
        /** @var TokenInterface&\PHPUnit\Framework\MockObject\MockObject $token */
        $token = $this->createMock(TokenInterface::class);
        $token->method('getUser')->willReturn($user);

        // Act
        $result = $this->voter->vote($token, $book, [BookVoter::EDIT]);

        // Assert
        $this->assertEquals(VoterInterface::ACCESS_DENIED, $result);
    }

}