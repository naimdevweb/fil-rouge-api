"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { auth } from "@/services/auth";

export default function DevenirVendeurPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVendeur, setIsVendeur] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nom_entreprise: "",
    adresse_entreprise: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    if (!auth.isAuthenticated()) {
      router.push("/auth/login?redirect=/compte/devenir-vendeur");
      return;
    }

    const currentUser = auth.getCurrentUser();
    setUser(currentUser);

    // Vérifier si l'utilisateur a déjà un compte vendeur
    if (currentUser && currentUser.roles && currentUser.roles.includes("ROLE_VENDEUR")) {
      setIsVendeur(true);
    } else {
      // Pré-remplir le formulaire avec le prénom si disponible
      if (currentUser && currentUser.user_prenom) {
        setFormData(prev => ({
          ...prev,
          nom_entreprise: `Librairie de ${currentUser.user_prenom}`
        }));
      }
    }
    
    setLoading(false);
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nom_entreprise || !formData.adresse_entreprise) {
      setError("Tous les champs sont obligatoires");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendeurs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${auth.getToken()}`
        },
        body: JSON.stringify({
          user: `/api/users/${user.id}`,
          nom_entreprise: formData.nom_entreprise,
          adresse_entreprise: formData.adresse_entreprise
        })
      });
      
      if (!response.ok) {
        throw new Error("Impossible de créer votre compte vendeur. Veuillez réessayer.");
      }
      
      // Mettre à jour les rôles de l'utilisateur en local
      if (user && !user.roles.includes("ROLE_VENDEUR")) {
        user.roles.push("ROLE_VENDEUR");
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      // Rediriger vers la page compte avec un message de succès
      router.push("/compte?vendeur=success");
      
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      setError(error.message || "Une erreur s'est produite");
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">Devenir vendeur</h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p>{error}</p>
            </div>
          )}
          
          {isVendeur ? (
            // Afficher un message si l'utilisateur est déjà vendeur
            <div className="text-center py-8">
              <div className="flex items-center justify-center mb-4 text-green-600">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-medium mb-4">Vous avez déjà un compte vendeur</h2>
              <p className="text-gray-600 mb-6">
                Vous pouvez dès maintenant vendre vos livres sur notre plateforme.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link 
                  href="/compte/mes-livres" 
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  Gérer mes livres
                </Link>
                <Link 
                  href="/profile/page.js" 
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Retour à mon compte
                </Link>
              </div>
            </div>
          ) : (
            // Afficher le formulaire pour devenir vendeur
            <>
              <p className="mb-6 text-gray-600">
                Pour vendre vos livres sur notre plateforme, veuillez créer un compte vendeur en remplissant les informations ci-dessous.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="nom_entreprise" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de votre librairie ou entreprise *
                  </label>
                  <input
                    type="text"
                    id="nom_entreprise"
                    name="nom_entreprise"
                    value={formData.nom_entreprise}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="adresse_entreprise" className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse *
                  </label>
                  <textarea
                    id="adresse_entreprise"
                    name="adresse_entreprise"
                    value={formData.adresse_entreprise}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  ></textarea>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <Link href="/compte" className="text-blue-600 hover:text-blue-800">
                    Retour au compte
                  </Link>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isSubmitting ? "Création en cours..." : "Créer mon compte vendeur"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}