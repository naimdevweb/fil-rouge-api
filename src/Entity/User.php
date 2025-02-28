<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Delete;
use App\DataPersister\UserDataPersister;
use App\DataPersister\UserUpdateDataPersister;
use App\Repository\UserRepository;
use App\State\Provider\MeProvider;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
#[ApiResource(
    operations: [
        new Get(
            uriTemplate: '/me',
            normalizationContext: ['groups' => ['user:read']],
            security: "is_granted('ROLE_USER')",
            provider: MeProvider::class,
            securityMessage: "Vous devez être connecté pour accéder à cette ressource"
        ),
        new Get(
            uriTemplate: '/users/{id}',
            normalizationContext: ['groups' => ['user:restrcited:read']],
            // security: "is_granted('ROLE_USER')",
            // securityMessage: "Vous devez être connecté pour accéder à cette ressource"
        ),
        new Post(
            uriTemplate: '/register',
            denormalizationContext: ['groups' => ['user:write']],
            validationContext: ['groups' => ['Default']],
            security: "is_granted('PUBLIC_ACCESS')",
            processor: UserDataPersister::class
        ),
        new Patch(
            uriTemplate: '/update_me',
            denormalizationContext: ['groups' => ['user:update']],
            normalizationContext: ['groups' => ['user:read']],
            security: "is_granted('ROLE_USER')",
            provider: MeProvider::class,
            processor: UserUpdateDataPersister::class,
            securityMessage: "Vous devez être connecté pour accéder à cette ressource"
        ),
        new Delete(
            uriTemplate: '/users/{id}',
            security: "is_granted('ROLE_USER') and object == user",
            securityMessage: "Vous ne pouvez supprimer que votre propre compte"
        )
    ],
    normalizationContext: ['groups' => ['user:read']],
    denormalizationContext: ['groups' => ['user:write']]
)]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['user:read','user:restrcited:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 180, unique: true)]
    #[Groups(['user:read', 'user:write', 'user:update'])]
    private ?string $email = null;

    #[ORM\Column]
    #[Groups(['user:read'])]
    private array $roles = [];

    #[ORM\Column]
    #[Groups(['user:write', 'user:update'])]
    private ?string $password = null;

    #[ORM\Column(length: 255)]
    #[Groups(['user:read', 'user:write', 'user:update'])]
    private ?string $user_nom = null;

    #[ORM\Column(length: 255)]
    #[Groups(['user:read', 'user:write', 'user:update','user:restrcited:read'])]
    private ?string $user_prenom = null;

    #[ORM\Column(length: 255)]
    #[Groups(['user:read', 'user:write', 'user:update'])]
    private ?string $tel = null;

    #[ORM\OneToOne(mappedBy: 'user', cascade: ['persist', 'remove'])]
    private ?Vendeur $user_vendeur = null;

    #[ORM\OneToMany(targetEntity: Achat::class, mappedBy: 'acheteur', cascade: ['remove'])]
    private Collection $achats;

    public function __construct()
    {
        $this->roles = ['ROLE_USER'];
        $this->achats = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    public function getRoles(): array
    {
        return $this->roles;
    }

    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    public function eraseCredentials(): void
    {
    }

    public function getUserNom(): ?string
    {
        return $this->user_nom;
    }

    public function setUserNom(string $user_nom): static
    {
        $this->user_nom = $user_nom;

        return $this;
    }

    public function getUserPrenom(): ?string
    {
        return $this->user_prenom;
    }

    public function setUserPrenom(string $user_prenom): static
    {
        $this->user_prenom = $user_prenom;

        return $this;
    }

    public function getTel(): ?string
    {
        return $this->tel;
    }

    public function setTel(string $tel): static
    {
        $this->tel = $tel;

        return $this;
    }

    public function getUserVendeur(): ?Vendeur
    {
        return $this->user_vendeur;
    }

    public function setUserVendeur(Vendeur $user_vendeur): static
    {
        if ($user_vendeur->getUser() !== $this) {
            $user_vendeur->setUser($this);
        }

        $this->user_vendeur = $user_vendeur;

        return $this;
    }

    /**
     * @return Collection|Achat[]
     */
    public function getAchats(): Collection
    {
        return $this->achats;
    }

    public function addAchat(Achat $achat): self
    {
        if (!$this->achats->contains($achat)) {
            $this->achats[] = $achat;
            $achat->setAcheteur($this);
        }

        return $this;
    }

    public function removeAchat(Achat $achat): self
    {
        if ($this->achats->removeElement($achat)) {
            // set the owning side to null (unless already changed)
            if ($achat->getAcheteur() === $this) {
                $achat->setAcheteur(null);
            }
        }

        return $this;
    }
}