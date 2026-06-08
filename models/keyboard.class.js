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

    /** Sets one keyboard action flag. */
    setKey(key, isPressed) {
        if (!this.isKnownKey(key)) {
            return false;
        }

        this[key] = isPressed;
        return true;
    }

    /** Sets all pressed action flags from a collection. */
    setPressedKeys(keys) {
        const pressedKeys = new Set(keys);

        this.left = pressedKeys.has("left");
        this.right = pressedKeys.has("right");
        this.space = pressedKeys.has("space");
        this.D = pressedKeys.has("D");
    }

    /** Handles a key down event. */
    handleKeyDown(event) {
        const key = this.getActionFromEvent(event);
        return this.setKey(key, true);
    }

    /** Handles a key up event. */
    handleKeyUp(event) {
        const key = this.getActionFromEvent(event);
        return this.setKey(key, false);
    }

    /** Resolves a DOM keyboard event to a game action. */
    getActionFromEvent(event) {
        const keyMap = { ArrowRight: "right", ArrowLeft: "left", " ": "space", d: "D", D: "D" };
        return keyMap[event.key] || this.getActionFromKeyCode(event);
    }

    /** Resolves legacy key codes to a game action. */
    getActionFromKeyCode(event) {
        const keyCodeMap = { 39: "right", 37: "left", 68: "D" };
        return event.code === "Space" ? "space" : keyCodeMap[event.keyCode] || null;
    }

    /** Checks whether a key action is supported. */
    isKnownKey(key) {
        return ["left", "right", "space", "D"].includes(key);
    }
}