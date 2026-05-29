
const container = document.getElementById('viewportContainer');
const logo = document.getElementById('bouncingLogo');
let posX = 0;
let posY = 0;
let velX = 2.0;
let velY = 2.0;
function shiftElementToRandomColor() {
    const randomHexValue = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    logo.style.color = randomHexValue;
}
function initializePhysicsEngine() {
    const boundaryWidth = container.clientWidth;
    const boundaryHeight = container.clientHeight;
    const logoWidth = logo.offsetWidth;
    const logoHeight = logo.offsetHeight;
    posX = (boundaryWidth / 2) - (logoWidth / 2);
    posY = (boundaryHeight / 2) - (logoHeight / 2);
    let baseVelocity = 2.0;
    const urlParameters = new URLSearchParams(window.location.search);
    const targetSpeedParam = urlParameters.get('speed');
    if (targetSpeedParam !== null) {
        const parsedSpeedValue = parseFloat(targetSpeedParam);
        if (!isNaN(parsedSpeedValue) && parsedSpeedValue !== 0) {
            baseVelocity = parsedSpeedValue;
        }
    }
    const randomAngle = Math.random() * Math.PI * 2;
    velX = Math.cos(randomAngle) * baseVelocity;
    velY = Math.sin(randomAngle) * baseVelocity;
}
function processPhysicsTick() {
    const boundaryWidth = container.clientWidth;
    const boundaryHeight = container.clientHeight;
    const logoWidth = logo.offsetWidth;
    const logoHeight = logo.offsetHeight;
    posX += velX;
    posY += velY;
    let hitRegistered = false;
    if (posX + logoWidth >= boundaryWidth) {
        posX = boundaryWidth - logoWidth;
        velX = -Math.abs(velX);
        hitRegistered = true;
    } else if (posX <= 0) {
        posX = 0;
        velX = Math.abs(velX);
        hitRegistered = true;
    }
    if (posY + logoHeight >= boundaryHeight) {
        posY = boundaryHeight - logoHeight;
        velY = -Math.abs(velY);
        hitRegistered = true;
    } else if (posY <= 0) {
        posY = 0;
        velY = Math.abs(velY);
        hitRegistered = true;
    }
    if (hitRegistered) {
        shiftElementToRandomColor();
    }
    logo.style.transform = `translate3d(${posX}px, ${posY}px, 0px)`;
    requestAnimationFrame(processPhysicsTick);
}
document.addEventListener('DOMContentLoaded', () => {
    shiftElementToRandomColor();
    setTimeout(() => {
        initializePhysicsEngine();
        processPhysicsTick();
    }, 50);
});
window.addEventListener('resize', () => {
    const boundaryWidth = container.clientWidth;
    const boundaryHeight = container.clientHeight;
    const logoWidth = logo.offsetWidth;
    const logoHeight = logo.offsetHeight;

    if (posX + logoWidth > boundaryWidth) posX = boundaryWidth - logoWidth;
    if (posY + logoHeight > boundaryHeight) posY = boundaryHeight - logoHeight;
});