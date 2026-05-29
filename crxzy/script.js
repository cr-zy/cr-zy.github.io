const projectDirectory = [];
function add(name, link) {
    projectDirectory.push({ name: name.toUpperCase(), link: link });
}
add("Juwad Movie | Free Movie", "../free-movie");
add("Color Pick", "../color-pick")
add("DVD", "../dvd")
function buildDynamicPanels() {
    const projectContainer = document.getElementById('projectListContainer');
    projectContainer.innerHTML = projectDirectory.map((item, idx) => `
        <a href="${item.link}" class="flex items-center justify-between p-4 group hover:bg-zinc-900/60 transition duration-150 cursor-pointer text-xs">
            <div class="flex items-center space-x-3 truncate">
                <span class="text-zinc-600 group-hover:text-white font-bold transition">[0${idx + 1}]</span>
                <span class="text-zinc-300 group-hover:text-zinc-100 font-medium tracking-wide truncate transition">${item.name}</span>
            </div>
            <div class="flex items-center space-x-2 text-[10px] text-zinc-600 group-hover:text-white font-bold tracking-tighter ml-2 flex-shrink-0 transition">
                <span>[LAUNCH]</span>
            </div>
        </a>
    `).join('');
    document.getElementById('projectCounter').textContent = `[${String(projectDirectory.length).padStart(2, '0')}]`;
}
document.addEventListener('DOMContentLoaded', buildDynamicPanels);