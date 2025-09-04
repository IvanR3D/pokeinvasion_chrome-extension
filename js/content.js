(function() {
    let invasionActive = false;
    let activePokemon = [];
    let pokemonService;

    async function initializePokemonService() {
        pokemonService = new PokemonService();
    }

    // Pokemon spawn configuration
    const spawnConfig = {
        minInterval: 3000,
        maxInterval: 8000,
        maxActivePokemon: 3,
        generation: 1,
        includeRare: true,     // Include legendary/mythical Pokemon
        spawnChance: 0.7,       // 70% chance to spawn when interval triggers
    };

    async function createPokemonElement(pokemonData) {
        const pokemon = document.createElement('div');
        pokemon.className = 'pokemon-invasion-sprite';
        const img = document.createElement('img');
        img.src = pokemonData.sprites.default || pokemonData.sprites.official;
        img.alt = pokemonData.displayName;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        const nameLabel = document.createElement('div');
        nameLabel.textContent = pokemonData.displayName;
        nameLabel.className = 'pokemon-name-label';
        const rarityIndicator = document.createElement('div');
        rarityIndicator.className = `pokemon-rarity-indicator ${pokemonData.rarity}`;
        
        pokemon.appendChild(img);
        pokemon.appendChild(nameLabel);
        pokemon.appendChild(rarityIndicator);

        const size = getPokemonSize(pokemonData.rarity);
        pokemon.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            z-index: 999999;
            cursor: pointer;
            transition: all 0.3s ease;
            pointer-events: auto;
            user-select: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `;
        
        nameLabel.style.cssText = `
            position: absolute;
            bottom: -25px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-family: 'Arial', sans-serif;
            white-space: nowrap;
            opacity: 0;
            transition: opacity 0.2s ease;
            pointer-events: none;
        `;
        
        rarityIndicator.style.cssText = `
            position: absolute;
            top: -5px;
            right: -5px;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;
        
        const rarityColors = {
            common: '#8BC34A',
            uncommon: '#2196F3', 
            rare: '#9C27B0',
            epic: '#FF9800',
            legendary: '#F44336',
            mythical: '#E91E63'
        };
        rarityIndicator.style.backgroundColor = rarityColors[pokemonData.rarity] || rarityColors.common;
        
        pokemon.dataset.pokemonData = JSON.stringify(pokemonData);
        
        pokemon.addEventListener('mouseenter', () => {
            pokemon.style.transform = 'scale(1.1)';
            nameLabel.style.opacity = '1';
        });
        
        pokemon.addEventListener('mouseleave', () => {
            pokemon.style.transform = 'scale(1)';
            nameLabel.style.opacity = '0';
        });
        
        setRandomSpawnPosition(pokemon, size);
        
        pokemon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const catchUrl = chrome.runtime.getURL(`catch.html?pokemon=${encodeURIComponent(JSON.stringify(pokemonData))}`);
            window.open(catchUrl, '_blank', 'width=400,height=600');
            
            pokemon.style.transform = 'scale(0) rotate(360deg)';
            pokemon.style.opacity = '0';
            
            setTimeout(() => {
                if (pokemon.parentNode) {
                    pokemon.parentNode.removeChild(pokemon);
                }
                const index = activePokemon.indexOf(pokemon);
                if (index > -1) {
                    activePokemon.splice(index, 1);
                }
            }, 300);
        });

        return pokemon;
    }

    function getPokemonSize(rarity) {
        const sizes = {
            common: 70,
            uncommon: 80,
            rare: 90,
            epic: 100,
            legendary: 120,
            mythical: 130
        };
        return sizes[rarity] || sizes.common;
    }

    function setRandomSpawnPosition(element, size) {
        const side = Math.floor(Math.random() * 4);
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const margin = 20;
        
        switch(side) {
            case 0: // Top
                element.style.left = Math.random() * (viewportWidth - size) + 'px';
                element.style.top = `-${size}px`;
                setTimeout(() => {
                    element.style.top = margin + 'px';
                }, 100);
                break;
            case 1: // Right
                element.style.right = `-${size}px`;
                element.style.top = Math.random() * (viewportHeight - size) + 'px';
                setTimeout(() => {
                    element.style.right = margin + 'px';
                }, 100);
                break;
            case 2: // Bottom
                element.style.left = Math.random() * (viewportWidth - size) + 'px';
                element.style.bottom = `-${size}px`;
                setTimeout(() => {
                    element.style.bottom = margin + 'px';
                }, 100);
                break;
            case 3: // Left
                element.style.left = `-${size}px`;
                element.style.top = Math.random() * (viewportHeight - size) + 'px';
                setTimeout(() => {
                    element.style.left = margin + 'px';
                }, 100);
                break;
        }
    }

    async function spawnPokemon() {
        if (!invasionActive || !pokemonService) return;
        // Don't spawn if we're at the limit or random chance fails
        if (activePokemon.length >= spawnConfig.maxActivePokemon) return;
        if (Math.random() > spawnConfig.spawnChance) return;
        
        try {
            const pokemonData = await pokemonService.getRandomPokemon(
                spawnConfig.generation, 
                spawnConfig.includeRare
            );
            
            if (!pokemonData) {
                console.warn('Failed to fetch Pokemon data for spawn');
                return;
            }
            
            const pokemonElement = await createPokemonElement(pokemonData);
            document.body.appendChild(pokemonElement);
            activePokemon.push(pokemonElement);
            
            // Auto-remove after stay duration (based on rarity)
            const stayDurations = {
                common: 4000,
                uncommon: 5000,
                rare: 6000,
                epic: 7000,
                legendary: 10000,
                mythical: 12000
            };
            
            const stayDuration = stayDurations[pokemonData.rarity] || stayDurations.common;
            
            setTimeout(() => {
                if (pokemonElement.parentNode && activePokemon.includes(pokemonElement)) {
                    pokemonElement.style.opacity = '0';
                    pokemonElement.style.transform = 'scale(0.8)';
                    
                    setTimeout(() => {
                        if (pokemonElement.parentNode) {
                            pokemonElement.parentNode.removeChild(pokemonElement);
                        }
                        const index = activePokemon.indexOf(pokemonElement);
                        if (index > -1) {
                            activePokemon.splice(index, 1);
                        }
                    }, 300);
                }
            }, stayDuration);
            
        } catch (error) {
            console.error('Error spawning Pokemon:', error);
        }
    }

    async function startInvasion(config = {}) {
        if (invasionActive) return;
        if (!pokemonService) {
            await initializePokemonService();
        }
        Object.assign(spawnConfig, config);
        
        invasionActive = true;
        console.log('Pokemon invasion started! Generation:', spawnConfig.generation);
        
        const spawnRandomly = () => {
            if (!invasionActive) return;
            
            spawnPokemon();
            
            const nextSpawn = Math.random() * (spawnConfig.maxInterval - spawnConfig.minInterval) + spawnConfig.minInterval;
            setTimeout(spawnRandomly, nextSpawn);
        };
        
        setTimeout(spawnRandomly, 1000);
    }

    function stopInvasion() {
        invasionActive = false;
        
        activePokemon.forEach(pokemon => {
            if (pokemon.parentNode) {
                pokemon.parentNode.removeChild(pokemon);
            }
        });
        activePokemon = [];
        
        console.log('Pokemon invasion stopped!');
    }

    function updateConfig(newConfig) {
        Object.assign(spawnConfig, newConfig);
        console.log('Pokemon invasion config updated:', spawnConfig);
    }

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        switch(request.action) {
            case 'startInvasion':
                startInvasion(request.config || {})
                    .then(() => sendResponse({success: true}))
                    .catch(error => sendResponse({success: false, error: error.message}));
                break;
            case 'stopInvasion':
                stopInvasion();
                sendResponse({success: true});
                break;
            case 'updateConfig':
                updateConfig(request.config);
                sendResponse({success: true, config: spawnConfig});
                break;
            case 'getStatus':
                sendResponse({
                    isActive: invasionActive,
                    activePokemonCount: activePokemon.length,
                    config: spawnConfig
                });
                break;
            case 'getActivePokemon':
                const pokemonList = activePokemon.map(element => {
                    try {
                        return JSON.parse(element.dataset.pokemonData);
                    } catch {
                        return null;
                    }
                }).filter(Boolean);
                sendResponse({pokemon: pokemonList});
                break;
        }
        return true; // Keep message channel open
    });

    window.addEventListener('beforeunload', function() {
        stopInvasion();
    });

    initializePokemonService().catch(console.error);
})();