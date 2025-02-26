<?php

namespace App\Tests\Functional\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;

class BookControllerTest extends WebTestCase
{
    private $client;
    private $entityManager;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->entityManager = $this->client->getContainer()
            ->get('doctrine')
            ->getManager();
    }

    // Test if we get the books (200 status code) and if we get them as a JSON
    public function testGetBooks(): void
    {
        // Act
        $this->client->request('GET', '/api/books');

        // Assert
        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');
    }

    // Test if we get Unauthorized response (status code 401) when we try to create a Book while not authenticated 
    public function testCreateBookWithoutAuth(): void
    {
        // Arrange
        $data = [
            'title' => 'Test Book',
            'author' => 'Test Author'
        ];

        // Act
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

        // Assert
        $this->assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }
}