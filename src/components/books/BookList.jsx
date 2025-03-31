"use client";

import BookCard from "./BookCard";

export default function BookList({ books }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.length > 0 ? (
        books.map((book) => <BookCard key={book.id} book={book} />)
      ) : (
        <p className="col-span-3 text-center text-gray-500">
          Aucun livre disponible pour le moment.
        </p>
      )}
    </div>
  );
}