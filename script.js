// DOM Elements
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const randomButton = document.getElementById('random-button');
const pokemonInfo = document.getElementById('pokemon-info');
const errorContainer = document.getElementById('error-container');
const loadingSpinner = document.getElementById('loading-spinner');
const popularList = document.querySelector('.popular-list');

// Popular Pokemon list
const popularPokemon = [
    'pikachu', 'charizard', 'mewtwo', 'bulbasaur', 
    'squirtle', 'eevee', 'snorlax', 'gyarados'
];

// Initialize popular Pokemon list
function initializePopularList() {
    popularPokemon.forEach(pokemon => {
        const button = document.createElement('button');
        button.className = 'popular-item';
        button.textContent = capitalizeFirstLetter(pokemon);
        button.addEventListener('click', () => {
            searchInput.value = pokemon;
            searchPokemon();
        });
        popularList.appendChild(button);
    });
}

// Helper Functions
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function showLoading() {
    document.body.classList.add('loading');
    loadingSpinner.style.display = 'block';
    pokemonInfo.classList.remove('active');
    errorContainer.style.display = 'none';
}

function hideLoading() {
    document.body.classList.remove('loading');
    loadingSpinner.style.display = 'none';
}

function showError() {
    errorContainer.style.display = 'block';
    pokemonInfo.classList.remove('active');
}

// Update stat bars with animation
function updateStatBars(stats) {
    const maxStat = 255; // Maximum possible base stat
    stats.forEach(stat => {
        const fill = document.querySelector(`[data-stat="${stat.name}"]`);
        if (fill) {
            setTimeout(() => {
                fill.style.width = `${(stat.value / maxStat) * 100}%`;
            }, 100);
        }
    });
}

// Handle sprite variants
function setupSpriteVariants(sprites) {
    const spriteContainer = document.querySelector('.sprite-container');
    const mainSprite = document.getElementById('sprite');
    
    document.querySelectorAll('.variant-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const variant = btn.dataset.variant;
            switch(variant) {
                case 'front':
                    mainSprite.src = sprites.front_default;
                    break;
                case 'back':
                    mainSprite.src = sprites.back_default || sprites.front_default;
                    break;
                case 'shiny':
                    mainSprite.src = sprites.front_shiny || sprites.front_default;
                    break;
            }
        });
    });
}

// Update abilities section
function updateAbilities(abilities) {
    const abilitiesList = document.getElementById('abilities-list');
    abilitiesList.innerHTML = '';
    
    abilities.forEach(ability => {
        const abilityElement = document.createElement('div');
        abilityElement.className = 'ability-item';
        abilityElement.textContent = capitalizeFirstLetter(ability.ability.name.replace('-', ' '));
        abilitiesList.appendChild(abilityElement);
    });
}

// Update moves section
function updateMoves(moves) {
    const movesList = document.getElementById('moves-list');
    movesList.innerHTML = '';
    
    // Show only first 5 moves
    moves.slice(0, 5).forEach(move => {
        const moveElement = document.createElement('div');
        moveElement.className = 'move-item';
        moveElement.textContent = capitalizeFirstLetter(move.move.name.replace('-', ' '));
        movesList.appendChild(moveElement);
    });
}

// Main search function
async function searchPokemon() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        alert('Please enter a Pokémon name or ID');
        return;
    }

    showLoading();

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm}`);
        
        if (!response.ok) {
            throw new Error('Pokémon not found');
        }

        const data = await response.json();

        // Update basic info
        document.getElementById('pokemon-name').textContent = data.name.toUpperCase();
        document.getElementById('pokemon-id').textContent = `#${data.id}`;
        document.getElementById('weight').textContent = `${data.weight / 10}kg`;
        document.getElementById('height').textContent = `${data.height / 10}m`;

        // Update types
        const typesContainer = document.getElementById('types');
        typesContainer.innerHTML = '';
        data.types.forEach(type => {
            const typeElement = document.createElement('span');
            typeElement.textContent = type.type.name.toUpperCase();
            typeElement.className = `type ${type.type.name}`;
            typesContainer.appendChild(typeElement);
        });

        // Update stats
        const stats = data.stats.map(stat => ({
            name: stat.stat.name,
            value: stat.base_stat
        }));

        const statElements = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
        statElements.forEach(statName => {
            const stat = stats.find(s => s.name === statName);
            if (stat) {
                document.getElementById(statName).textContent = stat.value;
            }
        });

        // Update sprite
        const spriteContainer = document.querySelector('.sprite-container');
        spriteContainer.innerHTML = `<img id="sprite" src="${data.sprites.front_default}" alt="${data.name}">`;
        
        // Setup sprite variants
        setupSpriteVariants(data.sprites);
        
        // Update abilities and moves
        updateAbilities(data.abilities);
        updateMoves(data.moves);

        // Update stat bars with animation
        updateStatBars(stats);

        // Show the info container
        hideLoading();
        pokemonInfo.classList.add('active');
        errorContainer.style.display = 'none';

    } catch (error) {
        hideLoading();
        showError();
    }
}

// Random Pokemon function
async function getRandomPokemon() {
    const randomId = Math.floor(Math.random() * 898) + 1; // Up to Gen 8
    searchInput.value = randomId;
    searchPokemon();
}

// Event listeners
searchButton.addEventListener('click', searchPokemon);
randomButton.addEventListener('click', getRandomPokemon);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchPokemon();
    }
});

// Initialize popular Pokemon list on page load
initializePopularList();

// Add some visual feedback for loading states
document.addEventListener('DOMContentLoaded', () => {
    // Add hover effects for sprite
    document.querySelector('.sprite-container').addEventListener('mouseover', (e) => {
        if (e.target.tagName === 'IMG') {
            e.target.style.transform = 'scale(1.1)';
        }
    });

    document.querySelector('.sprite-container').addEventListener('mouseout', (e) => {
        if (e.target.tagName === 'IMG') {
            e.target.style.transform = 'scale(1)';
        }
    });
});