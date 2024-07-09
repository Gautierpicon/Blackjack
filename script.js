// Récupération des éléments DOM
const dealerCards = document.getElementById('dealer-cards');
const playerCards = document.getElementById('player-cards');
const dealerTotal = document.getElementById('dealer-total');
const playerTotal = document.getElementById('player-total');
const hitButton = document.getElementById('hit-button');
const standButton = document.getElementById('stand-button');
const messages = document.getElementById('messages');
const balanceAmount = document.getElementById('balance-amount');
const betAmount = document.getElementById('bet-amount');
const betInput = document.getElementById('bet-input');
const placeBetButton = document.getElementById('place-bet-button');

let deck = [];
let dealerHand = [];
let playerHand = [];
let balance = 300;
let currentBet = 0;

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
function updateDisplay() {
    dealerCards.innerHTML = dealerHand.map(card => `<span class="${['♥', '♦'].includes(card.suit) ? 'red-card' : ''}">${card.value}${card.suit}</span>`).join(' ');
    playerCards.innerHTML = playerHand.map(card => `<span class="${['♥', '♦'].includes(card.suit) ? 'red-card' : ''}">${card.value}${card.suit}</span>`).join(' ');
    dealerTotal.textContent = `Total: ${calculateHandValue(dealerHand)}`;
    playerTotal.textContent = `Total: ${calculateHandValue(playerHand)}`;
    balanceAmount.textContent = balance;
    betAmount.textContent = currentBet;
}

// Action de tirer une carte pour le joueur
function playerHit() {
    playerHand.push(dealCard());
    updateDisplay();
    
    if (calculateHandValue(playerHand) > 21) {
        endGame("Vous avez dépassé 21. Vous avez perdu.", -currentBet);
    }
}

// Affichage des cartes du croupier tour par tour
function revealDealerCard(index) {
    if (index < dealerHand.length) {
        updateDisplay();
        setTimeout(() => revealDealerCard(index + 1), 1000);
    } else {
        evaluateGame();
    }
}

// Evaluation du jeu après le tour du croupier
function evaluateGame() {
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(dealerHand);
    
    if (dealerValue > 21) {
        endGame("Le croupier a dépassé 21. Vous avez gagné !", currentBet);
    } else if (playerValue > dealerValue) {
        endGame("Vous avez gagné !", currentBet);
    } else if (playerValue < dealerValue) {
        endGame("Vous avez perdu.", -currentBet);
    } else {
        endGame("Égalité !", 0);
    }
}

// Action de rester pour le joueur
function playerStand() {
    hitButton.disabled = true;
    standButton.disabled = true;
    
    function revealCards() {
        if (calculateHandValue(dealerHand) < 17) {
            dealerHand.push(dealCard());
            updateDisplay();
            setTimeout(revealCards, 1000);
        } else {
            evaluateGame();
        }
    }
    
    revealCards();
}

// Fin du jeu
function endGame(message, betResult) {
    messages.textContent = message;
    hitButton.disabled = true;
    standButton.disabled = true;
    balance += betResult;
    currentBet = 0;
    updateDisplay();
    enableBetting();
}

// Démarrer une nouvelle partie
function startNewGame() {
    deck = [];
    dealerHand = [];
    playerHand = [];
    messages.textContent = '';
    
    createDeck();
    shuffleDeck();
    
    dealerHand.push(dealCard());
    playerHand.push(dealCard());
    dealerHand.push(dealCard());
    playerHand.push(dealCard());
    
    updateDisplay();
    
    hitButton.disabled = false;
    standButton.disabled = false;
    
    if (checkForBlackjack()) {
        hitButton.disabled = true;
        standButton.disabled = true;
        enableBetting();
    }
}

// Placer une mise
function placeBet() {
    const betValue = parseInt(betInput.value);
    if (isNaN(betValue) || betValue <= 0 || betValue > balance) {
        messages.textContent = "Mise invalide. Veuillez entrer un montant valide.";
        return;
    }
    
    currentBet = betValue;
    balance -= currentBet;
    updateDisplay();
    
    disableBetting();
    startNewGame();
}

// Activer les éléments de mise
function enableBetting() {
    betInput.disabled = false;
    placeBetButton.disabled = false;
}

// Désactiver les éléments de mise
function disableBetting() {
    betInput.disabled = true;
    placeBetButton.disabled = true;
}

// Ajout des écouteurs d'événements pour les boutons
hitButton.addEventListener('click', playerHit);
standButton.addEventListener('click', playerStand);
placeBetButton.addEventListener('click', placeBet);

// Initialisation du jeu
updateDisplay();
enableBetting();
hitButton.disabled = true;
standButton.disabled = true;
