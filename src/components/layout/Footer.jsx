export default function Footer() {
    return (
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">BookMarket</h3>
              <p className="text-gray-300">
                Votre bibliothèque en ligne pour découvrir, acheter et gérer vos livres préférés.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Liens utiles</h3>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-300 hover:text-white">Accueil</a></li>
                <li><a href="/livres" className="text-gray-300 hover:text-white">Tous les livres</a></li>
                <li><a href="/categories" className="text-gray-300 hover:text-white">Catégories</a></li>
                <li><a href="/auth/register" className="text-gray-300 hover:text-white">Devenir vendeur</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <p className="text-gray-300">
                Vous avez des questions ? N'hésitez pas à nous contacter.
              </p>
              <div className="mt-4">
                <a href="mailto:contact@bookmarket.fr" className="text-blue-400 hover:text-blue-300">
                  contact@bookmarket.fr
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} BookMarket. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    );
  }