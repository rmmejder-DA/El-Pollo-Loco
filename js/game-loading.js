/*** Preloads one image and resolves even when it fails.
 * @param {string} src - The image source path.
 * @returns {Promise<void>} A promise that resolves after loading.*/
function preloadImage(src) {
    return new Promise((resolve) => {
        const image = new Image();
        image.onload = resolve;
        image.onerror = resolve;
        image.src = src;
    });
}

/*** Waits for a fixed amount of milliseconds.
 * @param {number} ms - The number of milliseconds to wait.
 * @returns {Promise<void>} A promise that resolves after the delay.*/
function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/*** Starts the loading Pepe walk animation.*/
function startLoadingAnimation() {
    const loadingPepe = document.getElementById("loadingPepe");
    let imageIndex = 0;
    clearInterval(loadingPepeAnimation);
    if (!loadingPepe) {
        return;
    }
    loadingPepe.src = LOADING_PEPE_IMAGES[imageIndex];
    loadingPepeAnimation = createLoadingAnimationInterval(loadingPepe, imageIndex);
}

/*** Creates the loading animation interval.
 * @param {HTMLImageElement} loadingPepe - The loading image element.
 * @param {number} imageIndex - The starting image index.
 * @returns {number} The interval id.*/
function createLoadingAnimationInterval(loadingPepe, imageIndex) {
    return setInterval(() => {
        imageIndex = (imageIndex + 1) % LOADING_PEPE_IMAGES.length;
        loadingPepe.src = LOADING_PEPE_IMAGES[imageIndex];
    }, 90);
}

/*** Stops the loading Pepe animation.*/
function stopLoadingAnimation() {
    clearInterval(loadingPepeAnimation);
    loadingPepeAnimation = null;
}

/*** Shows or hides the loading screen.
 * @param {boolean} isVisible - Whether loading should be visible.*/
function setLoadingVisible(isVisible) {
    const loadingScreen = document.getElementById("loadingScreen");
    loadingShown = isVisible;
    loadingScreen?.classList.toggle("hidden", !isVisible);
    updateLoadingAnimation(isVisible);
}

/*** Starts or stops loading animation for visibility.
 * @param {boolean} isVisible - Whether loading is visible.*/
function updateLoadingAnimation(isVisible) {
    if (isVisible) {
        startLoadingAnimation();
    } else {
        stopLoadingAnimation();
    }
}

/*** Displays the loading screen and preloads required assets.
 * @returns {Promise<void>} A promise that resolves after loading.*/
async function showLoadingScreen() {
    setLoadingVisible(true);
    await Promise.all([preloadLoadingImages(), wait(LOADING_DURATION)]);
    setLoadingVisible(false);
}

/*** Preloads all loading screen assets.
 * @returns {Promise<Array<void>>} A promise for all preload tasks.*/
function preloadLoadingImages() {
    return Promise.all(LOADING_PRELOAD_IMAGES.map((src) => preloadImage(src)));
}
