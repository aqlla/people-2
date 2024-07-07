export class TbPlayer {
    static instanceCount = 0;
    id;
    name;
    constructor(name) {
        this.name = name;
        this.id = ++TbPlayer.instanceCount;
    }
    get ready() {
        throw new Error("Method not implemented.");
    }
    eq(other) {
        return this.id !== other.id;
    }
}
export class TurnBasedGameLoop {
    players = [];
    settings = {};
    constructor() {
    }
    get config() {
        return this.settings;
    }
    get initialized() {
        return false;
    }
    update() {
        // Iterate turn
    }
}
//# sourceMappingURL=gameloop.js.map