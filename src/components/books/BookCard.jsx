"use client";

import Link from "next/link";

export default function BookCard({ book }) {
  return (
    <div className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
      <Link href={`/livres/${book.id}`}>
        <div className="relative">
          <img
            src={book.image}
            alt={book.title}
            className="w-full h-48 object-cover rounded mb-3"
          />
          <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-bold">
            {(book.prix / 100).toFixed(2)} €
          </div>
        </div>
        <h2 className="text-xl font-semibold line-clamp-1">{book.title}</h2>
        <p className="text-gray-600 mb-2">par {book.author}</p>
        <p className="text-sm text-gray-700 line-clamp-2 mb-3">{book.description_courte}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm bg-gray-100 px-2 py-1 rounded">
            {book.etat.nom}
          </span>
          <span className="text-sm text-blue-600">Voir détails</span>
        </div>
      </Link>
    </div>
  );
}