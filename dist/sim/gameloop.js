/**
 * Abstract class for basic game or simulation operation.
 *
 * Performs the following process loop with a giver interval between iterations:
 * - Listen for & apply input
 * - Run game update
 * - Render frame? - (maybe do this async separately)
 *
 */
export class SimLoop {
    static _instance;
    static _isRunning = false;
    settings = {};
    startTimeMs;
    lastUpdateTimeMs = 0;
    minInterval = 2;
    framerate = 0;
    constructor() {
        this.settings = {
            'minTimeout': 2,
        };
        this.startTimeMs = performance.now();
    }
    get config() {
        return this.settings;
    }
    get initialized() {
        return !SimLoop._instance;
    }
    get canStart() {
        switch (true) {
            case !this.initialized:
                return [false, "NewSim.instance must be initialized."];
            case this.running:
                return [false, "Simulation already running."];
            default:
                return [true, "good to go"];
        }
    }
    start() {
        const [canStart, failMsg] = this.canStart;
        if (canStart) {
            this.lastUpdateTimeMs = performance.now();
            SimLoop._isRunning = true;
            this.update();
        }
        else {
            console.error("FAILED TO START");
            console.info(failMsg);
        }
    }
    update() {
        if (this.running) {
            const now = performance.now();
            const deltaTimeMs = now - this.lastUpdateTimeMs;
            const deltaTimeSec = deltaTimeMs / 1000;
            this.framerate = 1 / deltaTimeSec;
            this.lastUpdateTimeMs = now;
            this.updatePhysics(deltaTimeSec);
            const timeout = deltaTimeMs > this.minInterval ? 0 : this.minInterval;
            setTimeout(() => this.update(), timeout);
        }
        else {
            this.lastUpdateTimeMs = 0;
        }
    }
    pause() {
        if (this.running) {
            SimLoop._isRunning = false;
        }
    }
    togglePause() {
        if (this.running) {
            this.pause();
        }
        else {
            this.start();
        }
        return this.running;
    }
    get running() {
        return SimLoop._isRunning;
    }
    get elapsed() {
        return performance.now() - this.startTimeMs;
    }
}
