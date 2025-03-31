"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { auth } from "@/services/auth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registrationSuccess = searchParams.get("registered") === "success";
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  useEffect(() => {
    if (registrationSuccess) {
      setSuccessMessage("Inscription réussie ! Vous pouvez maintenant vous connecter.");
    }
  }, [registrationSuccess]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Le mot de passe est obligatoire";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fonction d'aide pour afficher des détails sur les réponses
  const logResponse = async (response, label) => {
    console.log(`=== ${label || "Response"} ===`);
    console.log("Status:", response.status);
    console.log("Headers:", Object.fromEntries(response.headers.entries()));
    
    const clonedResponse = response.clone();
    try {
      const text = await clonedResponse.text();
      console.log("Body (text):", text);
      try {
        const json = JSON.parse(text);
        console.log("Body (parsed JSON):", json);
      } catch (e) {
        console.log("Not valid JSON");
      }
    } catch (e) {
      console.log("Could not read body:", e);
    }
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
      // Débogage - Afficher les données envoyées
      const loginData = {
        email: formData.email,
        password: formData.password,
        // Ajoutez également username comme fallback
        username: formData.email
      };
      console.log("Données de connexion envoyées:", loginData);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login_check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
      });
      
      // Déboguer la réponse complète
      await logResponse(response, "Login Response");
      
      // Vérifiez d'abord si la réponse est ok
      if (!response.ok) {
        // Essayez de récupérer un message d'erreur JSON si disponible
        let errorMessage = "Identifiants invalides";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.detail || errorMessage;
        } catch (jsonError) {
          // Si le parsing JSON échoue, utilisez le statut HTTP
          errorMessage = `Erreur ${response.status}: ${response.statusText || errorMessage}`;
        }
        throw new Error(errorMessage);
      }
      
      // Récupérer le contenu de la réponse
      const contentType = response.headers.get("content-type");
      let data;
      
      if (contentType && (contentType.includes("application/json") || contentType.includes("application/ld+json"))) {
        data = await response.json();
      } else {
        // Si ce n'est pas du JSON, récupérez le texte et voyez si c'est utilisable
        const text = await response.text();
        console.log("Réponse texte:", text);
        
        try {
          // Essayez de parser manuellement
          data = JSON.parse(text);
        } catch (e) {
          throw new Error("La réponse du serveur n'est pas au format JSON valide");
        }
      }
      
      console.log("Données de connexion:", data);
      
      // Vérifiez si le token existe
      if (!data.token) {
        throw new Error("Le token d'authentification est manquant dans la réponse");
      }
      
      // Store the token in localStorage
      localStorage.setItem("token", data.token);
      
      // Mettre à jour le service d'authentification
      auth.setUserAndToken(null, data.token);
      
      // Get user info
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
        headers: {
          "Authorization": `Bearer ${data.token}`
        }
      });
      
      await logResponse(userResponse, "User Info Response");
      
      if (!userResponse.ok) {
        throw new Error("Erreur lors de la récupération des informations utilisateur");
      }
          
      const userData = await userResponse.json();
      console.log("Données utilisateur:", userData);
      
      // Stocker les informations utilisateur
      localStorage.setItem("user", JSON.stringify(userData));
      auth.setUserAndToken(userData, data.token);
      
      // Redirect after successful login
      router.push("/");
      
    } catch (error) {
      console.error("Login error:", error);
      setApiError(error.message || "Une erreur s'est produite lors de la connexion");
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
              Connexion à votre compte
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Ou{" "}
              <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
                créez un nouveau compte
              </Link>
            </p>
          </div>
          
          {successMessage && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
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
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
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
                  autoComplete="current-password"
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
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Se souvenir de moi
                </label>
              </div>
              
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Mot de passe oublié ?
                </a>
              </div>
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
                    Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
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