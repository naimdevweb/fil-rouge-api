"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { auth } from "@/services/auth";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [vendeur, setVendeur] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    user_nom: "",
    user_prenom: "",
    email: "",
    // Ajouter d'autres champs si nécessaire
  });

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    if (!auth.isAuthenticated()) {
      router.push("/auth/login?redirect=/profile");
      return;
    }

    // Récupérer les données utilisateur
    const currentUser = auth.getCurrentUser();
    setUser(currentUser);
    
    // Initialiser les données du formulaire
    setFormData({
      user_nom: currentUser?.user_nom || "",
      user_prenom: currentUser?.user_prenom || "",
      email: currentUser?.email || "",
      // Initialisez d'autres champs si nécessaire
    });

    // Charger les informations du vendeur si l'utilisateur est vendeur
    if (currentUser?.roles?.includes("ROLE_VENDEUR")) {
      fetchVendeurInfo(currentUser.id);
    } else {
      setLoading(false);
    }
  }, [router]);

  // Fonction de récupération des informations vendeur
  const fetchVendeurInfo = async (userId) => {
    try {
      console.log("Récupération des informations vendeur pour l'utilisateur ID:", userId);
      
      const token = auth.getToken();
      if (!token) {
        setError("Session expirée. Veuillez vous reconnecter.");
        auth.logout();
        router.push("/auth/login?redirect=/profile");
        return;
      }
      
      // Utiliser la route correcte
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/vendeur`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/ld+json"
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log("Aucun vendeur trouvé pour cet utilisateur");
          // Note: On ne doit pas définir d'erreur ici, car c'est ok si l'utilisateur n'a pas de vendeur
          setLoading(false);
          return;
        } else if (response.status === 401) {
          setError("Session expirée. Veuillez vous reconnecter.");
          auth.logout();
          setTimeout(() => router.push("/auth/login?redirect=/profile"), 1000);
          return;
        } else {
          throw new Error(`Erreur lors de la récupération des informations vendeur (${response.status})`);
        }
      }
      
      const vendeurData = await response.json();
      console.log("Informations vendeur récupérées:", vendeurData);
      setVendeur(vendeurData);
    } catch (error) {
      console.error("Erreur fetchVendeurInfo:", error);
      setError("Impossible de charger les informations du vendeur: " + error.message);
    } finally {
      // Très important: mettre fin au chargement dans tous les cas!
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    // Ajouter la logique de mise à jour du profil si nécessaire
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Mon profil</h1>
          
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
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-blue-600 text-white">
              <h2 className="text-xl font-bold">Informations personnelles</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 mb-1">Nom complet:</p>
                  <p className="font-medium">{user?.user_nom} {user?.user_prenom}</p>
                </div>
                
                <div>
                  <p className="text-gray-600 mb-1">Email:</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                
                <div>
                  <p className="text-gray-600 mb-1">Rôle:</p>
                  <p className="font-medium">
                    {user?.roles?.includes("ROLE_ADMIN") 
                      ? "Administrateur" 
                      : user?.roles?.includes("ROLE_VENDEUR") 
                      ? "Vendeur" 
                      : "Client"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Section Vendeur */}
          {user?.roles?.includes("ROLE_VENDEUR") ? (
            <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-blue-600 text-white">
                <h2 className="text-xl font-bold">Espace vendeur</h2>
              </div>
              
              <div className="p-6">
                {vendeur ? (
                  <div className="mb-6">
                    <p className="text-gray-600 mb-1">Nom de l'entreprise:</p>
                    <p className="font-medium">{vendeur.nom_entreprise}</p>
                    
                    <p className="text-gray-600 mt-4 mb-1">Adresse:</p>
                    <p className="font-medium">{vendeur.adresse_entreprise}</p>
                  </div>
                ) : (
                  <p className="text-yellow-600 mb-4">
                    Vous avez le rôle vendeur mais aucun profil vendeur n'a été trouvé. Veuillez contacter l'administrateur.
                  </p>
                )}
                
                <div className="flex flex-col gap-4">
                  <Link 
                    href="/compte/mes-livres" 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Gérer mes livres
                  </Link>
                  
                  <Link 
                    href="/compte/ajouter-livre" 
                    className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Ajouter un nouveau livre
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-blue-600 text-white">
                <h2 className="text-xl font-bold">Devenir vendeur</h2>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 mb-4">
                  Vous souhaitez vendre vos livres sur notre plateforme ? Devenez vendeur dès maintenant !
                </p>
                
                <Link 
                  href="/compte/devenir-vendeur" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Devenir vendeur
                </Link>
              </div>
            </div>
          )}
          
          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Modifier mon profil
            </button>
            
            <button
              onClick={() => {
                auth.logout();
                router.push("/");
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}