// DOM Elements
const messages = document.getElementById('messages');
const betInput = document.getElementById('bet-input');
const betAmount = document.getElementById('bet-amount');
const hitButton = document.getElementById('hit-button');
const dealerCards = document.getElementById('dealer-cards');
const playerCards = document.getElementById('player-cards');
const dealerTotal = document.getElementById('dealer-total');
const playerTotal = document.getElementById('player-total');
const standButton = document.getElementById('stand-button');
const maxBetAmount = document.getElementById('max-bet-amount');
const balanceAmount = document.getElementById('balance-amount');
const placeBetButton = document.getElementById('place-bet-button');
const surrenderButton = document.getElementById('surrender-button');
const doubleDownButton = document.getElementById('double-down-button');
const bestBalanceAmount = document.getElementById('best-balance-amount');

let deck = [];
let dealerHand = [];
let playerHand = [];
let maxBet = 0;
let balance = 300;
let currentBet = 0;
let bestBalance = 300;
let isDealerCardHidden = true;

// Creation of cards
function createDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
}

// Shuffling the deck
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Dealing a card
function dealCard() {
    return deck.pop();
}

// Calculating value of a hand
function calculateHandValue(hand, hideSecondCard = false) {
    let value = 0;
    let aces = 0;
    
    for (let i = 0; i < hand.length; i++) {
        if (hideSecondCard && i === 1) continue;
        
        let card = hand[i];
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

// Updating the display
function updateDisplay() {
    dealerCards.innerHTML = dealerHand.map((card, index) => 
        isDealerCardHidden && index === 1 ? 
        '<span class="hidden-card">🂠</span>' : 
        `<span class="${['♥', '♦'].includes(card.suit) ? 'red-card' : ''}">${card.value}${card.suit}</span>`
    ).join(' ');
    
    playerCards.innerHTML = playerHand.map(card => 
        `<span class="${['♥', '♦'].includes(card.suit) ? 'red-card' : ''}">${card.value}${card.suit}</span>`
    ).join(' ');
    
    dealerTotal.textContent = isDealerCardHidden ? 
        ` (Total = ${calculateHandValue(dealerHand, true)} + ?)` : 
        ` (Total = ${calculateHandValue(dealerHand)})`;
    
    playerTotal.textContent = `(Total = ${calculateHandValue(playerHand)})`;
    balanceAmount.textContent = balance;
    betAmount.textContent = currentBet;
    bestBalanceAmount.textContent = bestBalance;
    maxBetAmount.textContent = maxBet;
}

// Check Blackjack 
function checkForBlackjack() {
    if (calculateHandValue(playerHand) === 21) {
        revealDealerCard();
        endGame("Blackjack ! Vous avez gagné !", Math.floor(currentBet * 2.5));
        return true;
    } else if (calculateHandValue(dealerHand) === 21) {
        revealDealerCard();
        endGame("Le croupier a un Blackjack. Vous avez perdu.", 0);
        return true;
    }
    return false;
}

// Reveal dealer's hidden card
function revealDealerCard() {
    isDealerCardHidden = false;
    updateDisplay();
}

// player draws
function playerHit() {
    if (isDealerCardHidden) {
        revealDealerCard();
    }
    playerHand.push(dealCard());
    updateDisplay();
    
    if (calculateHandValue(playerHand) > 21) {
        endGame("Vous avez dépassé 21. Vous avez perdu.", 0);
    }
    surrenderButton.disabled = true;
    doubleDownButton.disabled = true;
}

// player stand 
function playerStand() {
    if (isDealerCardHidden) {
        revealDealerCard();
    }
    hitButton.disabled = true;
    standButton.disabled = true;
    surrenderButton.disabled = true;
    doubleDownButton.disabled = true;
    
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

// Evaluation of the game after the dealer's turn
function evaluateGame() {
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(dealerHand);
    
    if (dealerValue > 21) {
        endGame("Le croupier a dépassé 21. Vous avez gagné !", currentBet * 2);
    } else if (playerValue > dealerValue) {
        endGame("Vous avez gagné !", currentBet * 2);
    } else if (playerValue < dealerValue) {
        endGame("Vous avez perdu.", 0);
    } else {
        endGame("Égalité !", currentBet);
    }
}

// player surrender
function surrender() {
    revealDealerCard();
    endGame("Vous avez abandonné. Vous récupérez la moitié de votre mise.", Math.floor(currentBet / 2));
}

// player doubleDown
function doubleDown() {

    if (balance < currentBet) {
        messages.textContent = "Solde insuffisant pour doubler.";
        return;
    }

    if (isDealerCardHidden) {
        revealDealerCard();
    }

    balance -= currentBet;
    currentBet *= 2;
    updateDisplay();

    playerHand.push(dealCard());
    updateDisplay();

    if (calculateHandValue(playerHand) > 21) {
        endGame("Vous avez dépassé 21. Vous perdez.", 0);
    } else {
        playerStand();
    }
}

// End game
function endGame(message, betResult) {
    messages.textContent = message;
    hitButton.disabled = true;
    standButton.disabled = true;
    surrenderButton.disabled = true;
    doubleDownButton.disabled = true;
    balance += betResult;
    if (balance > bestBalance) {
        bestBalance = balance;
    }
    currentBet = 0;
    updateDisplay();
    enableBetting();
}

// Starting a new game
function startNewGame() {
    deck = [];
    dealerHand = [];
    playerHand = [];
    messages.textContent = '';
    isDealerCardHidden = true;
    
    createDeck();
    shuffleDeck();
    
    dealerHand.push(dealCard());
    dealerHand.push(dealCard());
    playerHand.push(dealCard());
    playerHand.push(dealCard());
    
    updateDisplay();
    
    hitButton.disabled = false;
    standButton.disabled = false;
    surrenderButton.disabled = false;
    doubleDownButton.disabled = false;
    
    if (checkForBlackjack()) {
        hitButton.disabled = true;
        standButton.disabled = true;
        surrenderButton.disabled = true;
        doubleDownButton.disabled = true;
        enableBetting();
    }
}

// Placing a bet
function placeBet() {
    const betValue = parseInt(betInput.value);
    if (isNaN(betValue) || betValue <= 0) {
        messages.textContent = "Mise invalide. Veuillez entrer un montant valide.";
        return;
    }
    
    if (betValue > balance) {
        messages.textContent = "Mise supérieure à votre solde. Veuillez entrer un montant inférieur.";
        return;
    }
    
    currentBet = betValue;
    if (currentBet > maxBet) {
        maxBet = currentBet;
    }
    balance -= currentBet;
    updateDisplay();
    disableBetting();
    startNewGame();
}

// Activation of bet elements
function enableBetting() {
    betInput.disabled = false;
    placeBetButton.disabled = false;
}

// Disable wagering items
function disableBetting() {
    betInput.disabled = true;
    placeBetButton.disabled = true;
}

// Added event listeners for buttons
hitButton.addEventListener('click', playerHit);
placeBetButton.addEventListener('click', placeBet);
standButton.addEventListener('click', playerStand);
surrenderButton.addEventListener('click', surrender);
doubleDownButton.addEventListener('click', doubleDown);

// Initializing the game
updateDisplay();
enableBetting();
hitButton.disabled = true;
standButton.disabled = true;
surrenderButton.disabled = true;
doubleDownButton.disabled = true;