"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { auth } from "@/services/auth";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setIsLoggedIn(auth.isAuthenticated());
    setUser(auth.getCurrentUser());
  }, []);

  const handleLogout = () => {
    auth.logout();
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between border-b border-gray-200 py-6">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              BookMarket
            </Link>
            <div className="ml-10 hidden space-x-8 md:block">
              <Link href="/livres" className="text-base font-medium text-gray-700 hover:text-blue-600">
                Livres
              </Link>
              <Link href="/categories" className="text-base font-medium text-gray-700 hover:text-blue-600">
                Catégories
              </Link>
              {isLoggedIn && auth.isVendeur() && (
                <Link href="/vendeur/livres" className="text-base font-medium text-gray-700 hover:text-blue-600">
                  Mes Livres
                </Link>
              )}
            </div>
          </div>
          <div className="hidden md:block">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {user?.user_prenom} {user?.user_nom}
                </span>
                <Link
                  href="/profile"
                  className="inline-block rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Mon profil
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-block rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link
                  href="/auth/login"
                  className="inline-block rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-block rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Ouvrir le menu</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="space-y-1 pb-3 pt-2 md:hidden">
            <Link
              href="/livres"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Livres
            </Link>
            <Link
              href="/categories"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Catégories
            </Link>
            {isLoggedIn && auth.isVendeur() && (
              <Link
                href="/vendeur/livres"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Mes Livres
              </Link>
            )}
            {isLoggedIn ? (
              <>
                <Link
                  href="/profile"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mon profil
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-gray-50"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-3 py-2 text-base font-medium text-blue-600 hover:bg-gray-50 hover:text-blue-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}