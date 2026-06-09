/*** Requests fullscreen on supported mobile start viewports.*/
function requestFullscreenOnMobileStart() {
    canvasMobileControlsActive = isStartFullscreenViewport();
    if (canvasMobileControlsActive) {
        openFullscreen(document.getElementById("fullscreen"));
    }
}

/*** Opens fullscreen mode for the given target.
 * @param {HTMLElement} fullscreenTarget - The element to open fullscreen for.
 * @returns {Promise<void>} A promise-like fullscreen result.*/
function openFullscreen(fullscreenTarget = canvas) {
    if (!fullscreenTarget) {
        return Promise.resolve();
    }
    return requestFullscreenForTarget(fullscreenTarget);
}

/*** Requests fullscreen through the available browser API.
 * @param {HTMLElement} target - The fullscreen target.
 * @returns {Promise<void>} A promise-like fullscreen result.*/
function requestFullscreenForTarget(target) {
    if (target.requestFullscreen) {
        return target.requestFullscreen().catch(() => { });
    }
    requestLegacyFullscreen(target);
    return Promise.resolve();
}

/*** Requests fullscreen through legacy browser APIs.
 * @param {HTMLElement} target - The fullscreen target.*/
function requestLegacyFullscreen(target) {
    if (target.webkitRequestFullscreen) {
        target.webkitRequestFullscreen();
    } else if (target.msRequestFullscreen) {
        target.msRequestFullscreen();
    }
}

/*** Closes fullscreen mode through the available browser API.*/
function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else {
        closeLegacyFullscreen();
    }
}

/*** Closes fullscreen through legacy browser APIs.*/
function closeLegacyFullscreen() {
    if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

/*** Toggles the desktop keyboard information panel.*/
function helpMe() {
    toggleKeyboardInfo();
}

/*** Toggles the keyboard information screen.*/
function toggleKeyboardInfo() {
    document.getElementById("keyboardInfo")?.classList.toggle("hidden");
}

/*** Toggles the mobile help overlay.*/
function toggleMobileHelp() {
    document.getElementById("mobileTouchKeyInfo")?.classList.toggle("hidden");
}

/*** Builds the canvas HUD button definitions.
 * @param {HTMLCanvasElement} targetCanvas - The target canvas.
 * @returns {Array<object>} The HUD buttons.*/
function getCanvasHudButtons(targetCanvas = canvas) {
    if (!targetCanvas) {
        return [];
    }
    const layout = getCanvasHudLayout();
    return buildCanvasHudButtons(targetCanvas, layout);
}

/*** Calculates the canvas HUD button layout.
 * @returns {object} The HUD layout values.*/
function getCanvasHudLayout() {
    return { size: 46, gap: 12, edge: 18, y: 18 };
}

/*** Creates the HUD button list.
 * @param {HTMLCanvasElement} targetCanvas - The target canvas.
 * @param {object} layout - The HUD layout values.
 * @returns {Array<object>} The HUD button definitions.*/
function buildCanvasHudButtons(targetCanvas, layout) {
    const { size, gap, edge, y } = layout;
    return [
        { action: "mute", x: targetCanvas.width - edge - (size * 2) - gap, y, size },
        { action: "pause", x: targetCanvas.width - edge - size, y, size }
    ];
}

/*** Finds a HUD button under a canvas point.
 * @param {object} point - The canvas point.
 * @returns {object|undefined} The matching HUD button.*/
function getCanvasHudButtonAtPoint(point) {
    return getCanvasHudButtons().find((button) => isPointInButton(point, button));
}
