<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\Repository\AchatRepository;
use App\State\Provider\MeProvider;
use App\State\Provider\AchatProvider;
use App\State\Provider\AchatVendeurProvider;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: AchatRepository::class)]
#[ApiResource(
   
    operations: [
        new GetCollection(
            uriTemplate: '/mes-achats',
            normalizationContext: ['groups' => ['achat:read']],
            security: "is_granted('ROLE_USER')",
            provider: AchatProvider::class
        ),
        new GetCollection(
            uriTemplate: '/mes-ventes',
            normalizationContext: ['groups' => ['achat:read']],
            security: "is_granted('ROLE_VENDEUR')",
            provider: AchatVendeurProvider::class
        ),
        new Post(
            denormalizationContext: ['groups' => ['achat:write']],
            security: "is_granted('ROLE_USER')"
        )
    ]
)]
class Achat
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    // #[Groups(['achat:read'])]
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['achat:read', 'achat:write'])]
    private ?\DateTimeImmutable $achatAt = null;

    #[ORM\ManyToOne(inversedBy: 'livre', cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['achat:read', 'achat:write'])]
    private ?User $acheteur = null;

    #[ORM\ManyToOne(inversedBy: 'achats',cascade: ['persist'])]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['achat:read', 'achat:write'])]
    private ?Vendeur $vendeur = null;

    #[ORM\ManyToOne(inversedBy: 'livre_achat')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['achat:read', 'achat:write'])]
    private ?Book $livre = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAchatAt(): ?\DateTimeImmutable
    {
        return $this->achatAt;
    }

    public function setAchatAt(\DateTimeImmutable $achatAt): static
    {
        $this->achatAt = $achatAt;

        return $this;
    }

    public function getAcheteur(): ?User
    {
        return $this->acheteur;
    }

    public function setAcheteur(?User $acheteur): static
    {
        $this->acheteur = $acheteur;

        return $this;
    }

    public function getVendeur(): ?Vendeur
    {
        return $this->vendeur;
    }

    public function setVendeur(?Vendeur $vendeur): static
    {
        $this->vendeur = $vendeur;

        return $this;
    }

    public function getLivre(): ?Book
    {
        return $this->livre;
    }

    public function setLivre(?Book $livre): static
    {
        $this->livre = $livre;

        return $this;
    }
}