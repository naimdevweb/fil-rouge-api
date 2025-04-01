import React from 'react';

const BookList = ({ books }) => {
    const isValidBase64Image = (image) => {
        return image && image.startsWith('data:image') && image.length > 500; // Vérifie si l'image est valide
    };

    return (
        <div>
            {books.map((book) => (
                <div key={book.id} style={{ marginBottom: '20px' }}>
                    <h3>{book.titre}</h3>
                    {/* Vérification de l'image base64 ou affichage d'une image par défaut */}
                    <img
                        src={isValidBase64Image(book.image) ? book.image : 'https://via.placeholder.com/150?text=Pas+d\'image'}
                        alt={book.titre}
                        style={{ width: '150px', height: 'auto' }}
                    />
                </div>
            ))}
        </div>
    );
};

export default BookList;
