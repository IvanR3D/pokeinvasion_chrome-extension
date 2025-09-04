class PokemonService {
    constructor() {
        this.baseUrl = 'https://pokeapi.co/api/v2';
        this.cache = new Map();
        this.generationRanges = {
            1: { start: 1, end: 151 },    // Kanto
            2: { start: 152, end: 251 },  // Johto  
            3: { start: 252, end: 386 },  // Hoenn
            4: { start: 387, end: 493 },  // Sinnoh
            5: { start: 494, end: 649 },  // Unova
            6: { start: 650, end: 721 },  // Kalos
            7: { start: 722, end: 809 },  // Alola
            8: { start: 810, end: 898 },  // Galar
        };
    }

    getRandomPokemonId(generation = 1) {
        const range = this.generationRanges[generation] || this.generationRanges[1];
        return Math.floor(Math.random() * (range.end - range.start + 1)) + range.start;
    }

    async getPokemon(idOrName) {
        const cacheKey = idOrName.toString().toLowerCase();
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const response = await fetch(`${this.baseUrl}/pokemon/${idOrName}`);
            if (!response.ok) throw new Error(`Pokemon not found: ${idOrName}`);
            const pokemonData = await response.json();
            const processedPokemon = {
                id: pokemonData.id,
                name: pokemonData.name,
                displayName: this.capitalizeWords(pokemonData.name),
                height: pokemonData.height,
                weight: pokemonData.weight,
                baseExperience: pokemonData.base_experience,
                types: pokemonData.types.map(type => ({
                    name: type.type.name,
                    displayName: this.capitalizeWords(type.type.name)
                })),
                sprites: {
                    default: pokemonData.sprites.front_default,
                    shiny: pokemonData.sprites.front_shiny,
                    animated: pokemonData.sprites.versions?.["generation-v"]?.["black-white"]?.animated?.front_default || pokemonData.sprites.front_default,
                    official: pokemonData.sprites.other?.["official-artwork"]?.front_default || pokemonData.sprites.front_default
                },
                stats: pokemonData.stats.map(stat => ({
                    name: stat.stat.name,
                    value: stat.base_stat
                })),
                generation: this.getGeneration(pokemonData.id),
                rarity: this.calculateRarity(pokemonData.base_experience, pokemonData.id)
            };

            this.cache.set(cacheKey, processedPokemon);
            return processedPokemon;
        } catch (error) {
            console.error('Error fetching Pokemon:', error);
            return null;
        }
    }

    async getPokemonSpecies(idOrName) {
        try {
            const response = await fetch(`${this.baseUrl}/pokemon-species/${idOrName}`);
            if (!response.ok) throw new Error(`Species not found: ${idOrName}`);
            
            const speciesData = await response.json();
            return {
                flavorText: speciesData.flavor_text_entries
                    .find(entry => entry.language.name === 'en')?.flavor_text
                    .replace(/\f/g, ' ').replace(/\n/g, ' ') || 'A mysterious Pokemon.',
                captureRate: speciesData.capture_rate,
                isLegendary: speciesData.is_legendary,
                isMythical: speciesData.is_mythical,
                habitat: speciesData.habitat?.name || 'unknown',
                color: speciesData.color.name
            };
        } catch (error) {
            console.error('Error fetching Pokemon species:', error);
            return null;
        }
    }

    async getCompletePokemon(idOrName) {
        const [pokemon, species] = await Promise.all([
            this.getPokemon(idOrName),
            this.getPokemonSpecies(idOrName)
        ]);

        if (!pokemon) return null;

        return {
            ...pokemon,
            species: species || {}
        };
    }

    async getRandomPokemon(generation = 1, includeRare = false) {
        let attempts = 0;
        while (attempts < 5) {
            const id = this.getRandomPokemonId(generation);
            const pokemon = await this.getPokemon(id);
            
            if (pokemon) {
                if (!includeRare && (pokemon.rarity === 'legendary' || pokemon.rarity === 'mythical')) {
                    attempts++;
                    continue;
                }
                return pokemon;
            }
            attempts++;
        }
        // Fallback to Pikachu if all attempts fail
        return await this.getPokemon(25);
    }

    async getRandomPokemonBatch(count = 5, generation = 1) {
        const promises = Array(count).fill().map(() => this.getRandomPokemon(generation));
        const results = await Promise.all(promises);
        return results.filter(pokemon => pokemon !== null);
    }

    // Calculate Pokemon rarity based on base experience and ID
    calculateRarity(baseExperience = 0, id = 0) {
        // Legendary Pokemon (common legendary IDs)
        const legendaryIds = [144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386];
        const mythicalIds = [151, 251, 385, 386, 489, 490, 491, 492, 493];
        if (mythicalIds.includes(id)) return 'mythical';
        if (legendaryIds.includes(id)) return 'legendary';
        if (baseExperience > 270) return 'epic';
        if (baseExperience > 180) return 'rare';
        if (baseExperience > 100) return 'uncommon';
        return 'common';
    }

    getGeneration(id) {
        for (const [gen, range] of Object.entries(this.generationRanges)) {
            if (id >= range.start && id <= range.end) {
                return parseInt(gen);
            }
        }
        return 1;
    }

    capitalizeWords(str) {
        return str.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    async getTypeEffectiveness(typeName) {
        try {
            const response = await fetch(`${this.baseUrl}/type/${typeName}`);
            if (!response.ok) throw new Error(`Type not found: ${typeName}`);
            
            const typeData = await response.json();
            return {
                doubleDamageFrom: typeData.damage_relations.double_damage_from.map(t => t.name),
                doubleDamageTo: typeData.damage_relations.double_damage_to.map(t => t.name),
                halfDamageFrom: typeData.damage_relations.half_damage_from.map(t => t.name),
                halfDamageTo: typeData.damage_relations.half_damage_to.map(t => t.name),
                noDamageFrom: typeData.damage_relations.no_damage_from.map(t => t.name),
                noDamageTo: typeData.damage_relations.no_damage_to.map(t => t.name)
            };
        } catch (error) {
            console.error('Error fetching type data:', error);
            return null;
        }
    }

    clearCache() {
        this.cache.clear();
    }

    getCacheSize() {
        return this.cache.size;
    }
}

window.PokemonService = PokemonService;