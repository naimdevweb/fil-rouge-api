"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { auth } from "@/services/auth";

export default function MesLivresPage() {
  const router = useRouter();
  const [livres, setLivres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [vendeurId, setVendeurId] = useState(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté et a le rôle vendeur
    if (!auth.isAuthenticated()) {
      router.push("/auth/login?redirect=/compte/mes-livres");
      return;
    }
    
    const currentUser = auth.getCurrentUser();
    if (!currentUser || !currentUser.roles || !currentUser.roles.includes("ROLE_VENDEUR")) {
      router.push("/compte");
      return;
    }
    
    // Récupérer les infos du vendeur et ses livres
    getVendeurEtLivres(currentUser.id);
  }, [router]);

  // Fonction simplifiée pour récupérer le vendeur et ses livres
  const getVendeurEtLivres = async (userId) => {
    try {
      setLoading(true);
      
      // 1. Récupérer les informations de l'utilisateur
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
        headers: {
          "Authorization": `Bearer ${auth.getToken()}`
        }
      });
      
      if (!userResponse.ok) {
        throw new Error("Erreur lors de la récupération des informations utilisateur");
      }
      
      const userData = await userResponse.json();
      console.log("Données utilisateur:", userData);
      
      // 2. Créer un vendeur si l'utilisateur n'en a pas
      if (!userData.vendeur) {
        try {
          const createResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendeurs`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${auth.getToken()}`
            },
            body: JSON.stringify({
              user: `/api/users/${userId}`,
              nom_entreprise: `Librairie de ${userData.user_prenom || 'Vendeur'}`,
              adresse_entreprise: "Adresse par défaut"
            })
          });
          
          if (!createResponse.ok) {
            const errorData = await createResponse.text();
            console.error("Erreur lors de la création du vendeur:", errorData);
            throw new Error("Impossible de créer votre compte vendeur");
          }
          
          const vendeurData = await createResponse.json();
          setVendeurId(vendeurData.id);
          
          // Aucun livre à ce stade car le vendeur vient d'être créé
          setLivres([]);
          setLoading(false);
          return;
        } catch (error) {
          console.error("Erreur durant la création du vendeur:", error);
          throw new Error("Impossible de créer un compte vendeur");
        }
      }
      
      // 3. Récupérer l'ID du vendeur existant
      let vendeurId;
      if (typeof userData.vendeur === 'string' && userData.vendeur.includes('/api/vendeurs/')) {
        vendeurId = userData.vendeur.split('/').pop();
      } else if (typeof userData.vendeur === 'object' && userData.vendeur.id) {
        vendeurId = userData.vendeur.id;
      }
      
      if (!vendeurId) {
        throw new Error("Information vendeur incorrecte. Contactez le support.");
      }
      
      setVendeurId(vendeurId);
      
      // 4. Récupérer les livres du vendeur
      const livresResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/livres?vendeur.id=${vendeurId}`, {
        headers: {
          "Authorization": `Bearer ${auth.getToken()}`
        }
      });
      
      if (!livresResponse.ok) {
        throw new Error("Impossible de récupérer vos livres");
      }
      
      const livresData = await livresResponse.json();
      setLivres(livresData["hydra:member"] || []);
      
    } catch (error) {
      console.error("Erreur:", error);
      setError(error.message || "Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLivre = async (livreId, livreTitle) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le livre "${livreTitle}" ?`)) {
      return;
    }
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/livres/${livreId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${auth.getToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error("Impossible de supprimer ce livre");
      }
      
      // Mettre à jour la liste des livres
      setLivres(prevLivres => prevLivres.filter(livre => livre.id !== livreId));
      setSuccessMessage(`Le livre "${livreTitle}" a été supprimé avec succès`);
      
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      
    } catch (error) {
      setError(error.message || "Une erreur s'est produite lors de la suppression du livre");
      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64 flex-col">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Chargement de vos livres...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Mes livres</h1>
            <div className="flex space-x-4">
              <Link href="/compte/ajouter-livre" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Ajouter un livre
              </Link>
              <Link href="/compte" className="text-blue-600 hover:text-blue-800">
                Retour au compte
              </Link>
            </div>
          </div>
          
          {successMessage && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                  <div className="mt-2">
                    <button
                      onClick={() => window.location.reload()}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Réessayer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {livres.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <p className="text-gray-500 mb-4">Vous n'avez pas encore ajouté de livres.</p>
              <Link 
                href="/compte/ajouter-livre"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Ajouter mon premier livre
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Livre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ajouté le
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {livres.map((livre) => (
                    <tr key={livre.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {livre.couverture ? (
                            <div className="flex-shrink-0 h-10 w-10">
                              <img 
                                className="h-10 w-10 object-cover" 
                                src={livre.couverture} 
                                alt={livre.titre} 
                                onError={(e) => { e.target.src = "/images/placeholder-book.png"; }}
                              />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-xs">No img</span>
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {livre.titre}
                            </div>
                            <div className="text-sm text-gray-500">
                              {livre.auteur}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{livre.prix.toFixed(2)} €</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          livre.quantite_stock > 5 
                            ? "bg-green-100 text-green-800" 
                            : livre.quantite_stock > 0 
                            ? "bg-yellow-100 text-yellow-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {livre.quantite_stock > 0 ? livre.quantite_stock : "Épuisé"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(livre.date_creation).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                          href={`/compte/modifier-livre/${livre.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Modifier
                        </Link>
                        <button
                          onClick={() => handleDeleteLivre(livre.id, livre.titre)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}