/* Initialize the Pokedex */
async function initializePokedex() {
    await loadMorePokemons(); 
}


/* Load more Pokémon */
async function loadMorePokemons() {
    if (isMaxPokemonsLoaded()) return;

    toggleSpinner(true);

    try {
        const data = await fetchPokemons();
        await renderPokemonCards(data.results);
        updateCounters();

        if (isMaxPokemonsLoaded()) disableLoadMoreButton();
    } catch (error) {
        console.error("Fehler:", error);
    } finally {
        toggleSpinner(false);
    }
}


function isMaxPokemonsLoaded() {
    const loadMoreBtn = document.getElementById("load-more-btn");
    if (totalLoaded >= maxPokemons) {
        loadMoreBtn.disabled = true;
        return true;
    }
    return false;
}


function toggleSpinner(show) {
    const spinner = document.getElementById("loading-spinner");
    spinner.classList.toggle('hidden', !show);
}


async function fetchPokemons() {
    const response = await fetch(`${BASE_URL}?offset=${offset}&limit=${limit}`);
    if (!response.ok) throw new Error(`Fetch error: ${response.status}`);
    return response.json();
}


function updateCounters() {
    offset += limit;
    totalLoaded += limit;
}


function disableLoadMoreButton() {
    document.getElementById("load-more-btn").disabled = true;
}


/* Render Pokémon cards */
async function renderPokemonCards(pokemonList) {
    for (let i = 0; i < pokemonList.length; i++) {
        const pokemonData = await fetchPokemonData(pokemonList[i].url);
        if (pokemonData) {
            loadedPokemons.push(pokemonData);
            POKEMON_CARDS_SECTION.innerHTML += createPokemonCard(pokemonData, loadedPokemons.length - 1);
        }
    }
}


/* Fetch Pokémon data */
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


/* Create Pokémon card */
function createTypeHTML(types) {
    let typesHTML = "";
    for (let i = 0; i < types.length; i++) {
        const type = types[i];
        typesHTML += `
            <div class="type-container" style="background-color: ${typeColorMap[type.type.name] || "#ccc"}">
                <img src="${typeIconMap[type.type.name]}" alt="${type.type.name}" class="type-icon">
            </div>
        `;
    }
    return typesHTML;
}


/* Fetch evolution chain */
async function fetchEvolutionChain(pokemonId) {
    try {
        const speciesData = await fetchJSON(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`);

        if (!speciesData || !speciesData.evolution_chain) {
            throw new Error("Evolutionskette nicht verfügbar.");
        }
        const evolutionData = await fetchJSON(speciesData.evolution_chain.url);
        return evolutionData ? extractEvolutionData(evolutionData.chain) : [];
    } catch (error) {
        console.error("Fehler beim Abrufen der Evolutionskette:", error);
        return [];
    }
}


// Helper function for fetch requests with JSON response
async function fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Fetch-Fehler: ${response.status}`);
    return response.json();
}


/* Extract evolution data */
function extractEvolutionData(chain) {
    const evolutions = [];

    for (let current = chain; current; current = current.evolves_to[0]) {
        evolutions.push({
            name: current.species.name,
            id: extractIdFromUrl(current.species.url),
        });
    }

    return evolutions;
}


function extractIdFromUrl(url) {
    const parts = url.split('/');
    return parts[parts.length - 2];
}


/* Modal functions */
let currentPokemonIndex = 0;

function toggleModal(index = null) {
    const modal = document.getElementById("pokemon-modal");
    const isHidden = modal.classList.contains("hidden");

    if (isHidden && index !== null) {
        currentPokemonIndex = index;
        showPokemonDetails(index);
        const prevButton = document.getElementById("prev-pokemon-btn");
        const nextButton = document.getElementById("next-pokemon-btn");
        prevButton.disabled = index === 0;
        nextButton.disabled = index === loadedPokemons.length - 1;
    }

    modal.classList.toggle("hidden");
}


function navigateModal(direction) {
    currentPokemonIndex += direction;

    if (currentPokemonIndex < 0) {
        currentPokemonIndex = 0;
    } else if (currentPokemonIndex >= loadedPokemons.length) {
        currentPokemonIndex = loadedPokemons.length - 1;
    }
    const prevButton = document.getElementById("prev-pokemon-btn");
    const nextButton = document.getElementById("next-pokemon-btn");
    prevButton.disabled = currentPokemonIndex === 0;
    nextButton.disabled = currentPokemonIndex === loadedPokemons.length - 1;
    showPokemonDetails(currentPokemonIndex);
}


/* Show Pokémon details */
async function showPokemonDetails(index) {
    const pokemon = loadedPokemons[index];
    const modalContent = document.getElementById("modal-content");
    modalContent.style.backgroundColor = getBackgroundColor(pokemon.types);

    const evolutionData = await fetchEvolutionChain(pokemon.id);
    const statsContent = generateStatsHTML(pokemon.stats);
    const evolutionContent = generateEvolutionHTML(evolutionData);
    const mainContent = generateMainHTML(pokemon);

    const tabsHTML = generateTabsHTML(mainContent, statsContent, evolutionContent);
    const headerHTML = generateHeaderHTML(pokemon);

    document.getElementById("modal-details").innerHTML = headerHTML + tabsHTML;
    showTab('main');
}

/* Tab-Wechsel */
function showTab(tabId) {
    hideAllTabs();
    deactivateAllButtons();
    activateTab(tabId);
    activateButton(tabId);
}


function hideAllTabs() {
    const tabs = document.querySelectorAll(".tab-content");
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.add("hidden");
    }
}


function deactivateAllButtons() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
    }
}


function activateTab(tabId) {
    const tab = document.getElementById(tabId);
    if (tab) tab.classList.remove("hidden");
}


function activateButton(tabId) {
    const tabButtons = document.querySelectorAll(".tab-btn");
    for (let i = 0; i < tabButtons.length; i++) {
        if (tabButtons[i].getAttribute("onclick") === `showTab('${tabId}')`) {
            tabButtons[i].classList.add("active");
            break;
        }
    }
}


/* Search */
function searchPokemons() {
    const searchValue = getSearchValue();

    if (searchValue.length > 2) {
        const filteredPokemons = filterPokemonsByName(searchValue);
        displayPokemonList(filteredPokemons.slice(0, 10));
    } else {
        displayPokemonList(loadedPokemons.slice(0, 20));
    }
}


function getSearchValue() {
    return document.getElementById("search-bar").value.toLowerCase();
}


function filterPokemonsByName(searchValue) {
    return loadedPokemons.filter(pokemon =>
        pokemon.name.toLowerCase().includes(searchValue)
    );
}


function displayPokemonList(pokemonList) {
    POKEMON_CARDS_SECTION.innerHTML = "";

    for (const [index, pokemon] of pokemonList.entries()) {
        POKEMON_CARDS_SECTION.innerHTML += createPokemonCard(pokemon, index);
    }
}


/* Helper Functions */
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
document.addEventListener("DOMContentLoaded", () => {
    initializePokedex();

    // Event-Listener für Navigation
    document.getElementById("prev-pokemon-btn").addEventListener("click", () => navigateModal(-1));
    document.getElementById("next-pokemon-btn").addEventListener("click", () => navigateModal(1));
});
