"use client";

import { useState, useEffect } from "react";
import { api } from "@/services/api";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await api.getCategories();
        console.log("Données de catégories reçues:", data);
        
        // Vérifier la structure de la réponse
        if (data && data["hydra:member"]) {
          setCategories(data["hydra:member"]);
        } else if (data && data.member) {
          setCategories(data.member);
        } else if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.log("Format de réponse non reconnu:", data);
          setCategories([]);
        }
        
        setError(null);
      } catch (err) {
        setError("Impossible de charger les catégories");
        console.error("Erreur détaillée:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex justify-center items-center flex-grow">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Chargement des catégories...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-col items-center justify-center py-16 px-4 flex-grow">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-red-800">Erreur</h3>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <button 
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-200 flex items-center justify-center"
              onClick={() => window.location.reload()}
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Réessayer
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* En-tête */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-2">Catégories de Livres</h1>
            <p className="text-indigo-100 text-lg max-w-2xl mx-auto">
              Parcourez notre collection par catégorie pour trouver facilement les livres qui vous intéressent.
            </p>
          </div>
        </section>
        
        {/* Liste des catégories */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {categories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map((category) => (
                  <Link 
                    key={category.id}
                    href={`/livres?categoryId=${category.id}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 transition-transform duration-300"
                  >
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-gray-800 mb-3">{category.name}</h2>
                      {category.description && (
                        <p className="text-gray-600 mb-4">{category.description}</p>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-indigo-600 font-medium">
                          Voir les livres
                        </span>
                        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h2 className="text-2xl font-bold text-gray-700 mb-2">Aucune catégorie disponible</h2>
                <p className="text-gray-500 max-w-md">
                  Nous n'avons pas trouvé de catégories dans notre base de données pour le moment.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}