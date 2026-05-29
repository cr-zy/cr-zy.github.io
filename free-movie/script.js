const tmdbKeys = [
    'fb7bb23f03b6994dafc674c074d01761', 'e55425032d3d0f371fc776f302e7c09b',
    '8301a21598f8b45668d5711a814f01f6', '8cf43ad9c085135b9479ad5cf6bbcbda',
    'da63548086e399ffc910fbc08526df05', '13e53ff644a8bd4ba37b3e1044ad24f3',
    '269890f657dddf4635473cf4cf456576', 'a2f888b27315e62e471b2d587048f32e',
    '8476a7ab80ad76f0936744df0430e67c', '5622cafbfe8f8cfe358a29c53e19bba0',
    'ae4bd1b6fce2a5648671bfc171d15ba4', '257654f35e3dff105574f97fb4b97035',
    '2f4038e83265214a0dcd6ec2eb3276f5', '9e43f45f94705cc8e1d5a0400d19a7b7',
    'af6887753365e14160254ac7f4345dd2', '06f10fc8741a672af455421c239a1ffc',
    '09ad8ace66eec34302943272db0e8d2c'
];
let currentCategory = 'trending';
let currentPage = 1;
let isFetching = false;
let hasMoreContent = true;
const videoGrid = document.getElementById('videoGrid');
const playerModal = document.getElementById('playerModal');
const apiIframe = document.getElementById('apiIframe');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalVideoTitle = document.getElementById('modalVideoTitle');
const searchInput = document.getElementById('searchInput');
const searchDropdown = document.getElementById('searchDropdown');
const sectionTitle = document.getElementById('sectionTitle');
const scrollTrigger = document.getElementById('scrollTrigger');
function getActiveKey() {
    return tmdbKeys[Math.floor(Math.random() * tmdbKeys.length)];
}
async function fetchContentCatalog(append = false) {
    if (isFetching || (!append && !hasMoreContent)) return;
    isFetching = true;
    if (!append) {
        currentPage = 1;
        hasMoreContent = true;
        videoGrid.innerHTML = `<div class="text-zinc-600 text-xs font-mono py-12 col-span-full text-center tracking-widest animate-pulse">LOADING DATA PACKETS...</div>`;
    }
    scrollTrigger.textContent = "LOADING...";
    const key = getActiveKey();
    let url = `https://api.themoviedb.org/3/trending/all/week?api_key=${key}&page=${currentPage}`;
    if (currentCategory === 'top_rated') {
        url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${key}&page=${currentPage}`;
    } else if (currentCategory === 'movie') {
        url = `https://api.themoviedb.org/3/discover/movie?api_key=${key}&sort_by=popularity.desc&page=${currentPage}`;
    } else if (currentCategory === 'tv') {
        url = `https://api.themoviedb.org/3/discover/tv?api_key=${key}&sort_by=popularity.desc&page=${currentPage}`;
    }
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (!data.results || data.results.length === 0) {
            hasMoreContent = false;
            scrollTrigger.textContent = "END OF ACTIVE RECORDS";
            if (!append) videoGrid.innerHTML = `<div class="text-zinc-600 text-xs font-mono py-6 col-span-full text-center">EMPTY CATALOG</div>`;
            isFetching = false;
            return;
        }
        renderMatrix(data.results, append);
        if (currentPage >= data.total_pages) {
            hasMoreContent = false;
            scrollTrigger.textContent = "END OF ACTIVE RECORDS";
        } else {
            scrollTrigger.textContent = ""; 
        }
        currentPage++;
    } catch (error) {
        scrollTrigger.textContent = "ERR PACKET DATA DROP";
        if (!append) videoGrid.innerHTML = `<div class="text-zinc-600 text-xs font-mono py-6 col-span-full text-center">ERR CONNECTION FAILED</div>`;
    } finally {
        isFetching = false;
    }
}
function renderMatrix(items, append = false) {
    if (!append) videoGrid.innerHTML = '';
    const cleanItems = items.filter(i => i.title || i.name);
    cleanItems.forEach(item => {
        const title = item.title || item.name;
        const type = item.media_type || (currentCategory === 'tv' ? 'tv' : 'movie');
        const poster = item.poster_path 
            ? `https://image.tmdb.org/t/p/w342${item.poster_path}` 
            : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=342';
        const block = document.createElement('div');
        block.className = "bg-zinc-950 border border-zinc-900 p-2 flex flex-col justify-between group hover:border-zinc-500 transition duration-200 cursor-pointer text-left";
        block.innerHTML = `
            <div>
                <div class="relative aspect-[2/3] overflow-hidden bg-zinc-900 mb-2 grayscale group-hover:grayscale-0 transition duration-300">
                    <img src="${poster}" alt="Media Poster" class="w-full h-full object-cover" loading="lazy">
                </div>
                <h4 class="text-[11px] font-bold text-zinc-300 line-clamp-2 uppercase tracking-wide group-hover:text-white transition font-mono">${title}</h4>
            </div>
            <div class="mt-3 pt-2 border-t border-zinc-900 text-[10px] text-zinc-500 font-mono flex items-center justify-between uppercase">
                <span>${type === 'tv' ? 'SERIES' : 'MOVIE'}</span>
                <span class="text-zinc-400 group-hover:text-white font-bold transition">[LAUNCH]</span>
            </div>
        `;
        block.addEventListener('click', () => launchEmbedPlayer(item.id, title, type));
        videoGrid.appendChild(block);
    });
}
function launchEmbedPlayer(id, title, mediaType) {
    modalVideoTitle.textContent = `JUWAD MOVIE`;
    let finalUrl = "";
    if (mediaType === 'tv' || mediaType === 'series') {
        finalUrl = `https://www.vidking.net/embed/tv/${id}/1/1?color=0f0f0f&autoPlay=true&nextEpisode=true&episodeSelector=true`;
    } else {
        finalUrl = `https://www.vidking.net/embed/movie/${id}?color=0f0f0f&autoPlay=true&nextEpisode=true&episodeSelector=true`;
    }
    apiIframe.src = finalUrl;
    playerModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    searchDropdown.classList.add('hidden');
    searchInput.value = '';
}
function closeEmbedPlayer() {
    playerModal.classList.add('hidden');
    apiIframe.src = '';
    document.body.style.overflow = '';
}
function changeCategory(category) {
    if (currentCategory === category) return;
    currentCategory = category;
    const headings = { trending: "TRENDING NOW", top_rated: "TOP RATED TITLES", movie: "FEATURE MOVIES", tv: "TV AND ANIME" };
    sectionTitle.textContent = headings[category] || "// CATALOG";
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('bg-zinc-900', 'text-white', 'border-zinc-700', 'font-bold');
        btn.classList.add('text-zinc-400', 'hover:text-white', 'border-zinc-900', 'hover:border-zinc-700');
    });
    const activeBtn = document.getElementById(`btn-${category}`);
    if (activeBtn) {
        activeBtn.classList.remove('text-zinc-400', 'hover:text-white', 'border-zinc-900', 'hover:border-zinc-700');
        activeBtn.classList.add('bg-zinc-900', 'text-white', 'border-zinc-700', 'font-bold');
    }
    hasMoreContent = true;
    fetchContentCatalog(false);
}
window.addEventListener('scroll', () => {
    if (!hasMoreContent || isFetching) return;
    
    if ((window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 250)) {
        fetchContentCatalog(true);
    }
});
let searchClock;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchClock);
    const query = e.target.value.trim();
    if (!query) { 
        searchDropdown.classList.add('hidden'); 
        return; 
    }
    searchClock = setTimeout(async () => {
        const key = getActiveKey();
        const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${key}&query=${encodeURIComponent(query)}`;
        try {
            const res = await fetch(searchUrl);
            const data = await res.json();
            renderDropdownResults(data.results || []);
        } catch {
            console.log('fuck')
        }
    }, 300);
});
function renderDropdownResults(results) {
    searchDropdown.innerHTML = '';
    const targetedItems = results.filter(item => (item.media_type === 'movie' || item.media_type === 'tv') && (item.title || item.name)).slice(0, 8);
    if(targetedItems.length === 0) {
        searchDropdown.innerHTML = `<div class="p-3 text-xs text-zinc-600 uppercase tracking-wider font-mono">[NO MATCHING RECORDS]</div>`;
        searchDropdown.classList.remove('hidden');
        return;
    }
    targetedItems.forEach(item => {
        const title = item.title || item.name;
        const type = item.media_type;
        const releaseYear = (item.release_date || item.first_air_date || '').substring(0, 4);
        const yearLabel = releaseYear ? `[${releaseYear}]` : '';
        const thumbnail = item.backdrop_path 
            ? `https://image.tmdb.org/t/p/w92${item.backdrop_path}`
            : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=92';
        const row = document.createElement('div');
        row.className = "flex items-center space-x-3 p-2 hover:bg-zinc-900 cursor-pointer transition border-b border-zinc-900 last:border-0 font-mono";
        row.innerHTML = `
            <img src="${thumbnail}" class="w-12 h-8 object-cover bg-zinc-900 flex-shrink-0 grayscale">
            <div class="flex-1 min-w-0">
                <div class="text-[11px] font-bold text-zinc-300 uppercase truncate group-hover:text-white">${title} <span class="text-zinc-600 font-normal">${yearLabel}</span></div>
                <div class="text-[9px] text-zinc-500 font-medium tracking-wide uppercase mt-0.5">${type === 'tv' ? 'SERIES / ANIME' : 'MOVIE'}</div>
            </div>
        `;
        row.addEventListener('click', () => launchEmbedPlayer(item.id, title, type));
        searchDropdown.appendChild(row);
    });
    searchDropdown.classList.remove('hidden');
}
closeModalBtn.addEventListener('click', closeEmbedPlayer);
playerModal.addEventListener('click', (e) => { if (e.target === playerModal) closeEmbedPlayer(); });
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
        searchDropdown.classList.add('hidden');
    }
});
document.addEventListener('DOMContentLoaded', () => fetchContentCatalog(false));