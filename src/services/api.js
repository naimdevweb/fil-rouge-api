const API_URL = process.env.NEXT_PUBLIC_API_URL ;

/**
 * Service pour interagir avec l'API
 */
export const api = {
    /**
     * Récupérer tous les livres
     */
    async getBooks() {
      try {
        const response = await fetch(`${API_URL}/api/books`);
        if (!response.ok) throw new Error('Erreur lors de la récupération des livres');
        return await response.json();
      } catch (error) {
        console.error('Erreur API:', error);
        throw error;
      }
    },
  /**
   * Récupérer un livre par son ID
   */
  async getBook(id) {
    try {
      const response = await fetch(`${API_URL}/api/books/${id}`);
      if (!response.ok) throw new Error(`Livre non trouvé (ID: ${id})`);
      return await response.json();
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  },

  /**
   * Récupérer les livres d'un vendeur
   */
  async getVendeurBooks(vendeurId, token) {
    try {
      const response = await fetch(`${API_URL}/api/vendeurs/${vendeurId}/books`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Erreur lors de la récupération des livres du vendeur');
      return await response.json();
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  },

  /**
   * Créer un nouveau livre (réservé aux vendeurs)
   */
  async createBook(bookData, token) {
    try {
      const response = await fetch(`${API_URL}/api/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookData)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Erreur lors de la création du livre');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour un livre
   */
  async updateBook(id, bookData, token) {
    try {
      const response = await fetch(`${API_URL}/api/books/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/merge-patch+json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookData)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || `Erreur lors de la mise à jour du livre (ID: ${id})`);
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  },

  /**
   * Supprimer un livre
   */
  async deleteBook(id, token) {
    try {
      const response = await fetch(`${API_URL}/api/books/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error(`Erreur lors de la suppression du livre (ID: ${id})`);
      return true;
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  },


  /**
 * Récupérer une catégorie par son ID
 */
async getCategory(id) {
    try {
      console.log("Récupération de la catégorie:", id);
      const response = await fetch(`${API_URL}/api/categories/${id}`);
      if (!response.ok) {
        console.error("Erreur HTTP:", response.status, response.statusText);
        throw new Error(`Catégorie non trouvée (ID: ${id})`);
      }
      
      const data = await response.json();
      console.log("Données de la catégorie récupérées:", data);
      return data;
    } catch (error) {
      console.error('Erreur API getCategory:', error);
      throw error;
    }
  },

  
/**
 * Récupérer les livres par catégorie
 */
async getBooksByCategory(categoryId) {
    try {
      console.log("Recherche de livres par catégorie:", categoryId);
      
      // Essayer un autre format de requête pour le filtrage
      const response = await fetch(`${API_URL}/api/books?category=${categoryId}`);
      
      if (!response.ok) {
        console.error("Erreur HTTP:", response.status, response.statusText);
        throw new Error(`Erreur lors de la récupération des livres de la catégorie ${categoryId}`);
      }
      
      const data = await response.json();
      console.log("Livres filtrés reçus:", data);
      return data;
    } catch (error) {
      console.error('Erreur API getBooksByCategory:', error);
      throw error;
    }
  },
  
  /**
 * Récupérer toutes les catégories
 */
async getCategories() {
    try {
      console.log("Appel API vers:", `${API_URL}/api/categories`);
      const response = await fetch(`${API_URL}/api/categories`);
      
      if (!response.ok) {
        console.error("Erreur HTTP:", response.status, response.statusText);
        throw new Error('Erreur lors de la récupération des catégories');
      }
      
      const data = await response.json();
      console.log("Données brutes des catégories:", data);
      return data;
    } catch (error) {
      console.error('Erreur API getCategories:', error);
      throw error;
    }
  },
  /**
   * Récupérer tous les états de livre
   */
  async getEtats() {
    try {
      const response = await fetch(`${API_URL}/api/etats`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des états');
      return await response.json();
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  }  


  


  



  
};