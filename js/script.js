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
  showLoading(); // ⏳ tampilkan loading
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
  const data = await res.json();
  const allDetails = await Promise.all(
    data.results.map((p) => fetch(p.url).then((res) => res.json()))
  );
  allPokemonData = allDetails;
  renderPage(1);
  hideLoading(); // ✅ sembunyikan loading setelah selesai
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

async function searchPokemon() {
  const query = searchInput.value.trim().toLowerCase();

  if (!query) {
    // Jika kolom pencarian kosong → tampilkan ulang semua Pokémon
    currentData = allPokemonData;
    renderPage(1, currentData);
    return;
  }

  showLoading();

  // Jika pencarian berupa ID angka
  if (!isNaN(query)) {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      hideLoading();
      currentData = [data];
      renderPage(1, currentData); // hanya tampilkan 1 hasil
    } catch {
      hideLoading();
      pokedex.innerHTML = `<p style="color:red;text-align:center">No Pokémon found with ID "${query}"</p>`;
      document.getElementById("pagination").innerHTML = "";
    }
    return;
  }

  // Jika pencarian berupa nama (atau sebagian nama)
  const results = allPokemonData.filter((p) => p.name.includes(query));
  hideLoading();

  if (results.length > 0) {
    currentData = results; // Simpan hasil pencarian
    renderPage(1, currentData); // Tampilkan hasil pencarian saja
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

  // PREV
  const prev = document.createElement("button");
  prev.textContent = "PREV";
  prev.disabled = currentPage === 1;
  prev.onclick = () => renderPage(currentPage - 1);
  pagination.appendChild(prev);

  const maxVisible = 5;

  const addBtn = (page, active = false) => {
    const btn = document.createElement("button");
    btn.textContent = page;
    if (active) btn.classList.add("active");
    btn.onclick = () => renderPage(page);
    pagination.appendChild(btn);
  };

  const addDots = () => {
    const span = document.createElement("span");
    span.textContent = "...";
    pagination.appendChild(span);
  };

  // always show first
  addBtn(1, currentPage === 1);

  if (currentPage > 3) addDots();

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    addBtn(i, i === currentPage);
  }

  if (currentPage < totalPages - 2) addDots();

  if (totalPages > 1) {
    addBtn(totalPages, currentPage === totalPages);
  }

  // NEXT
  const next = document.createElement("button");
  next.textContent = "NEXT";
  next.disabled = currentPage === totalPages;
  next.onclick = () => renderPage(currentPage + 1);
  pagination.appendChild(next);
}

function showLoading() {
  document.getElementById("loading").style.display = "block";
  pokedex.style.display = "none";
}

function hideLoading() {
  document.getElementById("loading").style.display = "none";
  pokedex.style.display = "grid"; // atau "block" sesuai gaya layout kamu
}
