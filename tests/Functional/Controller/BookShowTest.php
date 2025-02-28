<?php

namespace App\Tests\Functional\Controller;

use App\Entity\Book;
use App\Entity\Category;
use App\Entity\Etat;
use App\Entity\User;
use App\Entity\Vendeur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Response;

class BookShowTest extends WebTestCase
{
    private KernelBrowser $client;
    private ContainerInterface $container;
    private EntityManagerInterface $entityManager;

    protected function setUp(): void
    {
        static::ensureKernelShutdown();
        $this->client = static::createClient();
        $this->container = static::getContainer();
        $this->entityManager = $this->container->get('doctrine')->getManager();
        $this->entityManager->beginTransaction();
    }

    protected function tearDown(): void
    {
        $this->entityManager->rollback();
        parent::tearDown();
    }

    public function testShowBookNotFound(): void
    {
        $this->client->request('GET', '/api/books/999999');
        
        $this->assertEquals(Response::HTTP_NOT_FOUND, $this->client->getResponse()->getStatusCode());
    }

    public function testShowBookSuccess(): void
    {
        $uniqueEmail = 'test' . uniqid() . '@example.com';
        // Arrange
        $user = new User();
        $user->setRoles(['ROLE_VENDEUR']);
        $user->setEmail($uniqueEmail);
        $user->setTel('0606060606');
        $user->setPassword('password');
        $user->setUserNom('Test Nom');
        $user->setUserPrenom('Test Prenom');
        
        $vendeur = new Vendeur();
        $user->setUserVendeur($vendeur);
        $vendeur->setAdresseEntreprise('Test Adresse_entreprise');
        $vendeur->setNomEntreprise('Test Nom_entreprise');

        $etat = new Etat();
        $etat->setName('Test State');

        $category = new Category();
        $category->setName('Test State');
        
        $book = new Book();
        $book->setTitle('Test Book');
        $book->setAuthor('Test Author');
        $book->setPrix(10.5);
        $book->setDescriptionCourte('Test Description_courte');
        $book->setDescriptionLongue('Test Description_longue');
        $book->setImage('Test Image');
        $book->setEtat($etat);
        $book->addCategory($category);
        $book->setVendeur($vendeur);
        
        $this->entityManager->persist($user);
        $this->entityManager->persist($book);
        $this->entityManager->persist($vendeur);
        $this->entityManager->persist($etat);
        $this->entityManager->persist($category);
        $this->entityManager->flush();
        
        // Act
        $this->client->request('GET', '/api/books/' . $book->getId());
        
        // Assert
        $this->assertEquals(Response::HTTP_OK, $this->client->getResponse()->getStatusCode());
        $this->assertJson($this->client->getResponse()->getContent());
        $this->assertStringContainsString('Test Book', $this->client->getResponse()->getContent());
    }
}