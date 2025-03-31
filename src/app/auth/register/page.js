"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    user_nom: "",
    user_prenom: "",
    tel: "",
    isVendeur: false,
    nom_entreprise: "",
    adresse_entreprise: ""
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    // Clear errors when field is changed
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = "L'email est obligatoire";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Le mot de passe est obligatoire";
    } else if (!/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(formData.password)) {
      newErrors.password = "Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial";
    }
    
    // Name validation
    if (!formData.user_nom) {
      newErrors.user_nom = "Le nom est obligatoire";
    }
    
    // First name validation
    if (!formData.user_prenom) {
      newErrors.user_prenom = "Le prénom est obligatoire";
    }
    
    // Phone validation
    if (!formData.tel) {
      newErrors.tel = "Le téléphone est obligatoire";
    } else if (!/^\+?[0-9]*$/.test(formData.tel)) {
      newErrors.tel = "Numéro de téléphone invalide";
    }
    
    // Vendeur fields validation
    if (formData.isVendeur) {
      if (!formData.nom_entreprise) {
        newErrors.nom_entreprise = "Le nom de l'entreprise est obligatoire";
      }
      
      if (!formData.adresse_entreprise) {
        newErrors.adresse_entreprise = "L'adresse de l'entreprise est obligatoire";
      }
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
    
    try {
      // Prepare data for API
      const userData = {
        email: formData.email,
        password: formData.password,
        user_nom: formData.user_nom,
        user_prenom: formData.user_prenom,
        tel: formData.tel
      };
      
      // Register user
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/ld+json"  // Changé de application/json
        },
        body: JSON.stringify(userData)
      });
      
      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        throw new Error(errorData.detail || "Erreur lors de l'inscription");
      }
      
      const user = await userResponse.json();
      
      // If registering as vendeur, create vendeur account
      if (formData.isVendeur) {
        const vendeurData = {
          nom_entreprise: formData.nom_entreprise,
          adresse_entreprise: formData.adresse_entreprise,
          user: `/api/users/${user.id}`
        };
        
        const vendeurResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendeurs`, {
            method: "POST",
            headers: {
              "Content-Type": "application/ld+json"  // Changé de application/json
            },
            body: JSON.stringify(vendeurData)
          });
        
        if (!vendeurResponse.ok) {
          const errorData = await vendeurResponse.json();
          throw new Error(errorData.detail || "Erreur lors de la création du compte vendeur");
        }
      }
      
      // Registration successful
      router.push("/auth/login?registered=success");
      
    } catch (error) {
      console.error("Registration error:", error);
      setApiError(error.message || "Une erreur s'est produite lors de l'inscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Créer un compte
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Ou{" "}
              <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                connectez-vous si vous avez déjà un compte
              </Link>
            </p>
          </div>
          
          {apiError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
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
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 appearance-none block w-full px-3 py-2 border ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="votre@email.com"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`mt-1 appearance-none block w-full px-3 py-2 border ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
              
              {/* Nom */}
              <div>
                <label htmlFor="user_nom" className="block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <input
                  id="user_nom"
                  name="user_nom"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.user_nom}
                  onChange={handleChange}
                  className={`mt-1 appearance-none block w-full px-3 py-2 border ${
                    errors.user_nom ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
                {errors.user_nom && (
                  <p className="mt-2 text-sm text-red-600">{errors.user_nom}</p>
                )}
              </div>
              
              {/* Prénom */}
              <div>
                <label htmlFor="user_prenom" className="block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <input
                  id="user_prenom"
                  name="user_prenom"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.user_prenom}
                  onChange={handleChange}
                  className={`mt-1 appearance-none block w-full px-3 py-2 border ${
                    errors.user_prenom ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
                {errors.user_prenom && (
                  <p className="mt-2 text-sm text-red-600">{errors.user_prenom}</p>
                )}
              </div>
              
              {/* Téléphone */}
              <div>
                <label htmlFor="tel" className="block text-sm font-medium text-gray-700">
                  Téléphone
                </label>
                <input
                  id="tel"
                  name="tel"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={formData.tel}
                  onChange={handleChange}
                  className={`mt-1 appearance-none block w-full px-3 py-2 border ${
                    errors.tel ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  placeholder="+33612345678"
                />
                {errors.tel && (
                  <p className="mt-2 text-sm text-red-600">{errors.tel}</p>
                )}
              </div>
              
              {/* Devenir Vendeur */}
              <div className="flex items-center">
                <input
                  id="isVendeur"
                  name="isVendeur"
                  type="checkbox"
                  checked={formData.isVendeur}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isVendeur" className="ml-2 block text-sm text-gray-900">
                  Je souhaite également devenir vendeur
                </label>
              </div>
              
              {/* Champs vendeur conditionnels */}
              {formData.isVendeur && (
                <div className="space-y-4 mt-4 p-4 bg-blue-50 rounded-md">
                  <h3 className="font-medium text-blue-800">Informations vendeur</h3>
                  
                  {/* Nom entreprise */}
                  <div>
                    <label htmlFor="nom_entreprise" className="block text-sm font-medium text-gray-700">
                      Nom de l'entreprise
                    </label>
                    <input
                      id="nom_entreprise"
                      name="nom_entreprise"
                      type="text"
                      value={formData.nom_entreprise}
                      onChange={handleChange}
                      className={`mt-1 appearance-none block w-full px-3 py-2 border ${
                        errors.nom_entreprise ? "border-red-300" : "border-gray-300"
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    />
                    {errors.nom_entreprise && (
                      <p className="mt-2 text-sm text-red-600">{errors.nom_entreprise}</p>
                    )}
                  </div>
                  
                  {/* Adresse entreprise */}
                  <div>
                    <label htmlFor="adresse_entreprise" className="block text-sm font-medium text-gray-700">
                      Adresse de l'entreprise
                    </label>
                    <input
                      id="adresse_entreprise"
                      name="adresse_entreprise"
                      type="text"
                      value={formData.adresse_entreprise}
                      onChange={handleChange}
                      className={`mt-1 appearance-none block w-full px-3 py-2 border ${
                        errors.adresse_entreprise ? "border-red-300" : "border-gray-300"
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                    />
                    {errors.adresse_entreprise && (
                      <p className="mt-2 text-sm text-red-600">{errors.adresse_entreprise}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                  isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Inscription en cours...
                  </>
                ) : (
                  "S'inscrire"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}