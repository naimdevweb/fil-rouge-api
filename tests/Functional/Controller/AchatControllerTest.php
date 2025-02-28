<?php

namespace App\Tests\Functional\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;
use App\Entity\User;
use App\Entity\Vendeur;
use App\Entity\Book;
use App\Entity\Achat;
use App\Entity\Etat;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class AchatControllerTest extends WebTestCase
{
    private $client;
    private $entityManager;
    

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->entityManager = $this->client->getContainer()->get('doctrine')->getManager();
    }

    public function testGetAchats(): void
    {
        // Arrange
        $uniqueEmail = 'test' . uniqid() . '@example.com';
        $password = 'password';
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        $user = new User();
        $user->setEmail($uniqueEmail);
        $user->setPassword($hashedPassword);
        $user->setUserNom('Test Nom');
        $user->setUserPrenom('Test Prenom');
        $user->setTel('0606060606');
        $user->setRoles(['ROLE_USER', 'ROLE_VENDEUR']);
        $this->entityManager->persist($user);

        $vendeur = new Vendeur();
        $vendeur->setNomEntreprise('Test Nom_entreprise');
        $vendeur->setAdresseEntreprise('Test Adresse_entreprise');
        $vendeur->setUser($user);
        $this->entityManager->persist($vendeur);

        $etat = new Etat();
        $etat->setName('Disponible');
        $this->entityManager->persist($etat);

        $book = new Book();
        $book->setTitle('Test Book');
        $book->setAuthor('Test Author');
        $book->setPrix(10.5);
        $book->setDescriptionCourte('Test Description_courte');
        $book->setDescriptionLongue('Test Description_longue');
        $book->setImage('Test Image');
        $book->setEtat($etat);
        $book->setVendeur($vendeur);
        $this->entityManager->persist($book);

        $achat = new Achat();
        $achat->setAchatAt(new \DateTimeImmutable());
        $achat->setAcheteur($user);
        $achat->setVendeur($vendeur);
        $achat->setLivre($book);
        $this->entityManager->persist($achat);

        $this->entityManager->flush();

        // Perform login to get the token
        $this->client->request(
            'POST',
            '/api/login_check',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => $uniqueEmail, 'password' => 'password'])
        );

        $response = $this->client->getResponse();
        $this->assertResponseIsSuccessful();
        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('token', $data);
        $token = $data['token'];

        // Act
        $this->client->request(
            'GET',
            '/api/mes-achats',
            [],
            [],
            [
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token
            ]
        );

        // Assert
        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');
        $this->assertJson($this->client->getResponse()->getContent());
        $this->assertStringContainsString('Test Book', $this->client->getResponse()->getContent());
    }
}