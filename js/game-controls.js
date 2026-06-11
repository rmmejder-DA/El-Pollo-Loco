/*** Shows or hides the fullscreen button.
 * @param {boolean} isVisible - Whether the button should be visible.*/
function setFullscreenButtonVisible(isVisible) {
    const button = document.getElementById("fullscreenButton");
    button?.classList.toggle("hidden", !isVisible || !canUseDesktopFullscreen());
}

/*** Registers keyboard information interactions.*/
function initKeyboardInfo() {
    const helpContainer = document.getElementById("helpMeContainer");
    if (!helpContainer) {return;}
    helpContainer.addEventListener("click", toggleKeyboardInfo);
    helpContainer.addEventListener("keydown", handleKeyboardInfoKeydown);
}

/*** Toggles keyboard information for keyboard activation.
 * @param {KeyboardEvent} event - The keyboard event.*/
function handleKeyboardInfoKeydown(event) {
    if (event.key !== "Enter" && event.key !== " ") {
        return;}
    event.preventDefault();
    toggleKeyboardInfo();
}

/*** Shows or hides touch controls below the canvas.
 * @param {boolean} isVisible - Whether mobile controls should be visible.*/
function setMobileControlsVisible(isVisible) {
    const controls = document.getElementById("mobileControls");
    if (!controls) {return;}
    controls.classList.toggle("hidden", !isVisible || shouldUseCanvasMobileControls());
    resetMobileInputWhenHidden(isVisible);
}

/*** Resets mobile input when controls are hidden.
 * @param {boolean} isVisible - Whether controls are visible.*/
function resetMobileInputWhenHidden(isVisible) {
    if (isVisible) {return;}
    resetCanvasMobileControls();
    keyboard.reset();
    syncWalkingAudioFromInput();
}

/*** Binds one touch button to a keyboard action.
 * @param {string} buttonId - The button element id.
 * @param {string} key - The keyboard action name.*/
function bindTouchButton(buttonId, key) {
    const button = document.getElementById(buttonId);
    if (!button) {return;}
    bindTouchStart(button, key);
    bindTouchEnd(button, key);
}

/*** Binds the touch start event for a mobile button.
 * @param {HTMLElement} button - The touch button.
 * @param {string} key - The keyboard action name.*/
function bindTouchStart(button, key) {
    button.addEventListener("touchstart", (event) => {
        event.preventDefault();
        setKeyboardFlag(key, true);
    }, { passive: false });
}

/*** Binds touch end events for a mobile button.
 * @param {HTMLElement} button - The touch button.
 * @param {string} key - The keyboard action name.*/
function bindTouchEnd(button, key) {
    ["touchend", "touchcancel"].forEach((eventName) => {
        button.addEventListener(eventName, (event) => handleTouchEnd(event, key), { passive: false });
    });
}

/*** Releases one touch button action.
 * @param {TouchEvent} event - The touch event.
 * @param {string} key - The keyboard action name.*/
function handleTouchEnd(event, key) {
    event.preventDefault();
    setKeyboardFlag(key, false);
}

/*** Initializes DOM based mobile controls.*/
function initMobileControls() {
    bindTouchButton("mobileLeft", "left");
    bindTouchButton("mobileRight", "right");
    bindTouchButton("mobileJump", "space");
    bindTouchButton("mobileThrow", "D");
}

/*** Builds the canvas action button definitions.
 * @param {HTMLCanvasElement} targetCanvas - The target canvas.
 * @returns {Array<object>} The canvas control buttons.*/
function getCanvasMobileControlButtons(targetCanvas = canvas) {
    if (!targetCanvas) {
        return [];}
    const layout = getCanvasControlLayout(targetCanvas);
    return buildCanvasMobileButtons(targetCanvas, layout);
}

/*** Calculates the shared canvas control layout.
 * @param {HTMLCanvasElement} targetCanvas - The target canvas.
 * @returns {object} The layout values.*/
function getCanvasControlLayout(targetCanvas) {
    const size = 58;
    const gap = 14;
    const edge = 18;
    return { size, gap, edge, y: targetCanvas.height - edge - size };
}

/*** Creates the canvas mobile button list.
 * @param {HTMLCanvasElement} targetCanvas - The target canvas.
 * @param {object} layout - The layout values.
 * @returns {Array<object>} The button definitions.*/
function buildCanvasMobileButtons(targetCanvas, layout) {
    const { size, gap, edge, y } = layout;
    return [
        { key: "left", label: "‹", x: edge, y, size },
        { key: "right", label: "›", x: edge + size + gap, y, size },
        { key: "space", image: "jump", x: targetCanvas.width - edge - (size * 2) - gap, y, size },
        { key: "D", image: "throw", x: targetCanvas.width - edge - size, y, size }
    ];
}

/*** Converts a pointer event to canvas coordinates.
 * @param {PointerEvent} event - The pointer event.
 * @returns {object} The canvas point.*/
function getCanvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (event.clientX - rect.left) * (canvas.width / rect.width),
        y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
}

/*** Checks whether a point is inside a button.
 * @param {object} point - The canvas point.
 * @param {object} button - The button definition.
 * @returns {boolean} True when the point is inside.*/
function isPointInButton(point, button) {
    return point.x >= button.x && point.x <= button.x + button.size &&
        point.y >= button.y && point.y <= button.y + button.size;
}

/*** Finds a mobile control under a canvas point.
 * @param {object} point - The canvas point.
 * @returns {object|undefined} The matching button.*/
function getCanvasControlAtPoint(point) {
    return getCanvasMobileControlButtons().find((button) => isPointInButton(point, button));
}

/*** Syncs active canvas pointers into keyboard state.*/
function syncCanvasPointerKeys() {
    keyboard.setPressedKeys(activeCanvasPointers.values());
    syncWalkingAudioFromInput();
}

/*** Handles pointer down events on the canvas.
 * @param {PointerEvent} event - The pointer event.*/
function handleCanvasPointerDown(event) {
    if (!shouldShowCanvasHudControls() && !shouldUseCanvasMobileControls()) {
        return;}
    const point = getCanvasPoint(event);
    if (tryHandleCanvasHudDown(event, point)) {
        return;
    }
    tryHandleCanvasControlDown(event, point);
}

/*** Handles a HUD pointer press when possible.
 * @param {PointerEvent} event - The pointer event.
 * @param {object} point - The canvas point.
 * @returns {boolean} True when a HUD button handled the event.*/
function tryHandleCanvasHudDown(event, point) {
    const hudButton = getCanvasHudButtonAtPoint(point);
    if (!shouldShowCanvasHudControls() || !hudButton) {
        return false;
    }
    event.preventDefault();
    handleCanvasHudAction(hudButton.action);
    return true;
}

/*** Handles a mobile control pointer press when possible.
 * @param {PointerEvent} event - The pointer event.
 * @param {object} point - The canvas point.*/
function tryHandleCanvasControlDown(event, point) {
    const button = getCanvasControlAtPoint(point);
    if (!shouldUseCanvasMobileControls() || !button) {
        return;}
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    activeCanvasPointers.set(event.pointerId, button.key);
    syncCanvasPointerKeys();
}

/*** Handles pointer movement across canvas controls.
 * @param {PointerEvent} event - The pointer event.*/
function handleCanvasPointerMove(event) {
    if (!activeCanvasPointers.has(event.pointerId)) {
        return;}
    event.preventDefault();
    updateCanvasPointerKey(event);
    syncCanvasPointerKeys();
}

/*** Updates one active pointer key from its current position.
 * @param {PointerEvent} event - The pointer event.*/
function updateCanvasPointerKey(event) {
    const button = getCanvasControlAtPoint(getCanvasPoint(event));
    if (button) {
        activeCanvasPointers.set(event.pointerId, button.key);
    } else {
        activeCanvasPointers.delete(event.pointerId);
    }
}

/*** Handles pointer end and cancel events on canvas controls.
 * @param {PointerEvent} event - The pointer event.*/
function handleCanvasPointerEnd(event) {
    if (!activeCanvasPointers.has(event.pointerId)) {
        return;
    }
    event.preventDefault();
    activeCanvasPointers.delete(event.pointerId);
    syncCanvasPointerKeys();
}

/*** Clears all active canvas touch controls.*/
function resetCanvasMobileControls() {
    activeCanvasPointers.clear();
}

/*** Clears all movement input sources.*/
function resetMovementInput() {
    resetCanvasMobileControls();
    keyboard.reset();
    syncWalkingAudioFromInput();
}

/*** Runs a canvas HUD action.
 * @param {string} action - The HUD action name.*/
function handleCanvasHudAction(action) {
    if (action === "pause") {
        toggleGamePause();
    } else if (action === "mute") {
        toggleGameMute();
    }
}

/*** Registers pointer listeners for canvas controls.*/
function initCanvasMobileControls() {
    if (!canvas) {return;}
    canvas.addEventListener("pointerdown", handleCanvasPointerDown);
    canvas.addEventListener("pointermove", handleCanvasPointerMove);
    canvas.addEventListener("pointerup", handleCanvasPointerEnd);
    canvas.addEventListener("pointercancel", handleCanvasPointerEnd);
    canvas.addEventListener("pointerleave", handleCanvasPointerEnd);
}
