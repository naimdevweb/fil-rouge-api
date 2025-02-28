<?php

namespace App\Tests\Functional\Controller;

use App\Entity\Book;
use App\Entity\Category;
use App\Entity\Etat;
use App\Entity\User;
use App\Entity\Vendeur;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Container\ContainerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;


class BookControllerTest extends WebTestCase
{
    private KernelBrowser $client;
    private ContainerInterface $container;
    private EntityManagerInterface $entityManager;


    public function teardown(): void
    {
        parent::tearDown();
        $this->entityManager->close();
    }

    protected function setUp(): void
    {
        $this->client = static::createClient();
        static::ensureKernelShutdown();
        $this->client = static::createClient();
        $this->container = static::getContainer();
        $this->entityManager = $this->container->get('doctrine')->getManager();
        $this->entityManager->beginTransaction();
        
    }

    public function testGetBooks(): void
    {
        $this->client->request('GET', '/api/books');

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');
    }

    public function testCreateBookWithoutAuth(): void
    {
        $data = [
            'title' => 'Test Book',
            'author' => 'Test Author',
            'prix' => 10.5,
            'description_courte' => 'Test Description_courte',
            'description_longue' => 'Test Description_longue',
            'image' => 'Test Image',
            'vendeur_id' => 1,
            'acheteur_id' => 1,


        ];

        $this->client->request(
            'POST',
            '/api/books',
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/ld+json',
                'HTTP_ACCEPT' => 'application/ld+json'
            ],
            json_encode($data)
        );

        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
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
        $etat->setName('Disponible');

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
        $this->entityManager->persist($vendeur);
        $this->entityManager->persist($etat);
        $this->entityManager->persist($book);
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
