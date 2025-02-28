<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250227105538 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE achat DROP FOREIGN KEY FK_26A9845637D925CB');
        $this->addSql('ALTER TABLE achat DROP FOREIGN KEY FK_26A98456858C065E');
        $this->addSql('ALTER TABLE achat ADD CONSTRAINT FK_26A9845637D925CB FOREIGN KEY (livre_id) REFERENCES book (id)');
        $this->addSql('ALTER TABLE achat ADD CONSTRAINT FK_26A98456858C065E FOREIGN KEY (vendeur_id) REFERENCES vendeur (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE achat DROP FOREIGN KEY FK_26A98456858C065E');
        $this->addSql('ALTER TABLE achat DROP FOREIGN KEY FK_26A9845637D925CB');
        $this->addSql('ALTER TABLE achat ADD CONSTRAINT FK_26A98456858C065E FOREIGN KEY (vendeur_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE achat ADD CONSTRAINT FK_26A9845637D925CB FOREIGN KEY (livre_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
    }
}
