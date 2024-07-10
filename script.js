// DOM elements
const messages = document.getElementById('messages');
const betInput = document.getElementById('bet-input');
const betAmount = document.getElementById('bet-amount');
const hitButton = document.getElementById('hit-button');
const dealerCards = document.getElementById('dealer-cards');
const playerCards = document.getElementById('player-cards');
const dealerTotal = document.getElementById('dealer-total');
const playerTotal = document.getElementById('player-total');
const standButton = document.getElementById('stand-button');
const balanceAmount = document.getElementById('balance-amount');
const placeBetButton = document.getElementById('place-bet-button');
const surrenderButton = document.getElementById('surrender-button');

let deck = [];
let dealerHand = [];
let playerHand = [];
let balance = 300;
let currentBet = 0;

// Deck creation
function createDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
}

// Deck shuffling
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

// Calculating the value of a hand
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

// Updating the display
function updateDisplay() {
    dealerCards.innerHTML = dealerHand.map(card => `<span class="${['♥', '♦'].includes(card.suit) ? 'red-card' : ''}">${card.value}${card.suit}</span>`).join(' ');
    playerCards.innerHTML = playerHand.map(card => `<span class="${['♥', '♦'].includes(card.suit) ? 'red-card' : ''}">${card.value}${card.suit}</span>`).join(' ');
    dealerTotal.textContent = `Total: ${calculateHandValue(dealerHand)}`;
    playerTotal.textContent = `Total: ${calculateHandValue(playerHand)}`;
    balanceAmount.textContent = balance;
    betAmount.textContent = currentBet;
}

// Checking for Blackjack
function checkForBlackjack() {
    if (calculateHandValue(playerHand) === 21) {
        endGame("Blackjack! You win!", Math.floor(currentBet * 2.5));
        return true;
    } else if (calculateHandValue(dealerHand) === 21) {
        endGame("Dealer has a Blackjack. You lose.", Math.floor(currentBet - currentBet));
        return true;
    }
    return false;
}

// Player hits a card
function playerHit() {
    playerHand.push(dealCard());
    updateDisplay();
    
    if (calculateHandValue(playerHand) > 21) {
        endGame("You exceeded 21. You lose.", Math.floor(currentBet - currentBet));
    }
    surrenderButton.disabled = true;
}

// Revealing dealer cards one by one
function revealDealerCard(index) {
    if (index < dealerHand.length) {
        updateDisplay();
        setTimeout(() => revealDealerCard(index + 1), 1000);
    } else {
        evaluateGame();
    }
}

// Evaluating the game after the dealer's turn
function evaluateGame() {
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(dealerHand);
    
    if (dealerValue > 21) {
        endGame("Dealer exceeded 21. You win!", Math.floor(currentBet * 2));
    } else if (playerValue > dealerValue) {
        endGame("You win!", Math.floor(currentBet * 2));
    } else if (playerValue < dealerValue) {
        endGame("You lose.", Math.floor(currentBet - currentBet));
    } else {
        endGame("Push!", currentBet);
    }
}

// Player stands
function playerStand() {
    hitButton.disabled = true;
    standButton.disabled = true;
    surrenderButton.disabled = true;
    
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

// Player surrenders
function surrender() {
    if (playerHand.length !== 2) {
        messages.textContent = "Surrender is only allowed with the initial two cards.";
        return;
    }
    
    endGame("You surrendered. You get half of your bet back.", Math.floor(currentBet / 2));
}

// End of the game
function endGame(message, betResult) {
    messages.textContent = message;
    hitButton.disabled = true;
    standButton.disabled = true;
    surrenderButton.disabled = true;
    balance += betResult;
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
    
    createDeck();
    shuffleDeck();
    
    dealerHand.push(dealCard());
    playerHand.push(dealCard());
    dealerHand.push(dealCard());
    playerHand.push(dealCard());
    
    updateDisplay();
    
    hitButton.disabled = false;
    standButton.disabled = false;
    surrenderButton.disabled = false;
    
    if (checkForBlackjack()) {
        hitButton.disabled = true;
        standButton.disabled = true;
        surrenderButton.disabled = true;
        enableBetting();
    }
}

// Placing a bet
function placeBet() {
    const betValue = parseInt(betInput.value);
    if (isNaN(betValue) || betValue <= 0) {
        messages.textContent = "Invalid bet. Please enter a valid amount.";
        return;
    }
    
    currentBet = betValue;
    balance -= currentBet;
    updateDisplay();
    disableBetting();
    startNewGame();
}

// Enable betting elements
function enableBetting() {
    betInput.disabled = false;
    placeBetButton.disabled = false;
}

// Disable betting elements
function disableBetting() {
    betInput.disabled = true;
    placeBetButton.disabled = true;
}

// Adding event listeners for buttons
hitButton.addEventListener('click', playerHit);
placeBetButton.addEventListener('click', placeBet);
standButton.addEventListener('click', playerStand);
surrenderButton.addEventListener('click', surrender);

// Initializing the game
updateDisplay();
enableBetting();
hitButton.disabled = true;
standButton.disabled = true;
surrenderButton.disabled = true;