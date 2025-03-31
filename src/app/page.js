import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-blue-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Bienvenue sur BookMarket
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Découvrez notre collection de livres de qualité, achetez
              facilement et revendez vos propres ouvrages.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/livres"
                className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100"
              >
                Parcourir les livres
              </Link>
              <Link
                href="/compte/devenir-vendeur"
                className="px-6 py-3 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800"
              >
                Devenir vendeur
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Pourquoi choisir BookMarket
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="text-blue-600 text-4xl mb-4">📚</div>
                <h3 className="text-xl font-bold mb-2">Grande sélection</h3>
                <p className="text-gray-600">
                  Des milliers de livres dans toutes les catégories, des
                  classiques aux nouveautés.
                </p>
              </div>

              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="text-blue-600 text-4xl mb-4">💰</div>
                <h3 className="text-xl font-bold mb-2">Vendez vos livres</h3>
                <p className="text-gray-600">
                  Devenez vendeur et proposez vos propres livres sur notre
                  plateforme.
                </p>
              </div>

              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="text-blue-600 text-4xl mb-4">🔒</div>
                <h3 className="text-xl font-bold mb-2">Sécurité garantie</h3>
                <p className="text-gray-600">
                  Transactions sécurisées et protection des données
                  personnelles.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
