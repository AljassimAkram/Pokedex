const BASE_URL = "https://pokeapi.co/api/v2/pokemon/";
const limit = 20;
let offset = 0;
let totalLoaded = 0;
const maxPokemons = 10000;
const POKEMON_CARDS_SECTION = document.getElementById("pokemon-cards-section");
let loadedPokemons = [];

const BASE_TYPE_ICON_URL = "https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/";
const pokemonTypes = ["normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"];
const typeIconMap = {};
for (let i = 0; i < pokemonTypes.length; i++) {
    const type = pokemonTypes[i];
    typeIconMap[type] = `${BASE_TYPE_ICON_URL}${type}.svg`;
}


const typeColorMap = {
    normal: "#A8A878", fire: "#F08030", water: "#6890F0", electric: "#F8D030",
    grass: "#78C850", ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0",
    ground: "#E0C068", flying: "#A890F0", psychic: "#F85888", bug: "#A8B820",
    rock: "#B8A038", ghost: "#705898", dragon: "#7038F8", dark: "#705848",
    steel: "#B8B8D0", fairy: "#EE99AC"
};