class Keyboard {
    left = false;
    right = false;
    space = false;
    D = false;

    /** Resets all keyboard flags. */
    reset() {
        this.left = false;
        this.right = false;
        this.space = false;
        this.D = false;
    }

    /**
     * Sets one keyboard action flag.
     * @param {string} key - The action name to set.
     * @param {boolean} isPressed - Whether the action is pressed.
     * @returns {boolean} True when the key was a known action.
     */
    setKey(key, isPressed) {
        if (!this.isKnownKey(key)) {
            return false;
        }

        this[key] = isPressed;
        return true;
    }

    /**
     * Sets all pressed action flags from a collection.
     * @param {string[]} keys - The currently pressed action names.
     */
    setPressedKeys(keys) {
        const pressedKeys = new Set(keys);

        this.left = pressedKeys.has("left");
        this.right = pressedKeys.has("right");
        this.space = pressedKeys.has("space");
        this.D = pressedKeys.has("D");
    }

    /**
     * Handles a key down event.
     * @param {KeyboardEvent} event - The keyboard event.
     * @returns {boolean} True when a known action changed.
     */
    handleKeyDown(event) {
        const key = this.getActionFromEvent(event);
        return this.setKey(key, true);
    }

    /**
     * Handles a key up event.
     * @param {KeyboardEvent} event - The keyboard event.
     * @returns {boolean} True when a known action changed.
     */
    handleKeyUp(event) {
        const key = this.getActionFromEvent(event);
        return this.setKey(key, false);
    }

    /**
     * Resolves a DOM keyboard event to a game action.
     * @param {KeyboardEvent} event - The keyboard event.
     * @returns {string|null} The action name or null.
     */
    getActionFromEvent(event) {
        const keyMap = { ArrowRight: "right", ArrowLeft: "left", " ": "space", d: "D", D: "D" };
        return keyMap[event.key] || this.getActionFromKeyCode(event);
    }

    /**
     * Resolves legacy key codes to a game action.
     * @param {KeyboardEvent} event - The keyboard event.
     * @returns {string|null} The action name or null.
     */
    getActionFromKeyCode(event) {
        const keyCodeMap = { 39: "right", 37: "left", 68: "D" };
        return event.code === "Space" ? "space" : keyCodeMap[event.keyCode] || null;
    }

    /**
     * Checks whether a key action is supported.
     * @param {string} key - The action name to test.
     * @returns {boolean} True when the action is supported.
     */
    isKnownKey(key) {
        return ["left", "right", "space", "D"].includes(key);
    }
}