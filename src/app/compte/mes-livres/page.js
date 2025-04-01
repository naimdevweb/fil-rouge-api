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
    if (!auth.isAuthenticated()) {
      router.push("/auth/login?redirect=/compte/mes-livres");
      return;
    }

    const currentUser = auth.getCurrentUser();
    if (
      !currentUser ||
      !currentUser.roles ||
      !currentUser.roles.includes("ROLE_VENDEUR")
    ) {
      router.push("/compte");
      return;
    }

    getVendeurEtLivres(currentUser.id);
  }, [router]);

  const generateFallbackSvg = () => {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='150' viewBox='0 0 100 150'%3E%3Crect width='100' height='150' fill='%23f0f0f0'/%3E%3Crect x='25' y='35' width='50' height='80' fill='%23e0e0e0' stroke='%23a0a0a0' stroke-width='2'/%3E%3Cpath d='M35 75H65M35 85H55' stroke='%23a0a0a0' stroke-width='2'/%3E%3Ccircle cx='50' cy='55' r='10' fill='%23d0d0d0'/%3E%3Ctext x='50' y='135' font-family='Arial' font-size='10' text-anchor='middle' fill='%23909090'%3EImage indisponible%3C/text%3E%3C/svg%3E`;
  };

  const isValidBase64Image = (str) => {
    return (
      typeof str === "string" &&
      str.startsWith("data:image") &&
      str.includes("base64,")
    );
  };

  const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
      if (!src || src === generateFallbackSvg()) {
        reject(new Error("Source invalide"));
        return;
      }

      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => reject(new Error("Impossible de charger l'image"));
      img.src = src;
    });
  };

  const debugLivre = (livre) => {
    if (!livre) return;

    console.log(`Livre ID ${livre.id} - Données d'image:`, {
      titre: livre.title || livre.titre,
      image: livre.image
        ? livre.image.substring(0, 50) + "..."
        : "absente",
      image_url: livre.image_url
        ? livre.image_url.substring(0, 50) + "..."
        : "absente",
      couverture: livre.couverture
        ? livre.couverture.substring(0, 50) + "..."
        : "absente",
      imageUrl: livre.imageUrl
        ? livre.imageUrl.substring(0, 50) + "..."
        : "absente",
    });
  };

  const getVendeurEtLivres = async (userId) => {
    try {
      setLoading(true);
      console.log("Récupération des données du vendeur...", userId);

      const vendeurResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}/vendeur`,
        {
          headers: {
            Authorization: `Bearer ${auth.getToken()}`,
            Accept: "application/ld+json",
          },
        }
      );

      if (!vendeurResponse.ok) {
        if (vendeurResponse.status === 404) {
          throw new Error(
            "Vous n'avez pas encore de profil vendeur. Veuillez d'abord configurer votre profil."
          );
        } else if (vendeurResponse.status === 401) {
          throw new Error("Session expirée. Veuillez vous reconnecter.");
        } else {
          throw new Error(
            `Erreur lors de la récupération des informations vendeur (${vendeurResponse.status})`
          );
        }
      }

      const vendeurData = await vendeurResponse.json();
      console.log("Données vendeur récupérées:", vendeurData.id);
      setVendeurId(vendeurData.id);

      const livresResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/books`,
        {
          headers: {
            Authorization: `Bearer ${auth.getToken()}`,
            Accept: "application/ld+json",
          },
        }
      );

      if (!livresResponse.ok) {
        throw new Error(
          `Impossible de récupérer les livres: ${livresResponse.status}`
        );
      }

      const livresData = await livresResponse.json();
      console.log("Structure de la réponse de l'API:", Object.keys(livresData));

      let allBooks = [];
      if (livresData["hydra:member"]) {
        allBooks = livresData["hydra:member"];
      } else if (livresData["member"]) {
        allBooks = livresData["member"];
      } else if (Array.isArray(livresData)) {
        allBooks = livresData;
      }

      console.log(`Total de ${allBooks.length} livres récupérés`);

      try {
        const vendeurLivresResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/vendeurs/${vendeurData.id}/books`,
          {
            headers: {
              Authorization: `Bearer ${auth.getToken()}`,
              Accept: "application/json",
            },
          }
        );

        if (vendeurLivresResponse.ok) {
          const vendeurLivresData = await vendeurLivresResponse.json();
          console.log(
            "Données brutes des livres du vendeur:",
            vendeurLivresData
          );

          let vendeurLivres = [];
          if (vendeurLivresData["member"]) {
            vendeurLivres = vendeurLivresData["member"];
          } else if (vendeurLivresData["hydra:member"]) {
            vendeurLivres = vendeurLivresData["hydra:member"];
          } else if (Array.isArray(vendeurLivresData)) {
            vendeurLivres = vendeurLivresData;
          }

          if (vendeurLivres.length > 0) {
            console.log(
              "Livres du vendeur récupérés directement:",
              vendeurLivres.length
            );
            console.log("Premier livre du vendeur:", vendeurLivres[0]);

            const livresAvecImages = vendeurLivres.map((livre) => {
              if (
                livre.image &&
                typeof livre.image === "string" &&
                livre.image.startsWith("data:image") &&
                livre.image.length < 1000
              ) {
                livre.image = null;
              }
              return livre;
            });

            setLivres(livresAvecImages);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error(
          "Erreur lors de la récupération directe des livres du vendeur:",
          err
        );
      }

      const mesLivres = allBooks.filter((livre) => {
        if (typeof livre.vendeur === "string") {
          return livre.vendeur.includes(`/vendeurs/${vendeurData.id}`);
        } else if (livre.vendeur && livre.vendeur.id) {
          return livre.vendeur.id.toString() === vendeurData.id.toString();
        } else if (livre.vendeur && livre.vendeur["@id"]) {
          return livre.vendeur["@id"].includes(`/vendeurs/${vendeurData.id}`);
        }
        return false;
      });

      console.log(
        `Filtrage: ${mesLivres.length} livres appartiennent au vendeur ${vendeurData.id}`
      );

      if (mesLivres.length > 0) {
        debugLivre(mesLivres[0]);
      }

      setLivres(mesLivres);
    } catch (error) {
      console.error("Erreur lors de la récupération des livres:", error);
      setError(error.message || "Une erreur s'est produite");
      if (error.message.includes("Session expirée")) {
        auth.logout();
        setTimeout(
          () => router.push("/auth/login?redirect=/compte/mes-livres"),
          1000
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLivre = async (livreId, livreTitle) => {
    if (
      !confirm(
        `Êtes-vous sûr de vouloir supprimer le livre \"${livreTitle}\" ?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/books/${livreId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${auth.getToken()}`,
            Accept: "application/ld+json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Impossible de supprimer ce livre");
      }

      setLivres((prevLivres) =>
        prevLivres.filter((livre) => livre.id !== livreId)
      );
      setSuccessMessage(
        `Le livre \"${livreTitle}\" a été supprimé avec succès`
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      setError(
        error.message ||
          "Une erreur s'est produite lors de la suppression du livre"
      );
      setTimeout(() => {
        setError("");
      }, 3000);
    }
  };

  const getBookImage = (livre) => {
    if (!livre) return generateFallbackSvg();

    try {
      const imageProps = ["image", "couverture", "image_url", "imageUrl"];

      for (const prop of imageProps) {
        const imageValue = livre[prop];

        if (
          imageValue &&
          typeof imageValue === "string" &&
          imageValue.trim() !== ""
        ) {
          if (imageValue.startsWith("data:image")) {
            if (isValidBase64Image(imageValue)) {
              return imageValue;
            } else {
              console.warn(`Livre ${livre.id}: Image base64 invalide`);
            }
          } else if (imageValue.startsWith("http")) {
            return imageValue;
          } else if (imageValue.startsWith("/")) {
            // Préfixer avec l'URL de base pour les images uploadées
            return `${process.env.NEXT_PUBLIC_API_URL}/uploads${imageValue}`;
          }
        }
      }

      return generateFallbackSvg();
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de l'image pour le livre ${livre.id}:`,
        error
      );
      return generateFallbackSvg();
    }
  };

  const handleImageLoadError = (e, livreId) => {
    console.error(`Erreur de chargement d'image pour le livre ${livreId}`);
    e.target.src = generateFallbackSvg();
    const spinners = e.target.parentNode.querySelectorAll(".loading-spinner");
    spinners.forEach((spinner) => {
      spinner.style.display = "none";
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <h1 className="text-3xl font-bold mb-4 sm:mb-0">Mes livres</h1>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/compte/ajouter-livre"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Ajouter un livre
              </Link>
              <Link
                href="/compte"
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Retour au compte
              </Link>
            </div>
          </div>

          {successMessage && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                  <div className="mt-2">
                    <button
                      onClick={() => window.location.reload()}
                      className="text-sm text-red-700 font-medium underline hover:text-red-600"
                    >
                      Réessayer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-500 text-lg">
                Chargement de vos livres...
              </p>
            </div>
          ) : livres.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-gray-300 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Vous n'avez pas encore ajouté de livres
              </h2>
              <p className="text-gray-500 mb-6">
                Commencez à vendre vos livres en ajoutant votre premier titre
              </p>
              <Link
                href="/compte/ajouter-livre"
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Ajouter mon premier livre
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {livres.map((livre) => (
                <div
                  key={livre.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="relative h-48 bg-gray-100">
                    <div className="absolute inset-0 flex items-center justify-center loading-spinner">
                      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>

                    <img
                      src={generateFallbackSvg()}
                      data-actual-src={getBookImage(livre)}
                      alt={livre.title || livre.titre}
                      className="w-full h-full object-cover"
                      onLoad={(e) => {
                        const spinners =
                          e.target.parentNode.querySelectorAll(
                            ".loading-spinner"
                          );
                        spinners.forEach((spinner) => {
                          spinner.style.display = "none";
                        });

                        const actualSrc =
                          e.target.getAttribute("data-actual-src");
                        if (
                          actualSrc &&
                          actualSrc !== generateFallbackSvg()
                        ) {
                          preloadImage(actualSrc)
                            .then((validSrc) => {
                              e.target.src = validSrc;
                            })
                            .catch((err) => {
                              console.error(
                                `Impossible de charger l'image du livre ${livre.id}: ${err.message}`
                              );
                            });
                        }
                      }}
                      onError={(e) =>
                        handleImageLoadError(e, livre.id)
                      }
                      loading="lazy"
                      decoding="async"
                    />

                    {(livre.stock || livre.quantite_stock) && (
                      <div className="absolute top-2 right-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            (livre.stock || livre.quantite_stock) > 5
                              ? "bg-green-100 text-green-800"
                              : (livre.stock || livre.quantite_stock) > 0
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {(livre.stock || livre.quantite_stock) > 0
                            ? `${livre.stock || livre.quantite_stock} en stock`
                            : "Épuisé"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 mb-1">
                      {livre.title || livre.titre}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {livre.author || livre.auteur}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-blue-600">
                        {parseFloat(
                          livre.price || livre.prix || 0
                        ).toFixed(2)}{" "}
                        €
                      </span>

                      <div className="flex space-x-2">
                        <Link
                          href={`/compte/modifier-livre/${livre.id}`}
                          className="flex items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 rounded-full"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-600"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() =>
                            handleDeleteLivre(
                              livre.id,
                              livre.title || livre.titre
                            )
                          }
                          className="flex items-center justify-center p-2 bg-gray-100 hover:bg-red-100 rounded-full"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-600 hover:text-red-600"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}