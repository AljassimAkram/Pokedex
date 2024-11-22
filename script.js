document.addEventListener('DOMContentLoaded', async () => {
    const pokemonContainer = document.getElementById('pokemon-container');
    const modal = document.getElementById('pokemon-modal');
    const modalContent = document.getElementById('modal-content');
    let allPokemon = [];
    const typeIcons = {
        fire: "<i class='fas fa-fire'></i>",
        water: "<i class='fas fa-tint'></i>",
        grass: "<i class='fas fa-leaf'></i>",
        electric: "<i class='fas fa-bolt'></i>",
        bug: "<i class='fas fa-bug'></i>",
        poison: "<i class='fas fa-skull-crossbones'></i>",
        flying: "<i class='fas fa-feather-alt'></i>",
        normal: "<i class='fas fa-circle'></i>",
        fairy: "<i class='fas fa-magic'></i>",
        ground: "<i class='fas fa-mountain'></i>",
        // Add more types if necessary
    };
    

    // Fetch Pokémon data
    async function fetchPokemonData() {
        try {
            const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=45');
            const data = await response.json();
            const pokemonPromises = data.results.map(p => fetch(p.url).then(res => res.json()));
            const pokemons = await Promise.all(pokemonPromises);
            return pokemons.map(p => ({
                id: p.id,
                name: p.name,
                types: p.types.map(t => t.type.name),
                image: `https://img.pokemondb.net/sprites/home/normal/${p.name}.png`,
                height: (p.height / 10).toFixed(1),
                weight: (p.weight / 10).toFixed(1),
                base_experience: p.base_experience,
                abilities: p.abilities.map(a => a.ability.name),
                stats: p.stats,
            }));
        } catch (error) {
            console.error('Error fetching Pokémon data:', error);
        }
    }

    allPokemon = await fetchPokemonData();
    displayPokemon(allPokemon);

    function displayPokemon(pokemonList) {
        pokemonContainer.innerHTML = '';
        for (let i = 0; i < pokemonList.length; i++) {
            const p = pokemonList[i];
            const card = document.createElement('div');
            card.className = 'pokemon-card';
            card.onclick = () => openModal(p.id);
            card.innerHTML = `
                <img src="${p.image}" alt="${p.name}">
                <h3>${p.name}</h3>
                <p>N°${p.id}</p>
            `;
            const typeContainer = document.createElement('div');
            for (let j = 0; j < p.types.length; j++) {
                const typeBadge = document.createElement('span');
                typeBadge.className = `type-badge ${p.types[j]}`;
                typeBadge.innerHTML = typeIcons[p.types[j]] || p.types[j];
                typeContainer.appendChild(typeBadge);
            }
            card.appendChild(typeContainer);
            pokemonContainer.appendChild(card);
        }
    }

    const filterPokemon = () => {
        const searchInput = document.getElementById('search-bar').value.toLowerCase();
        const filteredPokemon = [];
        for (let i = 0; i < allPokemon.length; i++) {
            if (allPokemon[i].name.toLowerCase().includes(searchInput)) {
                filteredPokemon.push(allPokemon[i]);
            }
        }
        displayPokemon(filteredPokemon);
    };

    const openModal = async (pokemonId) => {
        const pokemon = allPokemon.find(p => p.id === pokemonId);
        if (!pokemon) return;

        const evolutions = await fetchEvolutionChain(pokemonId);
        modalContent.innerHTML = `
            <div class="modal-header">
                <img src="${pokemon.image}" alt="${pokemon.name}">
                <h2>#${pokemon.id} ${pokemon.name}</h2>
                ${pokemon.types.map(type => `<span class="type-badge ${type}">${typeIcons[type] || type}</span>`).join('')}
            </div>
            <div class="tabs">
                <button id="main-tab" class="tab-button active" onclick="showTab('main')">Main</button>
                <button id="stats-tab" class="tab-button" onclick="showTab('stats')">Stats</button>
                <button id="evo-tab" class="tab-button" onclick="showTab('evo')">Evo Chain</button>
            </div>
            <div id="main" class="tab-content">
                <p><span class="label">Height</span>: <span class="value">${pokemon.height} m</span></p>
                <p><span class="label">Weight</span>: <span class="value">${pokemon.weight} kg</span></p>
                <p><span class="label">Base Experience</span>: <span class="value">${pokemon.base_experience}</span></p>
                <p><span class="label">Abilities</span>: <span class="value">${pokemon.abilities.join(', ')}</span></p>
            </div>
            <div id="stats" class="tab-content" style="display:none;">
                ${pokemon.stats.map(stat => `<div class="ich"><div>${stat.stat.name}</div><div class="stat-bar stat-row"><div class="stat-fill" style="width: ${Math.min(stat.base_stat,100)}%;"></div></div></div>`).join('')}
            </div>
            <div id="evo" class="tab-content" style="display:none;">
                <div class="evolution-chain">
                    ${evolutions.map(evo => `
                        <div class="evolution-step">
                            <img src="https://img.pokemondb.net/sprites/home/normal/${evo.name}.png" alt="${evo.name}">
                            <p>${evo.name}</p>
                        </div>
                    `).join('<div class="evolution-arrow">➜</div>')}
                </div>
            </div>
        `;
        modal.style.display = 'flex';
        showTab('main');
        document.getElementById('close-button').onclick = () => modal.style.display = 'none';
    };

    async function fetchEvolutionChain(pokemonId) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`);
        const speciesData = await response.json();
        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionResponse.json();
        const evolutions = [];
        let chain = evolutionData.chain;
        while (chain) {
            evolutions.push({ name: chain.species.name });
            chain = chain.evolves_to[0];
        }
        return evolutions;
    }

    const showTab = (tabId) => {
        const mainContent = document.getElementById('main');
        const statsContent = document.getElementById('stats');
        const evoContent = document.getElementById('evo');
        const mainTab = document.getElementById('main-tab');
        const statsTab = document.getElementById('stats-tab');
        const evoTab = document.getElementById('evo-tab');

        mainContent.style.display = 'none';
        statsContent.style.display = 'none';
        evoContent.style.display = 'none';

        mainTab.classList.remove('active');
        statsTab.classList.remove('active');
        evoTab.classList.remove('active');

        if (tabId === 'main') {
            mainContent.style.display = 'block';
            mainTab.classList.add('active');
        } else if (tabId === 'stats') {
            statsContent.style.display = 'block';
            statsTab.classList.add('active');
        } else if (tabId === 'evo') {
            evoContent.style.display = 'block';
            evoTab.classList.add('active');
        }
    };

    document.addEventListener('click', (event) => {
        if (event.target === modal) modal.style.display = 'none';
    });

    // Expose functions to the global scope for use in HTML
    window.filterPokemon = filterPokemon;
    window.openModal = openModal;
    window.showTab = showTab;
});

window.addEventListener("load", function() {
    setTimeout(function() {
        document.getElementById("loading-screen").style.display = "none";
        document.getElementById("content").style.display = "block";
    }, 2000); // 2000 Millisekunden = 2 Sekunden Verzögerung
});

