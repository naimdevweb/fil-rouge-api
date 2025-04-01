import React, { useEffect, useState } from 'react';
import BookList from '../../components/BookList';

const VendeurPage = ({ id }) => {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        // Récupération des livres du vendeur
        fetch(`http://localhost:8000/api/vendeurs/${id}/books`)
            .then((response) => response.json())
            .then((data) => {
                console.log('Données reçues:', data); // Log des données pour débogage
                const updatedBooks = data.map(book => ({
                    ...book,
                    image: book.image || null, // Vérifiez que l'image est définie
                }));
                setBooks(updatedBooks);
            })
            .catch((error) => console.error('Erreur:', error));
    }, [id]);

    return (
        <div>
            <h1>Livres du vendeur {id}</h1>
            <BookList books={books} />
        </div>
    );
};

export default VendeurPage;
