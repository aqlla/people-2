import { NDimVector } from "./ndim/index.js"

type NDim = 2
const dimensions: NDim = 2


export class Vector2 extends NDimVector<NDim> {
    public readonly dimensions: NDim = dimensions

    public static get zero(): Vector2 {
        return new Vector2(0, 0)
    }

    public get x(): number {
        return this.getItem(0)
    }

    public get y(): number {
        return this.getItem(1)
    }

    public set x(val: number) {
        this.setItem(0, val)
    }

    public set y(val: number) {
        this.setItem(1, val)
    }

    
}
