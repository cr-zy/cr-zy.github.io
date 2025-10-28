const apiKey = 'd1007bf32c19224b866b56f63c3bd4a4';
const elements = {
  mainContent: document.getElementById('mainContent'),
  player: document.getElementById('player'),
  playerTitle: document.getElementById('playerTitle'),
  playerSection: document.getElementById('playerSection'),
  episodePicker: document.getElementById('episodePicker'),
  seasonSelect: document.getElementById('seasonSelect'),
  episodeSelect: document.getElementById('episodeSelect'),
  searchBox: document.getElementById('searchBox')
};
const categories = [
  { title: "Trending Movies", url: `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`, type: 'movie' },
  { title: "Trending TV Shows", url: `https://api.themoviedb.org/3/trending/tv/week?api_key=${apiKey}`, type: 'tv' },
  { title: "Popular Movies", url: `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`, type: 'movie' },
  { title: "Popular TV Shows", url: `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}`, type: 'tv' }
];
async function fetchWithErrorHandling(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error(`Fetch error: ${error.message}`);
    return null;
  }
}
function createCard(item, type) {
  const imgPath = item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : '';
  const card = document.createElement('div');
  card.className = 'card';
  const name = item.title || item.name;
  const tag = type === 'tv' ? 'Series' : 'Movie';
  card.innerHTML = `
    <img src="${imgPath}" alt="${name}" loading="lazy">
    <div class="card-content">
      <div class="title">${name}</div>
      <div class="tag">${tag}</div>
    </div>
  `;
  card.addEventListener('click', () => loadPlayer(item.id, type, name));
  return card;
}
function renderSection(title, items, type) {
  if (!items?.length) {
    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.textContent = 'No results found';
    elements.mainContent.appendChild(noResults);
    return;
  }
  const section = document.createElement('div');
  section.innerHTML = `<h2>${title}</h2>`;
  const gallery = document.createElement('div');
  gallery.className = 'gallery';
  items
    .filter(item => item.poster_path)
    .forEach(item => gallery.appendChild(createCard(item, type === 'mixed' ? (item.media_type || type) : type)));
  section.appendChild(gallery);
  elements.mainContent.appendChild(section);
}
async function loadCategories() {
  elements.mainContent.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  await Promise.all(categories.map(async cat => {
    const data = await fetchWithErrorHandling(cat.url);
    if (data?.results) renderSection(cat.title, data.results, cat.type);
  }));
}
async function loadPlayer(id, type, name) {
  elements.playerSection.style.display = 'block';
  elements.playerTitle.textContent = name;
  elements.episodePicker.innerHTML = '';
  if (type === 'tv') {
    const data = await fetchWithErrorHandling(`https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}`);
    if (!data) return;
    elements.seasonSelect.innerHTML = '<option value="" disabled selected>Select Season</option>';
    elements.seasonSelect.style.display = 'inline-block';
    elements.episodeSelect.style.display = 'inline-block';
    elements.episodeSelect.innerHTML = '<option value="" disabled selected>Select Episode</option>';
    data.seasons
      .filter(season => season.season_number !== 0)
      .forEach(season => {
        const opt = new Option(`Season ${season.season_number}`, season.season_number);
        elements.seasonSelect.appendChild(opt);
      });
    elements.seasonSelect.onchange = async () => {
      const seasonNumber = elements.seasonSelect.value;
      if (!seasonNumber) return;
      const seasonData = await fetchWithErrorHandling(`https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}?api_key=${apiKey}`);
      if (!seasonData) return;
      elements.episodeSelect.innerHTML = '<option value="" disabled selected>Select Episode</option>';
      seasonData.episodes.forEach(ep => {
        const opt = new Option(`Episode ${ep.episode_number} - ${ep.name}`, ep.episode_number);
        elements.episodeSelect.appendChild(opt);
      });
    };
    elements.episodeSelect.onchange = () => {
      const episodeNumber = elements.episodeSelect.value;
      const seasonNumber = elements.seasonSelect.value;
      if (episodeNumber && seasonNumber) {
        elements.player.src = `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${seasonNumber}&episode=${episodeNumber}`;
        elements.player.scrollIntoView({ behavior: 'smooth' });
      }
    };
  } else {
    elements.seasonSelect.style.display = 'none';
    elements.episodeSelect.style.display = 'none';
    elements.player.src = `https://vidsrc.xyz/embed/movie?tmdb=${id}`;
    elements.player.scrollIntoView({ behavior: 'smooth' });
  }
}
async function searchMovies() {
  const query = elements.searchBox.value.trim();
  if (query.length < 2) {
    await loadCategories();
    return;
  }
  elements.mainContent.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  const data = await fetchWithErrorHandling(`https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}`);
  if (data?.results) renderSection("Search Results", data.results, 'mixed');
}
let searchTimeout;
elements.searchBox.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(searchMovies, 300);
});
window.addEventListener('scroll', function() {
  const header = document.querySelector('header');
  if (window.scrollY > 50) {
    header.style.backgroundColor = 'rgba(10, 10, 10, 0.95)';
    header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.5)';
  } else {
    header.style.backgroundColor = 'rgba(10, 10, 10, 0.9)';
    header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
  }
});
loadCategories();