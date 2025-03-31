"use client";

import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function BookDetailPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const data = await api.getBook(id);
        setBook(data);
        setError(null);
      } catch (err) {
        setError("Impossible de charger les détails du livre");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBook();
    }
  }, [id]);

  if (loading) return <div>Chargement des détails du livre...</div>;
  if (error) return <div>Erreur: {error}</div>;
  if (!book) return <div>Livre non trouvé</div>;

  return (
    <div className="container mx-auto py-8">
      <Link href="/livres" className="text-blue-600 hover:underline mb-4 inline-block">
        &larr; Retour aux livres
      </Link>
      
      <div className="bg-white rounded-lg shadow-md p-6 mt-4">
        <div className="md:flex">
          <div className="md:w-1/3">
            <img
              src={book.image}
              alt={book.title}
              className="w-full h-auto rounded"
            />
          </div>
          <div className="md:w-2/3 md:pl-8 mt-4 md:mt-0">
            <h1 className="text-3xl font-bold">{book.title}</h1>
            <p className="text-gray-600 text-xl mt-2">par {book.author}</p>
            
            <div className="mt-4 flex items-center">
              <span className="text-2xl font-bold">{(book.prix / 100).toFixed(2)} €</span>
              <span className="ml-4 px-3 py-1 bg-gray-100 rounded-full text-sm">
                {book.etat.nom}
              </span>
            </div>
            
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{book.description_longue}</p>
            </div>
            
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Catégories</h2>
              <div className="flex flex-wrap">
                {book.categories.map((category) => (
                  <span
                    key={category.id}
                    className="mr-2 mb-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}