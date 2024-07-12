// Fonction pour récupérer une statistique du localStorage
function getStat(key, defaultValue) {
    return localStorage.getItem(key) ? parseFloat(localStorage.getItem(key)) : defaultValue;
}

// Fonction pour mettre à jour l'affichage d'une statistique
function updateStatDisplay(id, value, prefix = '$') {
    document.getElementById(id).textContent = `${prefix}${value}`;
}

// Fonction pour charger et afficher toutes les statistiques
function loadStats() {
    updateStatDisplay('best-balance', getStat('bestBalance', 300));
    updateStatDisplay('max-bet', getStat('maxBet', 0));
    updateStatDisplay('max-win', getStat('maxWin', 0));
    updateStatDisplay('max-loss', getStat('maxLoss', 0));
    updateStatDisplay('games-played', getStat('gamesPlayed', 0), '');
    updateStatDisplay('wins', getStat('wins', 0), '');
    updateStatDisplay('losses', getStat('losses', 0), '');
    updateStatDisplay('blackjacks', getStat('blackjacks', 0), '');
}

// Fonction pour réinitialiser toutes les statistiques
function resetStats() {
    const stats = ['bestBalance', 'maxBet', 'maxWin', 'maxLoss', 'gamesPlayed', 'wins', 'losses', 'blackjacks'];
    stats.forEach(stat => localStorage.removeItem(stat));
    loadStats();
}

// Chargement initial des statistiques
document.addEventListener('DOMContentLoaded', loadStats);

// Écouteur d'événement pour le bouton de réinitialisation
document.getElementById('reset-stats').addEventListener('click', resetStats);