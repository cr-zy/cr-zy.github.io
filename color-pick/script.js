let currentH = 217;
let currentS = 76;
let currentV = 96;
const colorCanvas = document.getElementById('colorCanvas');
const ctxColor = colorCanvas.getContext('2d');
const hueCanvas = document.getElementById('hueCanvas');
const ctxHue = hueCanvas.getContext('2d');
const canvasMarker = document.getElementById('canvasMarker');
const hueMarker = document.getElementById('hueMarker');
function initializeCanvasContext() {
    colorCanvas.width = 256;
    colorCanvas.height = 256;
    hueCanvas.width = 256;
    hueCanvas.height = 24;
    renderHueTrack();
    updateUIByHSV();
}
function renderHueTrack() {
    ctxHue.clearRect(0, 0, hueCanvas.width, hueCanvas.height);
    const gradient = ctxHue.createLinearGradient(0, 0, hueCanvas.width, 0);
    for (let i = 0; i <= 360; i += 10) {
        gradient.addColorStop(i / 360, `hsl(${i}, 100%, 50%)`);
    }
    ctxHue.fillStyle = gradient;
    ctxHue.fillRect(0, 0, hueCanvas.width, hueCanvas.height);
}
function renderColorPad() {
    ctxColor.clearRect(0, 0, colorCanvas.width, colorCanvas.height);
    ctxColor.fillStyle = `hsl(${currentH}, 100%, 50%)`;
    ctxColor.fillRect(0, 0, colorCanvas.width, colorCanvas.height);
    const whiteGrad = ctxColor.createLinearGradient(0, 0, colorCanvas.width, 0);
    whiteGrad.addColorStop(0, 'rgba(255,255,255,1)');
    whiteGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctxColor.fillStyle = whiteGrad;
    ctxColor.fillRect(0, 0, colorCanvas.width, colorCanvas.height);
    const blackGrad = ctxColor.createLinearGradient(0, 0, 0, colorCanvas.height);
    blackGrad.addColorStop(0, 'rgba(0,0,0,0)');
    blackGrad.addColorStop(1, 'rgba(0,0,0,1)');
    ctxColor.fillStyle = blackGrad;
    ctxColor.fillRect(0, 0, colorCanvas.width, colorCanvas.height);
}
function hsvToRgb(h, s, v) {
    s /= 100;
    v /= 100;
    let c = v * s;
    let x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let m = v - c;
    let r = 0, g = 0, b = 0;
    if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
    else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
    else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
    else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
    else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
    else if (h >= 300 && h <= 360) { r = c; g = 0; b = x; }
    return [
        Math.round((r + m) * 255),
        Math.round((g + m) * 255),
        Math.round((b + m) * 255)
    ];
}
function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let d = max - min;
    let h, s = (max === 0 ? 0 : d / max), v = max;
    if (max === min) { h = 0; }
    else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 60 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
}
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}
function hexToRgb(hex) {
    let c = hex.replace(/^#/, '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    let num = parseInt(c, 16);
    return (c.length === 6) ? [num >> 16 & 255, num >> 8 & 255, num & 255] : null;
}
function updateUIByHSV() {
    renderColorPad();
    const [r, g, b] = hsvToRgb(currentH, currentS, currentV);
    const hex = rgbToHex(r, g, b);
    document.getElementById('previewBlock').style.backgroundColor = hex;
    document.getElementById('hexBadge').textContent = hex;
    document.getElementById('hexLabel').textContent = hex;
    document.getElementById('hexInput').value = hex.toLowerCase();
    document.getElementById('rgbStringInput').value = `rgb(${r},${g},${b})`;
    document.getElementById('hsvStringInput').value = `hsv(${currentH},${currentS}%,${currentV}%)`;
    document.getElementById('rgbLabelDisplay').textContent = `R:${r} G:${g} B:${b}`;
    document.getElementById('hsvLabelDisplay').textContent = `H:${currentH}° S:${currentS}% V:${currentV}%`;
    updateSliderAndInputs('R', r);
    updateSliderAndInputs('G', g);
    updateSliderAndInputs('B', b);
    updateSliderAndInputs('H', currentH);
    updateSliderAndInputs('S', currentS);
    updateSliderAndInputs('V', currentV);
    hueMarker.style.left = `${(currentH / 360) * 100}%`;
    canvasMarker.style.left = `${(currentS / 100) * 100}%`;
    canvasMarker.style.top = `${((100 - currentV) / 100) * 100}%`;
}
function updateSliderAndInputs(prefix, val) {
    const slider = document.getElementById(`slider${prefix}`);
    const input = document.getElementById(`input${prefix}`);
    if (slider && slider.value != val) slider.value = val;
    if (input && input.value != val) input.value = val;
}
function bindControllers() {
    ['R', 'G', 'B', 'H', 'S', 'V'].forEach(id => {
        const slider = document.getElementById(`slider${id}`);
        const input = document.getElementById(`input${id}`);
        slider.addEventListener('input', (e) => handleSliderChange(id, parseInt(e.target.value)));
        input.addEventListener('change', (e) => {
            let val = parseInt(e.target.value) || 0;
            let max = id === 'H' ? 360 : (['S', 'V'].includes(id) ? 100 : 255);
            val = Math.max(0, Math.min(max, val));
            handleSliderChange(id, val);
        });
    });
    document.getElementById('hexInput').addEventListener('change', (e) => {
        const rgb = hexToRgb(e.target.value.trim());
        if (rgb) {
            const [h, s, v] = rgbToHsv(...rgb);
            currentH = h; currentS = s; currentV = v;
            updateUIByHSV();
        }
    });
    setupCanvasDragging(colorCanvas, (x, y, w, h) => {
        currentS = Math.round((x / w) * 100);
        currentV = Math.round(100 - ((y / h) * 100));
        currentS = Math.max(0, Math.min(100, currentS));
        currentV = Math.max(0, Math.min(100, currentV));
        updateUIByHSV();
    });
    setupCanvasDragging(hueCanvas, (x, y, w, h) => {
        currentH = Math.round((x / w) * 360);
        currentH = Math.max(0, Math.min(360, currentH));
        updateUIByHSV();
    });
}
function handleSliderChange(id, val) {
    if (['H', 'S', 'V'].includes(id)) {
        if (id === 'H') currentH = val;
        if (id === 'S') currentS = val;
        if (id === 'V') currentV = val;
    } else {
        const r = id === 'R' ? val : parseInt(document.getElementById('sliderR').value);
        const g = id === 'G' ? val : parseInt(document.getElementById('sliderG').value);
        const b = id === 'B' ? val : parseInt(document.getElementById('sliderB').value);
        const [h, s, v] = rgbToHsv(r, g, b);
        currentH = h; currentS = s; currentV = v;
    }
    updateUIByHSV();
}
function setupCanvasDragging(canvas, callback) {
    let isDragging = false;
    const processEvent = (e) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        callback(x, y, rect.width, rect.height);
    };
    const start = (e) => { isDragging = true; processEvent(e); };
    const move = (e) => { if (isDragging) { e.preventDefault(); processEvent(e); } };
    const stop = () => { isDragging = false; };
    canvas.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop);
    canvas.addEventListener('touchstart', start, { passive: false });
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', stop);
}
function copyStringToClipboard(id) {
    const el = document.getElementById(id);
    if (el) {
        el.select();
        navigator.clipboard.writeText(el.value);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    initializeCanvasContext();
    bindControllers();
});