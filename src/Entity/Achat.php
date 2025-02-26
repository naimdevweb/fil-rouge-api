<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\AchatRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AchatRepository::class)]
#[ApiResource]
class Achat
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $achatAt = null;

    #[ORM\ManyToOne(inversedBy: 'livre')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $acheteur = null;

    #[ORM\ManyToOne(inversedBy: 'achats')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $vendeur = null;

    #[ORM\ManyToOne(inversedBy: 'livre_achat')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $livre = null;

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

    public function getVendeur(): ?User
    {
        return $this->vendeur;
    }

    public function setVendeur(?User $vendeur): static
    {
        $this->vendeur = $vendeur;

        return $this;
    }

    public function getLivre(): ?User
    {
        return $this->livre;
    }

    public function setLivre(?User $livre): static
    {
        $this->livre = $livre;

        return $this;
    }
}
