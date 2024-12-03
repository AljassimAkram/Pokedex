const BASE_URL = "https://pokeapi.co/api/v2/pokemon/";
const limit = 20; // Anzahl der Pokémon pro Seite
let offset = 0; // Start bei Pokémon #1
let totalLoaded = 0; // Zählt die bisher geladenen Pokémon
const maxPokemons = 100; // Begrenzung auf 100 Pokémon
const POKEMON_CARDS_SECTION = document.getElementById("pokemon-cards-section");
let loadedPokemons = []; // Liste der geladenen Pokémon

// Basis-URL für Pokémon-Typ-Icons
const BASE_TYPE_ICON_URL = "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/";
const pokemonTypes = [
    "normal", "fire", "water", "electric", "grass", "ice", "fighting",
    "poison", "ground", "flying", "psychic", "bug", "rock", "ghost",
    "dragon", "dark", "steel", "fairy"
];

// Dynamisch erstellte Type-Icon-Map
const typeIconMap = Object.fromEntries(
    pokemonTypes.map(type => [type, `${BASE_TYPE_ICON_URL}${type}.svg`])
);

// Typenfarben
const typeColorMap = {
    normal: "#A8A878",
    fire: "#F08030",
    water: "#6890F0",
    electric: "#F8D030",
    grass: "#78C850",
    ice: "#98D8D8",
    fighting: "#C03028",
    poison: "#A040A0",
    ground: "#E0C068",
    flying: "#A890F0",
    psychic: "#F85888",
    bug: "#A8B820",
    rock: "#B8A038",
    ghost: "#705898",
    dragon: "#7038F8",
    dark: "#705848",
    steel: "#B8B8D0",
    fairy: "#EE99AC"
};

/* Initialisieren */
async function initializePokedex() {
    await loadMorePokemons(); // Zeige die ersten Pokémon
}

/* Pokémon laden */
async function loadMorePokemons() {
    if (totalLoaded >= maxPokemons) {
        document.getElementById("load-more-btn").disabled = true;
        return;
    }

    const spinner = document.getElementById("loading-spinner");
    spinner.classList.remove('hidden'); // Lade-Spinner anzeigen
    try {
        const response = await fetch(`${BASE_URL}?offset=${offset}&limit=${limit}`);
        if (!response.ok) throw new Error(`Fehler: ${response.status}`);
        const data = await response.json();

        // Karten rendern
        await renderPokemonCards(data.results);

        // Offset und Zähler aktualisieren
        offset += limit;
        totalLoaded += limit;

        // Deaktiviere den Button, wenn das Maximum erreicht ist
        if (totalLoaded >= maxPokemons) {
            document.getElementById("load-more-btn").disabled = true;
        }
    } catch (error) {
        console.error("Fehler beim Laden der Pokémon:", error);
    } finally {
        spinner.classList.add('hidden'); // Lade-Spinner ausblenden
    }
}

/* Pokémon-Karten rendern */
async function renderPokemonCards(pokemonList) {
    for (let i = 0; i < pokemonList.length; i++) {
        const pokemonData = await fetchPokemonData(pokemonList[i].url);
        if (pokemonData) {
            loadedPokemons.push(pokemonData); // Pokémon zur globalen Liste hinzufügen
            POKEMON_CARDS_SECTION.innerHTML += createPokemonCard(pokemonData, loadedPokemons.length - 1);
        }
    }
}

/* Pokémon-Daten abrufen */
async function fetchPokemonData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Fehler: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Fehler beim Abrufen von Pokémon-Daten:", error);
        return null;
    }
}

/* Pokémon-Karte erstellen */
function createPokemonCard(pokemon, index) {
    const firstType = pokemon.types[0].type.name;
    const backgroundColor = typeColorMap[firstType] || "#ccc"; // Fallback-Farbe

    let typesHTML = "";
    for (let i = 0; i < pokemon.types.length; i++) {
        const type = pokemon.types[i];
        typesHTML += `
            <div class="type-container" style="background-color: ${typeColorMap[type.type.name] || "#ccc"}">
                <img src="${typeIconMap[type.type.name]}" alt="${type.type.name}" class="type-icon">
            </div>
        `;
    }

    return `
        <div class="pokemon-container" onclick="closeModal(${index})" style="background-color: ${backgroundColor}">
            <div class="pokemon-header">
                <span class="pokemon-id">#${pokemon.id}</span>
                <span class="pokemon-name">${capitalize(pokemon.name)}</span>
            </div>
            <div class="pokemon-image">
                <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
            </div>
            <div class="pokemon-types">${typesHTML}</div>
        </div>
    `;
}

/* Evolution Chain abrufen */
async function fetchEvolutionChain(pokemonId) {
    try {
        const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`);
        if (!speciesResponse.ok) throw new Error(`Fehler beim Abrufen der Spezies: ${speciesResponse.status}`);
        const speciesData = await speciesResponse.json();

        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        if (!evolutionResponse.ok) throw new Error(`Fehler beim Abrufen der Evolutionskette: ${evolutionResponse.status}`);
        const evolutionData = await evolutionResponse.json();

        return extractEvolutionData(evolutionData.chain);
    } catch (error) {
        console.error("Fehler beim Abrufen der Evolutionskette:", error);
        return [];
    }
}

function extractEvolutionData(chain) {
    const evolutions = [];
    let current = chain;

    while (current) {
        evolutions.push({
            name: current.species.name,
            id: extractIdFromUrl(current.species.url)
        });
        current = current.evolves_to[0];
    }

    return evolutions;
}

function extractIdFromUrl(url) {
    const parts = url.split('/');
    return parts[parts.length - 2];
}

/* Modal-Funktionen */
let currentPokemonIndex = 0;

function closeModal(index) {
    currentPokemonIndex = index;
    showPokemonDetails(index);
    document.getElementById("pokemon-modal").classList.toggle("hidden");
}

function navigateModal(direction) {
    
}


async function showPokemonDetails(index) {
    const pokemon = loadedPokemons[index];
    const firstType = pokemon.types[0].type.name;
    const backgroundColor = typeColorMap[firstType] || "#ccc";

    const modalContent = document.getElementById("modal-content");
    modalContent.style.backgroundColor = backgroundColor;

    const evolutionData = await fetchEvolutionChain(pokemon.id);

    let statsContent = "";
    for (let i = 0; i < pokemon.stats.length; i++) {
        const stat = pokemon.stats[i];
        statsContent += `
            <p class="stat-item">
                <span class="stat-name">${capitalize(stat.stat.name)}:</span>
                <progress class="stat-bar" value="${stat.base_stat}" max="150"></progress>
            </p>
        `;
    }

    let evolutionContent = `<div class="evo-chain">`;
    for (let i = 0; i < evolutionData.length; i++) {
        const evo = evolutionData[i];
        evolutionContent += `
            <div class="evo-item">
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png" alt="${evo.name}">
                <span>${capitalize(evo.name)}</span>
            </div>
        `;
        if (i < evolutionData.length - 1) {
            evolutionContent += `<span>→</span>`;
        }
    }
    evolutionContent += `</div>`;

    const mainContent = `
        <div class="stat-block">
            <p class="stat-before">Height</p>
            <p class="stat-value">${pokemon.height / 10} m</p>
        </div>
        <div class="stat-block">
            <p class="stat-before">Weight</p>
            <p class="stat-value">${pokemon.weight / 10} kg</p>
        </div>
        <div class="stat-block">
            <p class="stat-before">Base experience</p>
            <p class="stat-value">${pokemon.base_experience}</p>
        </div>
        <div class="stat-block">
            <p class="stat-before">Abilities</p>
            <p class="stat-value">${pokemon.abilities.map(a => capitalize(a.ability.name)).join(", ")}</p>
        </div>
    `;

    const tabsHTML = `
        <div class="tabs">
            <button class="tab-btn" onclick="showTab('main')">Main</button>
            <button class="tab-btn" onclick="showTab('stats')">Stats</button>
            <button class="tab-btn" onclick="showTab('evo')">Evo Chain</button>
        </div>
        <div id="tab-content">
            <div id="main" class="tab-content">${mainContent}</div>
            <div id="stats" class="tab-content hidden">${statsContent}</div>
            <div id="evo" class="tab-content hidden">${evolutionContent}</div>
        </div>
    `;

    const headerHTML = `
        <div class="modal-header">
            <span class="pokemon-id">#${pokemon.id}</span>
            <span class="pokemon-name">${capitalize(pokemon.name)}</span>
            <div class="pokemon-image">
                <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
            </div>
        </div>
    `;

    document.getElementById("modal-details").innerHTML = headerHTML + tabsHTML;
    showTab('main');
}

/* Tab-Wechsel */
function showTab(tabId) {
    const tabs = document.querySelectorAll(".tab-content");
    tabs.forEach(tab => tab.classList.add("hidden"));

    document.getElementById(tabId).classList.remove("hidden");
}

/* Suche */
function searchPokemons() {
    const searchValue = document.getElementById("search-bar").value.toLowerCase();

    if (searchValue.length > 2) {
        const filteredPokemons = loadedPokemons.filter(pokemon =>
            pokemon.name.toLowerCase().includes(searchValue)
        );

        displayPokemon(filteredPokemons.slice(0, 10));
    } else {
        displayPokemon(loadedPokemons.slice(0, 20));
    }
}

function displayPokemon(pokemonList) {
    POKEMON_CARDS_SECTION.innerHTML = "";

    for (let i = 0; i < pokemonList.length; i++) {
        const pokemon = pokemonList[i];
        POKEMON_CARDS_SECTION.innerHTML += createPokemonCard(pokemon, i);
    }
}

/* Hilfsfunktionen */
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
document.addEventListener("DOMContentLoaded", () => {
    initializePokedex();

    // Event-Listener für Navigation
    document.getElementById("prev-pokemon-btn").addEventListener("click", () => navigateModal(-1));
    document.getElementById("next-pokemon-btn").addEventListener("click", () => navigateModal(1));
});
