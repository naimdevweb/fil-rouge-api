<?php
namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\GetCollection;
use App\DataPersister\UserDataPersister;
use App\Repository\VendeurRepository;
use App\State\Provider\BookCollectionProvider;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: VendeurRepository::class)]
#[ApiResource(
    operations: [
        new Get(
            uriTemplate: '/vendeurs/{id}',
            normalizationContext: ['groups' => ['vendeur:read']],
            security: "is_granted('ROLE_USER')",
            securityMessage: "Vous devez être connecté pour accéder à cette ressource"
        ),
       
        new Post(
            uriTemplate: '/vendeurs',
            denormalizationContext: ['groups' => ['vendeur:write']],
            validationContext: ['groups' => ['Default']],
            security: "is_granted('PUBLIC_ACCESS')",
            processor: UserDataPersister::class
        ),
        new Patch(
            uriTemplate: '/vendeurs/{id}',
            denormalizationContext: ['groups' => ['vendeur:write']],
            security: "is_granted('ROLE_VENDEUR') and object.getUser() == user",
            securityMessage: "Vous ne pouvez modifier que votre propre compte vendeur"
        ),
        new Delete(
            uriTemplate: '/vendeurs/{id}',
            security: "is_granted('ROLE_USER') and object.getUser() == user",
            securityMessage: "Vous ne pouvez supprimer que votre propre compte vendeur"
        )
    ],
    normalizationContext: ['groups' => ['vendeur:read']],
    denormalizationContext: ['groups' => ['vendeur:write']]
)]
class Vendeur
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['vendeur:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['vendeur:read', 'vendeur:write'])]
    private ?string $adresse_entreprise = null;

    #[ORM\Column(length: 255)]
    #[Groups(['vendeur:read', 'vendeur:write'])]
    private ?string $nom_entreprise = null;

    #[ORM\OneToMany(targetEntity: Book::class, mappedBy: 'vendeur', cascade: ['persist', 'remove'])]
    #[Groups(['vendeur:read'])]
    private Collection $books;

    #[ORM\OneToOne(inversedBy: 'user_vendeur', cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['vendeur:read', 'vendeur:write'])]
    private ?User $user = null;

    public function __construct()
    {
        $this->books = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAdresseEntreprise(): ?string
    {
        return $this->adresse_entreprise;
    }

    public function setAdresseEntreprise(string $adresse_entreprise): static
    {
        $this->adresse_entreprise = $adresse_entreprise;

        return $this;
    }

    public function getNomEntreprise(): ?string
    {
        return $this->nom_entreprise;
    }

    public function setNomEntreprise(string $nom_entreprise): static
    {
        $this->nom_entreprise = $nom_entreprise;

        return $this;
    }

    /**
     * @return Collection<int, Book>
     */
    public function getBooks(): Collection
    {
        return $this->books;
    }

    public function addBook(Book $book): static
    {
        if (!$this->books->contains($book)) {
            $this->books->add($book);
            $book->setVendeur($this);
        }

        return $this;
    }

    public function removeBook(Book $book): static
    {
        if ($this->books->removeElement($book)) {
            // set the owning side to null (unless already changed)
            if ($book->getVendeur() === $this) {
                $book->setVendeur(null);
            }
        }

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(User $user): static
    {
        $this->user = $user;

        return $this;
    }
}