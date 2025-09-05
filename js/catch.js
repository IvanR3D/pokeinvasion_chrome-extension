let remainingTries = 3;
let currentTry = 1;

function saveToCollection(pokemonData) {
    chrome.storage.local.get(['pokemonCollection'], function(result) {
        let collection = result.pokemonCollection || [];
        const existingIndex = collection.findIndex(p => p.id === pokemonData.id);
        
        if (existingIndex === -1) {
            collection.push({
                id: pokemonData.id,
                name: pokemonData.name,
                displayName: pokemonData.displayName,
                types: pokemonData.types,
                sprites: pokemonData.sprites,
                rarity: pokemonData.rarity,
                generation: pokemonData.generation,
                date: new Date().toISOString(),
                caughtCount: 1
            });
        } else {
            collection[existingIndex].caughtCount = (collection[existingIndex].caughtCount || 1) + 1;
            collection[existingIndex].date = new Date().toISOString();
        }
        
        chrome.storage.local.set({pokemonCollection: collection});
    });
}

const urlParams = new URLSearchParams(window.location.search);
const pokemonParam = urlParams.get('pokemon');
let pokemonData = null;

try {
    pokemonData = pokemonParam ? JSON.parse(decodeURIComponent(pokemonParam)) : null;
} catch (e) {
    console.error('Error parsing Pokemon data:', e);
    pokemonData = null;
}

if (!pokemonData) {
    pokemonData = {
        id: 25,
        name: 'pikachu',
        displayName: 'Pikachu',
        sprites: {
            default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
            official: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
        },
        rarity: 'uncommon',
        types: [{name: 'electric', displayName: 'Electric'}]
    };
}

document.getElementById('target').style.backgroundImage = `url('${pokemonData.sprites.official || pokemonData.sprites.default}')`;
document.getElementById('capture-status').textContent = `You caught ${pokemonData.displayName}!`;

var finished = false;
var Screen = { height: window.innerHeight, width: window.innerWidth };
var MAX_VELOCITY = Screen.height * 0.009;

var Resources = {
    pokeball: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/374756/pkmngo-pokeball.png',
    pokeballActive: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/374756/pkmngo-pokeballactive.png',
    pokeballClosed: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/374756/pkmngo-pokeballclosed.png'
};

var Ball = {
    id: 'ball', size: 50, x: 0, y: 0, inMotion: false,
    moveBall: function(x, y) {
        Ball.x = x; Ball.y = y;
        var BallElement = document.getElementById(Ball.id);
        BallElement.style.top = Ball.y + 'px';
        BallElement.style.left = Ball.x + 'px';
    },
    getElement() { return document.getElementById(Ball.id); },
    resetBall: function() {
        Ball.moveBall(Screen.width / 2 - (Ball.size / 2), Screen.height - (Ball.size + 10));
        var BallElement = document.getElementById(Ball.id);
        BallElement.style.transform = "";
        BallElement.style.width = BallElement.style.height = Ball.size + 'px';
        BallElement.style.backgroundImage = "url('" + Resources.pokeball + "')";
        Ball.inMotion = false;
    },
    savePosition: function() {
        var ballEle = document.getElementById('ball');
        var ballRect = ballEle.getBoundingClientRect();
        ballEle.style.transform = "";
        ballEle.style.top = ballRect.top + 'px';
        ballEle.style.left = ballRect.left + 'px';
        ballEle.style.height = ballEle.style.width = ballRect.width + 'px';
    }
};

resetState();

anime({
    targets: ['#target'], 
    rotate: [0, 5, -5, 0], 
    scale: [1, 1.05, 1],
    duration: 1200,
    loop: true, 
    easing: 'easeInOutQuad'
});

window.onresize = function() {
    Screen.height = window.innerHeight;
    Screen.width = window.innerWidth;
    MAX_VELOCITY = Screen.height * 0.009;
    resetState();
}

var touchElement = document.getElementById('touch-layer');
var touchRegion = new ZingTouch.Region(touchElement);
var CustomSwipe = new ZingTouch.Swipe({ escapeVelocity: 0.1 });
var CustomPan = new ZingTouch.Pan();
var endPan = CustomPan.end;

CustomPan.end = function(inputs) {
    setTimeout(function() {
        if (Ball.inMotion === false) Ball.resetBall();
    }, 100);
    return endPan.call(this, inputs);
}

touchRegion.bind(touchElement, CustomPan, function(e) {
    Ball.moveBall(e.detail.events[0].x - Ball.size / 2, e.detail.events[0].y - Ball.size / 2);
});

touchRegion.bind(touchElement, CustomSwipe, function(e) {
    Ball.inMotion = true;
    var screenEle = document.getElementById('screen');
    var screenPos = screenEle.getBoundingClientRect();
    var angle = e.detail.data[0].currentDirection;
    var rawVelocity = velocity = e.detail.data[0].velocity;
    velocity = (velocity > MAX_VELOCITY) ? MAX_VELOCITY : velocity;

    var scalePercent = Math.log(velocity + 1) / Math.log(MAX_VELOCITY + 1);
    var destinationY = (Screen.height - (Screen.height * scalePercent)) + screenPos.top;
    var movementY = destinationY - e.detail.events[0].y;
    var translateYValue = -0.75 * Screen.height * scalePercent;
    var translateXValue = 1 * (90 - angle) * -(translateYValue / 100);

    anime.remove('#ring-fill');

    anime({
        targets: ['#ball'],
        translateX: { duration: 300, value: translateXValue, easing: 'easeOutSine' },
        translateY: { value: movementY * 1.25 + 'px', duration: 300, easing: 'easeOutSine' },
        scale: { value: 1 - (0.5 * scalePercent), easing: 'easeInSine', duration: 300 },
        complete: function() {
            if (movementY < 0) {
                throwBall(movementY, translateXValue, scalePercent);
            } else {
                setTimeout(resetState, 400);
            }
        }
    });
});

function throwBall(movementY, translateXValue, scalePercent){
    Ball.savePosition();
    anime({
        targets: ['#ball'],
        translateY: { value: movementY * -0.5 + 'px', duration: 400, easing: 'easeInOutSine' },
        translateX: { value: -translateXValue * 0.25, duration: 400, easing: 'linear' },
        scale: { value: 1 - (0.25 * scalePercent), easing: 'easeInSine', duration: 400 },
        complete: determineThrowResult
    });
}

function determineThrowResult() {
    var targetCoords = getCenterCoords('target');
    var ballCoords = getCenterCoords('ball');
    var radius = document.getElementById('target').getBoundingClientRect().width / 2;
    
    if (ballCoords.x > targetCoords.x - radius && ballCoords.x < targetCoords.x + radius &&
        ballCoords.y > targetCoords.y - radius && ballCoords.y < targetCoords.y + radius) {
        // Successful hit - proceed with capture (this counts as a try)
        currentTry++;
        Ball.savePosition();
        var ballOrientation = (ballCoords.x < targetCoords.x) ? -1 : 1;
        anime({
            targets: ['#ball'],
            translateY: { value: -1.15 * radius, duration: 200, easing: 'linear' },
            translateX: { value: 1.15 * radius * ballOrientation, duration: 200, easing: 'linear' },
            scaleX: { value: ballOrientation, duration: 200 },
            complete: function() {
                var ball = Ball.getElement();
                ball.style.backgroundImage = "url('" + Resources.pokeballActive + "')";
                emitParticlesToPokeball();
            }
        });
    } else {
        // Miss - doesn't count as a try, just reset
        showMissMessage("Missed! Try again.");
        setTimeout(resetState, 400);
    }
}

function showMissMessage(text) {
    const existingMessage = document.getElementById('miss-message');
    if (existingMessage) {
        document.body.removeChild(existingMessage);
    }
    
    const missElement = document.createElement('div');
    missElement.id = 'miss-message';
    missElement.textContent = text;
    missElement.style.position = 'fixed';
    missElement.style.top = '50%';
    missElement.style.left = '50%';
    missElement.style.transform = 'translate(-50%, -50%)';
    missElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    missElement.style.color = 'white';
    missElement.style.padding = '10px 20px';
    missElement.style.borderRadius = '10px';
    missElement.style.zIndex = '1000';
    missElement.style.fontWeight = 'bold';
    missElement.style.fontSize = '18px';
    missElement.style.textAlign = 'center';
    
    document.body.appendChild(missElement);
    
    setTimeout(() => {
        if (document.body.contains(missElement)) {
            document.body.removeChild(missElement);
        }
    }, 1500);
}

function showEscapeMessage() {
    const existingMessage = document.getElementById('escape-message');
    if (existingMessage) {
        document.body.removeChild(existingMessage);
    }
    
    const escapeElement = document.createElement('div');
    escapeElement.id = 'escape-message';
    escapeElement.innerHTML = `
        <div style="text-align: center; margin-bottom: 10px;">
            <div style="font-size: 24px; font-weight: bold; color: #ff3860;">ESCAPED!</div>
            <div>${pokemonData.displayName} got away</div>
        </div>
    `;
    
    escapeElement.style.position = 'fixed';
    escapeElement.style.top = '50%';
    escapeElement.style.left = '50%';
    escapeElement.style.transform = 'translate(-50%, -50%)';
    escapeElement.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    escapeElement.style.color = 'white';
    escapeElement.style.padding = '20px';
    escapeElement.style.borderRadius = '15px';
    escapeElement.style.zIndex = '1001';
    escapeElement.style.fontSize = '18px';
    escapeElement.style.border = '2px solid #ff3860';
    
    document.body.appendChild(escapeElement);
}

function handleEscape() {
    // Pokemon escapes after 3 failed attempts
    finished = true;
    
    Swal.fire({
        icon: 'error',
        title: `${pokemonData.displayName} Escaped!`,
        imageUrl: pokemonData.sprites.official || pokemonData.sprites.default,
        imageHeight: 150,
        text: 'The Pokemon got away after 3 failed attempts.',
        confirmButtonText: 'Continue Hunting',
        confirmButtonColor: '#ff3860'
    }).then(() => {
        window.close();
    });
}

function emitParticlesToPokeball() {
    var targetEle = getCenterCoords('target');
    var ballEle = Ball.getElement();
    var ballRect = ballEle.getBoundingClientRect();
    
    // Get type-based colors for particles
    const typeColors = {
        normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
        grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
        ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
        rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
        steel: '#B8B8D0', fairy: '#EE99AC'
    };
    
    // Use Pokemon's type colors or default palette
    const pokemonColors = pokemonData.types.map(type => typeColors[type.name] || '#FFFFFF');
    const palette = pokemonColors.length > 0 ? pokemonColors : ['#E4D3A8', '#6EB8C0', '#FFF', '#2196F3'];
    
    var particleContainer = document.getElementById('particles');
    
    for (var i = 0; i < 50; i++) {
        var particleEle = document.createElement('div');
        particleEle.className = 'particle';
        particleEle.setAttribute('id', 'particle-' + i);
        var particleLeft = getRandNum(-60, 60) + targetEle.x;
        particleEle.style.left = particleLeft + 'px';
        var particleRight = getRandNum(-60, 60) + targetEle.y;
        particleEle.style.top = particleRight + 'px';
        particleEle.style.backgroundColor = palette[getRandNum(0, palette.length)];
        particleContainer.appendChild(particleEle);
        
        anime({
            targets: ['#particle-' + i],
            translateX: { value: ballRect.left - particleLeft, delay: 100 + (i * 10) },
            translateY: { value: ballRect.top + (Ball.size / 2) - particleRight, delay: 100 + (i * 10) },
            opacity: { value: 0, delay: 100 + (i * 10), duration: 800, easing: 'easeInSine' }
        });
        
        anime({
            targets: ['#target'],
            opacity: { value: 0, delay: 200, easing: 'easeInSine' }
        });
    }
    
    setTimeout(function() {
        var ball = Ball.getElement();
        ball.style.backgroundImage = "url('" + Resources.pokeballClosed + "')";
        document.getElementById('particles').innerHTML = "";
        Ball.savePosition();

        anime({
            targets: ['#ball'],
            translateY: { value: "200px", delay: 400, duration: 400, easing: 'linear' },
            complete: function() { Ball.resetBall(); }
        });
        
        setTimeout(function() {
            animateCaptureState();
            resetState();
        }, 750);
    }, 1000);
}

function animateCaptureState() {
    var ballContainer = document.getElementById('capture-screen');
    ballContainer.classList.toggle('hidden');

    var duration = 500;
    anime({
        targets: ['#capture-ball'],
        rotate: 40, duration: duration, easing: 'easeInOutBack',
        loop: true, direction: 'alternate'
    });

    var ringRect = (document.getElementById('ring-active')).getBoundingClientRect();
    var successRate = ((150 - ringRect.width) / 150) * 100;
    
    // Adjust success rate based on Pokemon rarity
    const rarityModifiers = {
        common: 1.2,
        uncommon: 1.0,
        rare: 0.8,
        epic: 0.6,
        legendary: 0.4,
        mythical: 0.2
    };
    
    const rarityModifier = rarityModifiers[pokemonData.rarity] || 1.0;
    successRate *= rarityModifier;
    
    var seed = getRandNum(0, 100);
    
    setTimeout(function() {
        anime.remove('#capture-ball');

        if (seed < Math.floor(successRate)) {
            var buttonContainer = document.getElementById('capture-ball-button-container');
            buttonContainer.classList.toggle('hidden');

            var captureStatus = document.getElementById('capture-status');
            captureStatus.classList.toggle('hidden');
            captureStatus.innerHTML = `You caught ${pokemonData.displayName}!`;
            saveToCollection(pokemonData);
            finished = true;
            makeItRainConfetti();
            
            anime({
                targets: ['#capture-ball-button-container'],
                opacity: { value: 0, duration: 800, easing: 'easeInSine' },
                complete: function() {
                    Swal.fire({
                        icon: 'success',
                        title: `Congrats! You caught ${pokemonData.displayName}!`,
                        imageUrl: pokemonData.sprites.official || pokemonData.sprites.default,
                        imageHeight: 150,
                        text: 'Pokemon added to your Pokedex!',
                        confirmButtonText: 'View Pokedex',
                        confirmButtonColor: '#32d900',
                        showCancelButton: true,
                        cancelButtonText: 'Continue Hunting'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.close();
                            chrome.tabs.create({url: chrome.runtime.getURL('collection.html')});
                        } else {
                            window.close();
                        }
                    });
                }
            });
        } else {
            // Capture failed - this counts as a used try
            remainingTries--;
            
            if (remainingTries <= 0) {
                // No tries left - Pokemon escapes
                setTimeout(() => {
                    showEscapeMessage();
                    setTimeout(() => window.close(), 1500);
                }, 500);
            } else {
                showMissMessage(`${pokemonData.displayName} broke free! ${remainingTries} ${remainingTries === 1 ? 'try' : 'tries'} left.`);
                setTimeout(() => {
                    resetState();
                    var ballContainer = document.getElementById('capture-screen');
                    ballContainer.classList.toggle('hidden');
                }, 2000);
            }
        }
    }, duration * 6);
}

function showFailedCaptureMessage() {
    Swal.fire({
        icon: 'warning',
        title: 'Almost!',
        text: `${pokemonData.displayName} broke free! ${remainingTries} ${remainingTries === 1 ? 'try' : 'tries'} remaining.`,
        timer: 2000,
        showConfirmButton: false
    });
}

function makeItRainConfetti() {
    // Use Pokemon type colors for confetti
    const typeColors = {
        normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
        grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
        ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
        rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
        steel: '#B8B8D0', fairy: '#EE99AC'
    };
    
    const pokemonColors = pokemonData.types.map(type => typeColors[type.name] || '#FFFFFF');
    const palette = pokemonColors.length > 0 ? pokemonColors : ['#FFF', '#4aa6fb'];
    
    for (var i = 0; i < 100; i++) {
        var particleContainer = document.getElementById('capture-confetti');
        var particleEle = document.createElement('div');
        particleEle.className = 'particle';
        particleEle.setAttribute('id', 'particle-' + i);
        var particleLeft = window.innerWidth / 2;
        particleEle.style.left = particleLeft + 'px';
        var particleTop = window.innerHeight / 2;
        particleEle.style.top = particleTop + 'px';
        particleEle.style.backgroundColor = palette[getRandNum(0, palette.length)];
        particleContainer.appendChild(particleEle);
        
        anime({
            targets: ['#particle-' + i],
            translateX: { value: ((getRandNum(0, 2)) ? -1 : 1) * getRandNum(0, window.innerWidth / 2), delay: 100 },
            translateY: { value: ((getRandNum(0, 2)) ? -1 : 1) * getRandNum(0, window.innerHeight / 2), delay: 100 },
            opacity: { value: 0, duration: 800, easing: 'easeInSine' },
            complete: function() { document.getElementById('capture-confetti').innerHTML = ""; }
        });
    }
}

function resetState() {
    Ball.resetBall();
    document.getElementById('target').style.opacity = 1;
    var ring = document.getElementById('ring-fill');
    ring.style.height = "150px";
    ring.style.width = "150px";
    anime({
        targets: ['#ring-fill'],
        height: "5px", width: "5px", duration: 3000,
        loop: true, easing: 'linear'
    });
    
    const missMessage = document.getElementById('miss-message');
    if (missMessage) {
        document.body.removeChild(missMessage);
    }
}

function getCenterCoords(elementId) {
    var rect = document.getElementById(elementId).getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function getRandNum(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}