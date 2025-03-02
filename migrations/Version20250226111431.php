<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250226111431 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE vendeur ADD user_id INT NOT NULL');
        $this->addSql('ALTER TABLE vendeur ADD CONSTRAINT FK_7AF49996A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_7AF49996A76ED395 ON vendeur (user_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE vendeur DROP FOREIGN KEY FK_7AF49996A76ED395');
        $this->addSql('DROP INDEX UNIQ_7AF49996A76ED395 ON vendeur');
        $this->addSql('ALTER TABLE vendeur DROP user_id');
    }
}
