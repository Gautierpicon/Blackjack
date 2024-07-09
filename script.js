// Récupération des éléments DOM
const dealerCards = document.getElementById('dealer-cards');
const playerCards = document.getElementById('player-cards');
const dealerTotal = document.getElementById('dealer-total');
const playerTotal = document.getElementById('player-total');
const hitButton = document.getElementById('hit-button');
const standButton = document.getElementById('stand-button');
const newGameButton = document.getElementById('new-game-button');
const messages = document.getElementById('messages');

let deck = [];
let dealerHand = [];
let playerHand = [];

// Création du deck
function createDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
}

// Mélange du deck
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Distribution d'une carte
function dealCard() {
    return deck.pop();
}

// Calcul de la valeur d'une main
function calculateHandValue(hand) {
    let value = 0;
    let aces = 0;
    
    for (let card of hand) {
        if (card.value === 'A') {
            aces += 1;
            value += 11;
        } else if (['K', 'Q', 'J'].includes(card.value)) {
            value += 10;
        } else {
            value += parseInt(card.value);
        }
    }
    
    while (value > 21 && aces > 0) {
        value -= 10;
        aces -= 1;
    }
    
    return value;
}

// Mise à jour de l'affichage
function updateDisplay(hideDealer = true) {
    dealerCards.innerHTML = dealerHand.map((card, index) => 
        hideDealer && index === 1 
            ? '<span class="hidden-card">🂠</span>'
            : `<span class="${['♥', '♦'].includes(card.suit) ? 'red-card' : ''}">${card.value}${card.suit}</span>`
    ).join(' ');
    playerCards.innerHTML = playerHand.map(card => `<span class="${['♥', '♦'].includes(card.suit) ? 'red-card' : ''}">${card.value}${card.suit}</span>`).join(' ');
    
    dealerTotal.textContent = hideDealer ? `Total: ${calculateHandValue([dealerHand[0]])}` : `Total: ${calculateHandValue(dealerHand)}`;
    playerTotal.textContent = `Total: ${calculateHandValue(playerHand)}`;
}

// Action de tirer une carte pour le joueur
function playerHit() {
    playerHand.push(dealCard());
    updateDisplay();
    
    if (calculateHandValue(playerHand) > 21) {
        endGame("Vous avez dépassé 21. Vous avez perdu.");
    }
}

// Action de rester pour le joueur
function playerStand() {
    updateDisplay(false);
    
    while (calculateHandValue(dealerHand) < 17) {
        dealerHand.push(dealCard());
        updateDisplay(false);
    }
    
    evaluateGame();
}

// Evaluation du jeu après le tour du croupier
function evaluateGame() {
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(dealerHand);
    
    if (dealerValue > 21) {
        endGame("Le croupier a dépassé 21. Vous avez gagné !");
    } else if (playerValue > dealerValue) {
        endGame("Vous avez gagné !");
    } else if (playerValue < dealerValue) {
        endGame("Vous avez perdu.");
    } else {
        endGame("Égalité !");
    }
}

// Fin du jeu
function endGame(message) {
    messages.textContent = message;
    hitButton.disabled = true;
    standButton.disabled = true;
    newGameButton.disabled = false;
}

// Démarrer une nouvelle partie
function startNewGame() {
    deck = [];
    dealerHand = [];
    playerHand = [];
    messages.textContent = '';
    
    createDeck();
    shuffleDeck();
    
    dealerHand.push(dealCard(), dealCard());
    playerHand.push(dealCard(), dealCard());
    
    updateDisplay();
    
    hitButton.disabled = false;
    standButton.disabled = false;
    newGameButton.disabled = true;
}

// Ajout des écouteurs d'événements pour les boutons
hitButton.addEventListener('click', playerHit);
standButton.addEventListener('click', playerStand);
newGameButton.addEventListener('click', startNewGame);

// Initialisation du jeu
startNewGame();