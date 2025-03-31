"use client";

import { useState, useEffect } from "react";
import { api } from "@/services/api";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        
        if (categoryId) {
          // Si un ID de catégorie est fourni, récupérons tous les livres et filtrons ensuite
          const allBooks = await api.getBooks();
          
          // Structure de données possibles
          let booksData;
          if (allBooks && allBooks["hydra:member"]) {
            booksData = allBooks["hydra:member"];
          } else if (allBooks && allBooks.member) {
            booksData = allBooks.member;
          } else if (Array.isArray(allBooks)) {
            booksData = allBooks;
          } else {
            booksData = [];
          }
          
          // Filtrer les livres par catégorie
          const filteredBooks = booksData.filter(book => {
            // Vérifier si le livre appartient à la catégorie spécifiée
            if (book.categories) {
              return book.categories.some(cat => {
                // Si cat est un objet avec un ID
                if (cat.id) {
                  return cat.id.toString() === categoryId.toString();
                }
                // Si cat est une chaîne IRI (ex: /api/categories/1)
                else if (typeof cat === 'string') {
                  return cat.endsWith(`/${categoryId}`);
                }
                return false;
              });
            }
            return false;
          });
          
          console.log(`Filtrage côté client: ${filteredBooks.length} livres dans la catégorie ${categoryId}`);
          setBooks(filteredBooks);
          
          // Récupérer aussi les détails de la catégorie
          try {
            const categoryData = await api.getCategory(categoryId);
            setCategoryName(categoryData.name || "");
          } catch (error) {
            console.error("Erreur lors de la récupération des détails de la catégorie:", error);
            setCategoryName(`Catégorie #${categoryId}`);
          }
        } else {
          // Si aucun categoryId, récupérer tous les livres
          const data = await api.getBooks();
          
          if (data && data["hydra:member"]) {
            setBooks(data["hydra:member"]);
          } else if (data && data.member) {
            setBooks(data.member);
          } else if (Array.isArray(data)) {
            setBooks(data);
          } else {
            setBooks([]);
          }
          
          setCategoryName("");
        }
        
        setError(null);
      } catch (err) {
        setError("Impossible de charger les livres");
        console.error("Erreur détaillée:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchBooks();
  }, [categoryId]);
  // Le reste de votre code pour l'affichage reste identique, avec quelques ajustements

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <div className="bg-gray-50 min-h-screen pb-12">
          {/* En-tête avec titre dynamique en fonction de la catégorie */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 mb-10">
            <div className="container mx-auto px-4">
              <h1 className="text-4xl font-bold mb-2">
                {categoryName ? `Livres de la catégorie "${categoryName}"` : "Notre collection de livres"}
              </h1>
              <p className="text-blue-100 text-lg max-w-2xl">
                {categoryName 
                  ? `Découvrez notre sélection de livres dans la catégorie ${categoryName}.`
                  : "Découvrez notre sélection de livres de qualité, disponibles à l'achat et à la revente."
                }
              </p>
              {categoryName && (
                <Link 
                  href="/categories"
                  className="inline-block mt-4 px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                >
                  ⬅️ Retour aux catégories
                </Link>
              )}
            </div>
          </div>
          
          <div className="container mx-auto px-4">
            {/* Barre de recherche (peut être implémentée plus tard) */}
            <div className="mb-8 max-w-md mx-auto">
              <div className="relative flex items-center w-full h-12 rounded-lg shadow-md bg-white overflow-hidden">
                <div className="grid place-items-center h-full w-12 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  className="h-full w-full outline-none text-gray-700 pr-2 bg-white"
                  type="text"
                  placeholder="Rechercher un livre..."
                />
              </div>
            </div>
            
            {/* Affichage des livres */}
            {loading ? (
              <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-gray-600">Chargement des livres...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
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
            ) : books.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {books.map((book) => (
                  <div key={book.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={book.image}
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute top-0 right-0 m-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                          {typeof book.etat === 'string' ? 'Disponible' : book.etat?.nom || "État inconnu"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <h2 className="text-xl font-bold text-gray-800 mb-1 line-clamp-1">{book.title}</h2>
                      <p className="text-gray-600 italic mb-3">par {book.author}</p>
                      
                      {/* Catégories */}
                      {book.categories && book.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {book.categories.map((cat, index) => (
                            <span key={cat.id || index} className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{book.description_courte}</p>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-blue-600">{(book.prix / 100).toFixed(2)} €</span>
                        <Link 
                          href={`/livres/${book.id}`}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        >
                          Voir détails
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h2 className="text-2xl font-bold text-gray-700 mb-2">
                  {categoryName ? `Aucun livre dans la catégorie "${categoryName}"` : "Aucun livre disponible"}
                </h2>
                <p className="text-gray-500 max-w-md">
                  {categoryName 
                    ? "Nous n'avons pas trouvé de livres dans cette catégorie pour le moment."
                    : "Nous n'avons pas trouvé de livres dans notre collection pour le moment."
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}