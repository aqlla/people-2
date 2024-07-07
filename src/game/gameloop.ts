import { Identafiable, Nameable, TODO, Take } from "../lib/types.js"
import { Configurable, SerialIdentifiable } from "../lib/types.js"


export type Player = SerialIdentifiable & Readonly<Nameable>

export type Readyable = {
    readonly ready: boolean
}

export type TurnPlayer = Player & Readyable



export class TbPlayer implements TurnPlayer {
    protected static instanceCount = 0;

    id: number;
    name: string;

    constructor(name: string) {
        this.name = name;
        this.id = ++TbPlayer.instanceCount;
    }

    get ready(): boolean {
        throw new Error("Method not implemented.")
    }
    
    eq(other: Identafiable<number>): boolean {
        return this.id !== other.id;
    }
}




export abstract class TurnBasedGameLoop<TPLayer extends TurnPlayer> implements Configurable {
    protected players: Array<TPLayer> = [];
    protected settings: Record<string, TODO> = {}

    constructor() {

    }

    public get config() {
        return this.settings
    }

    public get initialized(): boolean {
        return false
    }

    public update(): void {
        // Iterate turn
    }
}