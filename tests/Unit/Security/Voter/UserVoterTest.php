<?php

namespace App\Tests\Unit\Security\Voter;

use App\Entity\User;
use App\Security\Voter\UserVoter;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\VoterInterface;

class UserVoterTest extends TestCase
{
    private UserVoter $voter;

    protected function setUp(): void
    {
        $this->voter = new UserVoter();
    }

    public function testVoteOnViewForSameUser(): void
    {
        // Arrange
        $user = new User();
        $user->setEmail('user@example.com');

        /** @var TokenInterface&\PHPUnit\Framework\MockObject\MockObject $token */
        $token = $this->createMock(TokenInterface::class);
        $token->method('getUser')->willReturn($user);

        // Act
        $result = $this->voter->vote($token, $user, [UserVoter::VIEW]);

        // Assert
        $this->assertEquals(VoterInterface::ACCESS_GRANTED, $result);
    }

    public function testVoteOnEditForSameUser(): void
    {
        // Arrange
        $user = new User();
        $user->setEmail('user@example.com');

        /** @var TokenInterface&\PHPUnit\Framework\MockObject\MockObject $token */
        $token = $this->createMock(TokenInterface::class);
        $token->method('getUser')->willReturn($user);

        // Act
        $result = $this->voter->vote($token, $user, [UserVoter::EDIT]);

        // Assert
        $this->assertEquals(VoterInterface::ACCESS_GRANTED, $result);
    }

    public function testVoteOnDeleteForSameUser(): void
    {
        // Arrange
        $user = new User();
        $user->setEmail('user@example.com');

        /** @var TokenInterface&\PHPUnit\Framework\MockObject\MockObject $token */
        $token = $this->createMock(TokenInterface::class);
        $token->method('getUser')->willReturn($user);

        // Act
        $result = $this->voter->vote($token, $user, [UserVoter::DELETE]);

        // Assert
        $this->assertEquals(VoterInterface::ACCESS_GRANTED, $result);
    }

    public function testVoteOnViewForDifferentUser(): void
    {
        // Arrange
        $user = new User();
        $user->setEmail('user@example.com');

        $differentUser = new User();
        $differentUser->setEmail('different@example.com');

        /** @var TokenInterface&\PHPUnit\Framework\MockObject\MockObject $token */
        $token = $this->createMock(TokenInterface::class);
        $token->method('getUser')->willReturn($differentUser);

        // Act
        $result = $this->voter->vote($token, $user, [UserVoter::VIEW]);

        // Assert
        $this->assertEquals(VoterInterface::ACCESS_DENIED, $result);
    }

    // public function testVoteOnViewForAdminUser(): void
    // {
    //     // Arrange
    //     $user = new User();
    //     $user->setEmail('user@example.com');

    //     $adminUser = new User();
    //     $adminUser->setEmail('admin@example.com');
    //     $adminUser->setRoles(['ROLE_ADMIN']);

    //     /** @var TokenInterface&\PHPUnit\Framework\MockObject\MockObject $token */
    //     $token = $this->createMock(TokenInterface::class);
    //     $token->method('getUser')->willReturn($adminUser);

    //     // Act
    //     $result = $this->voter->vote($token, $user, [UserVoter::VIEW]);

    //     // Assert
    //     $this->assertEquals(VoterInterface::ACCESS_GRANTED, $result);
    // }
}