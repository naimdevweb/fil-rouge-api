"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { auth } from "@/services/auth";

export default function AjouterLivrePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    titre: "",
    auteur: "",
    description: "",
    prix: "",
    quantite_stock: "1"
  });
  
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    if (!auth.isAuthenticated()) {
      router.push("/auth/login?redirect=/compte/ajouter-livre");
      return;
    }
    
    // Vérifier si l'utilisateur est vendeur
    const currentUser = auth.getCurrentUser();
    if (!currentUser || !currentUser.roles || !currentUser.roles.includes("ROLE_VENDEUR")) {
      router.push("/compte");
      return;
    }
    
    setUser(currentUser);
  }, [router]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Pour les champs numériques, valider qu'ils contiennent uniquement des chiffres
    if ((name === "prix" || name === "quantite_stock") && value !== "") {
      const regex = type === "number" ? /^\d*\.?\d*$/ : /^\d*$/;
      if (!regex.test(value)) return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Effacer l'erreur associée au champ
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    
    // Effacer le message d'erreur général
    if (apiError) {
      setApiError("");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
        // Vérifier le type de fichier
        if (!file.type.match('image.*')) {
            setErrors(prev => ({ ...prev, image: "Le fichier doit être une image (JPG, PNG, etc.)" }));
            return;
        }
        
        // Vérifier la taille de l'image (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, image: "L'image ne doit pas dépasser 5MB" }));
            return;
        }
        
        // Créer un aperçu de l'image
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result); // Assurez-vous que l'aperçu est défini correctement
        };
        reader.readAsDataURL(file);
        
        setSelectedImage(file);
        
        // Effacer les erreurs d'image précédentes
        if (errors.image) {
            setErrors(prev => ({ ...prev, image: "" }));
        }
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) return null;
    
    setIsUploading(true);
    
    try {
      console.log("Utilisation de l'image en base64");
      
      if (!imagePreview) {
        throw new Error("Erreur lors de la préparation de l'image");
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return imagePreview;
    } catch (error) {
      console.error("Erreur lors de l'upload de l'image:", error);
      throw new Error("Impossible d'uploader l'image. Veuillez réessayer.");
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.titre.trim()) {
      newErrors.titre = "Le titre est obligatoire";
    }
    
    if (!formData.auteur.trim()) {
      newErrors.auteur = "L'auteur est obligatoire";
    }
    
    if (!formData.prix) {
      newErrors.prix = "Le prix est obligatoire";
    } else if (isNaN(parseFloat(formData.prix)) || parseFloat(formData.prix) <= 0) {
      newErrors.prix = "Le prix doit être un nombre positif";
    }
    
    if (!formData.quantite_stock) {
      newErrors.quantite_stock = "La quantité en stock est obligatoire";
    } else if (isNaN(parseInt(formData.quantite_stock)) || parseInt(formData.quantite_stock) < 0) {
      newErrors.quantite_stock = "La quantité doit être un nombre entier positif ou nul";
    }
    
    if (!selectedImage) {
      newErrors.image = "Une image est requise pour le livre";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }
  
  setIsSubmitting(true);
  setApiError("");
  setSuccessMessage("");
  
  try {
    let imageUrl;
    try {
      imageUrl = await uploadImage();
      if (!imageUrl) {
        throw new Error("Veuillez sélectionner une image pour votre livre");
      }
    } catch (error) {
      setApiError(error.message);
      setIsSubmitting(false);
      return;
    }
    
    const vendeurResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}/vendeur`, {
      headers: {
        "Authorization": `Bearer ${auth.getToken()}`,
        "Accept": "application/ld+json"
      }
    });
    
    if (!vendeurResponse.ok) {
      if (vendeurResponse.status === 404) {
        throw new Error("Vous n'avez pas encore de profil vendeur. Veuillez d'abord créer votre profil vendeur.");
      } else if (vendeurResponse.status === 401) {
        throw new Error("Session expirée. Veuillez vous reconnecter.");
      } else {
        throw new Error(`Erreur lors de la récupération des informations vendeur (${vendeurResponse.status})`);
      }
    }
    
    const vendeurData = await vendeurResponse.json();
    console.log("Informations vendeur récupérées:", vendeurData);
    
    if (!vendeurData.id) {
      throw new Error("Profil vendeur incomplet ou invalide.");
    }
    
const livreData = {
  "@context": "/api/contexts/Book",
  "@type": "Book",
  "title": formData.titre,
  "author": formData.auteur,
  "description": formData.description || "",
  "prix": String(formData.prix),
  "image": imageUrl,
  "description_courte": formData.description ? formData.description.substring(0, 100) : "Pas de description courte",
  "description_longue": formData.description || "Pas de description longue",
  "etat": "/api/etats/1",
  "vendeur": `/api/vendeurs/${vendeurData.id}`
};
    
    console.log("Données du livre à envoyer:", livreData);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/ld+json",
        "Accept": "application/ld+json",
        "Authorization": `Bearer ${auth.getToken()}`
      },
      body: JSON.stringify(livreData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur API:", errorText);
      throw new Error("Erreur lors de l'ajout du livre: " + errorText);
    }
    
    const livre = await response.json();
    
    setSuccessMessage(`Le livre "${livre.titre}" a été ajouté avec succès!`);
    
    setFormData({
      titre: "",
      auteur: "",
      description: "",
      prix: "",
      quantite_stock: "1"
    });
    setSelectedImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    window.scrollTo(0, 0);
    
  } catch (error) {
    console.error("Erreur lors de l'ajout du livre:", error);
    setApiError(error.message || "Une erreur s'est produite lors de l'ajout du livre");
    
    if (error.message.includes("Session expirée")) {
      auth.logout();
      setTimeout(() => router.push("/auth/login?redirect=/compte/ajouter-livre"), 1000);
    }
  } finally {
    setIsSubmitting(false);
  }
};


  if (!user) {
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
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Ajouter un livre</h1>
            <Link href="/compte" className="text-blue-600 hover:text-blue-800">
              Retour au compte
            </Link>
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
          
          {apiError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{apiError}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-blue-600 text-white">
              <h2 className="text-xl font-bold">Informations du livre</h2>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations principales */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Informations principales</h3>
                  
                  {/* Titre */}
                  <div>
                    <label htmlFor="titre" className="block text-sm font-medium text-gray-700">
                      Titre <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="titre"
                      name="titre"
                      type="text"
                      value={formData.titre}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        errors.titre ? "border-red-300" : "border-gray-300"
                      } focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                      required
                    />
                    {errors.titre && (
                      <p className="mt-2 text-sm text-red-600">{errors.titre}</p>
                    )}
                  </div>
                  
                  {/* Auteur */}
                  <div>
                    <label htmlFor="auteur" className="block text-sm font-medium text-gray-700">
                      Auteur <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="auteur"
                      name="auteur"
                      type="text"
                      value={formData.auteur}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        errors.auteur ? "border-red-300" : "border-gray-300"
                      } focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                      required
                    />
                    {errors.auteur && (
                      <p className="mt-2 text-sm text-red-600">{errors.auteur}</p>
                    )}
                  </div>
                  
                  {/* Prix */}
                  <div>
                    <label htmlFor="prix" className="block text-sm font-medium text-gray-700">
                      Prix (€) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="prix"
                      name="prix"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.prix}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        errors.prix ? "border-red-300" : "border-gray-300"
                      } focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                      required
                    />
                    {errors.prix && (
                      <p className="mt-2 text-sm text-red-600">{errors.prix}</p>
                    )}
                  </div>
                  
                  {/* Quantité en stock */}
                  <div>
                    <label htmlFor="quantite_stock" className="block text-sm font-medium text-gray-700">
                      Quantité en stock <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="quantite_stock"
                      name="quantite_stock"
                      type="number"
                      min="0"
                      value={formData.quantite_stock}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md shadow-sm ${
                        errors.quantite_stock ? "border-red-300" : "border-gray-300"
                      } focus:border-blue-500 focus:ring-blue-500 sm:text-sm`}
                      required
                    />
                    {errors.quantite_stock && (
                      <p className="mt-2 text-sm text-red-600">{errors.quantite_stock}</p>
                    )}
                  </div>
                </div>
                
                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                
                {/* Champ image simplifié */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Image du livre <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="mt-3">
                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        {imagePreview ? (
                          <div className="mb-3">
                            <img 
                              src={imagePreview} 
                              alt="Aperçu" 
                              className="h-40 mx-auto object-cover rounded-md" 
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedImage(null);
                                setImagePreview("");
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = "";
                                }
                              }}
                              className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Supprimer
                            </button>
                          </div>
                        ) : (
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                        <div className="flex justify-center text-sm text-gray-600">
                          <label
                            htmlFor="image-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Télécharger une image</span>
                            <input
                              id="image-upload"
                              name="image-upload"
                              type="file"
                              ref={fileInputRef}
                              accept="image/*"
                              onChange={handleImageChange}
                              className="sr-only"
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF jusqu'à 5MB
                        </p>
                      </div>
                    </div>
                    {errors.image && (
                      <p className="mt-2 text-sm text-red-600">{errors.image}</p>
                    )}
                  </div>
                </div>
                
                {/* Bouton de soumission */}
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => router.push("/compte")}
                    className="mr-4 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      isSubmitting || isUploading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    {isSubmitting || isUploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isUploading ? "Upload en cours..." : "Ajout en cours..."}
                      </>
                    ) : (
                      "Ajouter le livre"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}