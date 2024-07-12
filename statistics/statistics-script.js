// Function to retrieve a statistic from localStorage
function getStat(key, defaultValue) {
    return localStorage.getItem(key) ? parseFloat(localStorage.getItem(key)) : defaultValue;
}

// Function to update the display of a statistic
function updateStatDisplay(id, value, prefix = '$') {
    document.getElementById(id).textContent = `${prefix}${value}`;
}

// Function to load and display all statistics
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

// Function to reset all statistics
function resetStats() {
    const stats = ['bestBalance', 'maxBet', 'maxWin', 'maxLoss', 'gamesPlayed', 'wins', 'losses', 'blackjacks'];
    stats.forEach(stat => localStorage.removeItem(stat));
    loadStats();
}

// Initial loading of statistics
document.addEventListener('DOMContentLoaded', loadStats);

// Event listener for reset button
document.getElementById('reset-stats').addEventListener('click', resetStats);
