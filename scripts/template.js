function generatePokemonHeaderHTML(pokemon) {
    return `
        <div class="pokemon-header">
            <span class="pokemon-id">#${pokemon.id}</span>
            <span class="pokemon-name">${capitalize(pokemon.name)}</span>
        </div>
    `;
}


function generatePokemonImageHTML(pokemon) {
    return `
        <div class="pokemon-image">
            <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
        </div>
    `;
}


function generateModalHeader(pokemon) {
    return `
        <div class="modal-header">
            <span class="pokemon-id">#${pokemon.id}</span>
            <span class="pokemon-name">${capitalize(pokemon.name)}</span>
            <div class="pokemon-image">
                <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
            </div>
        </div>
    `;
}


function generateTabsHTML(mainContent, statsContent, evolutionContent) {
    return `
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
}


function createPokemonCard(pokemon, index) {
    const firstType = pokemon.types[0].type.name;
    const backgroundColor = typeColorMap[firstType] || "#ccc";
    const typesHTML = createTypeHTML(pokemon.types);

    return `
        <div class="pokemon-container" onclick="toggleModal(${index})" style="background-color: ${backgroundColor}">
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


function generateStatsHTML(stats) {
    let statsContent = "";
    for (const stat of stats) {
        statsContent += `
            <p class="stat-item">
                <span class="stat-name">${capitalize(stat.stat.name)}:</span>
                <progress class="stat-bar" value="${stat.base_stat}" max="150"></progress>
            </p>`;
    }
    return statsContent;
}


function generateEvolutionHTML(evolutionData) {
    let evolutionContent = `<div class="evo-chain">`;
    for (let i = 0; i < evolutionData.length; i++) {
        const evo = evolutionData[i];
        evolutionContent += `
            <div class="evo-item">
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png" alt="${evo.name}">
                <span>${capitalize(evo.name)}</span>
            </div>`;
        if (i < evolutionData.length - 1) evolutionContent += `<span>></span>`;
    }
    return evolutionContent + `</div>`;
}


function generateMainHTML(pokemon) {
    return `
        ${generateStatBlock("Height", `${pokemon.height / 10} m`)}
        ${generateStatBlock("Weight", `${pokemon.weight / 10} kg`)}
        ${generateStatBlock("Base experience", pokemon.base_experience)}
        ${generateStatBlock("Abilities", generateAbilitiesHTML(pokemon.abilities))}
    `;
}


function generateStatBlock(label, value) {
    return `
        <div class="stat-block">
            <p class="stat-before">${label}</p>
            <p class="stat-value">${value}</p>
        </div>`;
}


function generateTabsHTML(mainContent, statsContent, evolutionContent) {
    return `
        <div class="tabs">
            <button class="tab-btn" onclick="showTab('main')">Main</button>
            <button class="tab-btn" onclick="showTab('stats')">Stats</button>
            <button class="tab-btn" onclick="showTab('evo')">Evo Chain</button>
        </div>
        <div id="tab-content">
            <div id="main" class="tab-content">${mainContent}</div>
            <div id="stats" class="tab-content hidden">${statsContent}</div>
            <div id="evo" class="tab-content hidden">${evolutionContent}</div>
        </div>`;
}


function generateHeaderHTML(pokemon) {
    return `
        <div class="modal-header">
            <span class="pokemon-id">#${pokemon.id}</span>
            <span class="pokemon-name">${capitalize(pokemon.name)}</span>
            <div class="pokemon-image">
                <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
            </div>
        </div>`;
}