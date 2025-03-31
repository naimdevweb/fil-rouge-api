// Service pour gérer l'authentification

export const auth = {
  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Vous pourriez également vérifier si le token n'est pas expiré ici
    return true;
  },
  
  // Récupérer l'utilisateur actuel
  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  },
  
  // Récupérer le token JWT
  getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },
  
  // Définir un nouvel utilisateur et token
  setUserAndToken(user, token) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  },
  
  // Déconnexion
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },
  
  // Vérifier si l'utilisateur a un rôle spécifique
  hasRole(role) {
    const user = this.getCurrentUser();
    if (!user || !user.roles) return false;
    
    return user.roles.includes(role);
  },
  
  // Vérifier si l'utilisateur est un vendeur
  isVendeur() {
    return this.hasRole('ROLE_VENDEUR');
  },

  // Vérifiez si cette méthode existe déjà dans votre fichier

// Si cette méthode n'existe pas, ajoutez-la :
setUserAndToken(user, token) {
  localStorage.setItem('user', JSON.stringify(user));
  if (token) localStorage.setItem('token', token);
}
};