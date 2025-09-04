document.addEventListener('DOMContentLoaded', function() {
    const pokemonCollection = document.getElementById('pokemonCollection');
    const totalPokemonElement = document.getElementById('totalPokemon');
    const uniquePokemonElement = document.getElementById('uniquePokemon');
    const completionElement = document.getElementById('completion');
    const resetBtn = document.getElementById('resetBtn');
    const backBtn = document.getElementById('backBtn');
    const exportBtn = document.getElementById('exportBtn');
    const generationFilter = document.getElementById('generationFilter');
    const rarityFilter = document.getElementById('rarityFilter');
    const sortBy = document.getElementById('sortBy');
    
    let collection = [];
    let filteredCollection = [];
    
    chrome.storage.local.get(['pokemonCollection'], function(result) {
        collection = result.pokemonCollection || [];
        filteredCollection = [...collection];
        updateStats();
        renderCollection();
    });
    
    function updateStats() {
        const totalCaught = collection.reduce((total, pokemon) => total + (pokemon.caughtCount || 1), 0);
        totalPokemonElement.textContent = totalCaught;
        const uniqueSpecies = new Set(collection.map(pokemon => pokemon.id));
        uniquePokemonElement.textContent = uniqueSpecies.size;
        // Calculate completion percentage (898 total Pokemon)
        const completionPercentage = Math.round((uniqueSpecies.size / 898) * 100);
        completionElement.textContent = completionPercentage + '%';
    }
    
    function applyFilters() {
        const generation = generationFilter.value;
        const rarity = rarityFilter.value;
        const sortMethod = sortBy.value;
        
        filteredCollection = collection.filter(pokemon => {
            const genMatch = generation === 'all' || pokemon.generation == generation;
            const rarityMatch = rarity === 'all' || pokemon.rarity === rarity;
            return genMatch && rarityMatch;
        });
        
        filteredCollection.sort((a, b) => {
            switch(sortMethod) {
                case 'name':
                    return a.displayName.localeCompare(b.displayName);
                case 'date':
                    return new Date(b.date) - new Date(a.date);
                case 'rarity':
                    const rarityOrder = {common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4, mythical: 5};
                    return rarityOrder[b.rarity] - rarityOrder[a.rarity];
                default: // id
                    return a.id - b.id;
            }
        });
        
        renderCollection();
    }
    
    function renderCollection() {
        pokemonCollection.innerHTML = '';
        
        if (filteredCollection.length === 0) {
            pokemonCollection.innerHTML = `
                <div class="empty-collection">
                    <div style="font-size: 4rem; margin-bottom: 20px;">🔍</div>
                    <p>No Pokemon match your filters!</p>
                    <p>Try adjusting your filter settings or catch more Pokemon.</p>
                </div>
            `;
            return;
        }
        
        filteredCollection.forEach((pokemon) => {
            const pokemonCard = document.createElement('div');
            pokemonCard.className = 'pokemon-card';
            
            const caughtCount = pokemon.caughtCount || 1;
            const typeBadges = pokemon.types.map(type => 
                `<span class="type-badge">${type.displayName}</span>`
            ).join('');
            
            pokemonCard.innerHTML = `
                ${caughtCount > 1 ? `<div class="badge">${caughtCount}</div>` : ''}
                <div class="rarity-indicator rarity-${pokemon.rarity}"></div>
                <img src="${pokemon.sprites.official || pokemon.sprites.default}" alt="${pokemon.displayName}">
                <div class="pokemon-name">${pokemon.displayName}</div>
                <div class="pokemon-id">#${pokemon.id.toString().padStart(3, '0')}</div>
                <div class="pokemon-types">${typeBadges}</div>
                <div class="capture-date">Caught: ${new Date(pokemon.date).toLocaleDateString()}</div>
                ${caughtCount > 1 ? `<div class="caught-count">Caught ${caughtCount} times</div>` : ''}
            `;
            
            pokemonCollection.appendChild(pokemonCard);
        });
    }
    
    resetBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset your entire Pokedex? This action cannot be undone.')) {
            chrome.storage.local.remove('pokemonCollection', function() {
                collection = [];
                filteredCollection = [];
                updateStats();
                renderCollection();
            });
        }
    });
    
    exportBtn.addEventListener('click', function() {
        const dataStr = JSON.stringify(collection, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = 'pokemon-collection.json';    
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    });
    
    backBtn.addEventListener('click', function() {
        window.close();
    });
    
    generationFilter.addEventListener('change', applyFilters);
    rarityFilter.addEventListener('change', applyFilters);
    sortBy.addEventListener('change', applyFilters);
    
    chrome.storage.onChanged.addListener(function(changes, namespace) {
        if (namespace === 'local' && changes.pokemonCollection) {
            collection = changes.pokemonCollection.newValue || [];
            filteredCollection = [...collection];
            updateStats();
            applyFilters();
        }
    });
    
    const typeColors = {
        normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
        grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
        ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
        rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
        steel: '#B8B8D0', fairy: '#EE99AC'
    };
    
    setTimeout(() => {
        document.querySelectorAll('.type-badge').forEach(badge => {
            const typeName = badge.textContent.toLowerCase();
            if (typeColors[typeName]) {
                badge.style.backgroundColor = typeColors[typeName];
                badge.style.color = 'white';
                badge.style.textShadow = '0 1px 2px rgba(0,0,0,0.3)';
            }
        });
    }, 100);
});