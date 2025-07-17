let allPokemonData = [];
let currentPage = 1;
const itemsPerPage = 10;
const pokedex = document.getElementById("pokedex");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

const typeColors = {
  fire: "#f08030",
  water: "#6890f0",
  grass: "#78c850",
  poison: "#a040a0",
  electric: "#f8d030",
  bug: "#a8b820",
  flying: "#a890f0",
  ground: "#e0c068",
  rock: "#b8a038",
  psychic: "#f85888",
  ice: "#98d8d8",
  dragon: "#7038f8",
  dark: "#705848",
  steel: "#b8b8d0",
  fairy: "#ee99ac",
  ghost: "#705898",
  fighting: "#c03028",
  normal: "#a8a878",
};

async function fetchPokemonList(limit = 1000) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
  const data = await res.json();
  const allDetails = await Promise.all(
    data.results.map((p) => fetch(p.url).then((res) => res.json()))
  );
  allPokemonData = allDetails;
  renderPage(1);
}

function renderPokemons(pokemonList) {
  pokedex.innerHTML = "";
  pokemonList.forEach((pokemon) => {
    const card = document.createElement("div");
    card.className = "pokemon-card";
    card.innerHTML = `
      <img src="${
        pokemon.sprites.other["official-artwork"].front_default
      }" alt="${pokemon.name}" />
      <h2>${pokemon.name}</h2>
      <div class="pokemon-id">#${pokemon.id.toString().padStart(3, "0")}</div>
      <div class="types">
        ${pokemon.types
          .map(
            (t) =>
              `<span class="type" style="background:${
                typeColors[t.type.name] || "#999"
              }">${t.type.name}</span>`
          )
          .join("")}
      </div>
    `;
    card.addEventListener("click", () => showPokemonDetail(pokemon));
    pokedex.appendChild(card);
  });
}

function searchPokemon() {
  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    renderPage(1); // reset
    return;
  }

  if (!isNaN(query)) {
    fetch(`https://pokeapi.co/api/v2/pokemon/${query}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        renderPokemons([data]);
        document.getElementById("pagination").innerHTML = "";
      })
      .catch(() => {
        pokedex.innerHTML = `<p style="color:red;text-align:center">No Pokémon found with ID "${query}"</p>`;
      });
    return;
  }

  const results = allPokemonData.filter((p) => p.name.includes(query));
  if (results.length > 0) {
    renderPage(1, results); // hasil pencarian dipaginasi juga
  } else {
    pokedex.innerHTML = `<p style="color:red;text-align:center">No Pokémon found with name "${query}"</p>`;
    document.getElementById("pagination").innerHTML = "";
  }
}

searchBtn.addEventListener("click", searchPokemon);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchPokemon();
});

document.addEventListener("DOMContentLoaded", () => {
  fetchPokemonList();
});

function showPokemonDetail(pokemon) {
  const modal = document.getElementById("pokemonModal");
  const inner = document.getElementById("modalInner");
  const closeBtn = document.querySelector(".close");

  inner.innerHTML = `
    <h2>${pokemon.name}</h2>
    <div class="types" style="margin-bottom: 15px;">
      ${pokemon.types
        .map(
          (t) =>
            `<span class="type" style="background:${typeColors[t.type.name]}">${
              t.type.name
            }</span>`
        )
        .join("")}
    </div>
    <div style="display: flex; gap: 20px; flex-wrap: wrap;">
      <div style="flex: 1; text-align: center;">
        <img src="${
          pokemon.sprites.other["official-artwork"].front_default
        }" alt="${pokemon.name}">
      </div>
      <div style="flex: 1;" class="stats">
        <h3>STATS</h3>
        ${pokemon.stats
          .map(
            (s) => `
          <div class="stat-line">
            <span>${s.stat.name}</span>
            <div class="stat-bar">
              <div class="stat-bar-inner" style="width:${
                s.base_stat / 2
              }%;"></div>
            </div>
            <span>${s.base_stat}</span>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
    <div class="abilities">
      <h3>ABILITIES</h3>
      ${pokemon.abilities
        .map(
          (a) => `
        <span class="ability-badge">${a.ability.name}</span>
      `
        )
        .join("")}
    </div>
  `;

  modal.style.display = "flex";

  closeBtn.onclick = () => (modal.style.display = "none");
  window.onclick = (e) => {
    if (e.target == modal) modal.style.display = "none";
  };
}

function renderPage(page, data = allPokemonData) {
  currentPage = page;
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageData = data.slice(start, end);
  renderPokemons(pageData);
  renderPagination(data.length);
}

function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  // Prev button
  const prev = document.createElement("button");
  prev.textContent = "PREV";
  prev.disabled = currentPage === 1;
  prev.onclick = () => renderPage(currentPage - 1);
  pagination.appendChild(prev);

  // First page
  if (currentPage > 3) {
    addPageButton(1);
    if (currentPage > 4) {
      addDots();
    }
  }

  // Page numbers around current
  for (
    let i = Math.max(1, currentPage - 2);
    i <= Math.min(totalPages, currentPage + 2);
    i++
  ) {
    addPageButton(i, i === currentPage);
  }

  // Last page
  if (currentPage < totalPages - 2) {
    if (currentPage < totalPages - 3) {
      addDots();
    }
    addPageButton(totalPages);
  }

  // Next button
  const next = document.createElement("button");
  next.textContent = "NEXT";
  next.disabled = currentPage === totalPages;
  next.onclick = () => renderPage(currentPage + 1);
  pagination.appendChild(next);

  function addPageButton(page, isActive = false) {
    const btn = document.createElement("button");
    btn.textContent = page;
    if (isActive) btn.classList.add("active");
    btn.onclick = () => renderPage(page);
    pagination.appendChild(btn);
  }

  function addDots() {
    const dots = document.createElement("span");
    dots.textContent = "...";
    dots.style.margin = "0 5px";
    pagination.appendChild(dots);
  }
}
