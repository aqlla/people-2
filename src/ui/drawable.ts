// import { Tuple } from "../lib/types.js";

type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

export type Color = RGB | RGBA | HEX;

// export type Point = NDimVector<2>
// export type Vertices2D<N extends number> = Tuple<N, Point>

// export enum Shape {
//   Circle,
//   Square,
//   Triangle,
//   Rectangle,
// }

// export interface Drawable extends Positional<2> {
//   readonly color: Color
//   readonly shape: Shape
// }

// export type Constructor<T> = new (...args: any[]) => T

// export function MakeDrawable(shape: Shape, color: Color) {
//   return <T extends Constructor<Positional<2>>>(target: T) => {
//     return class extends target implements Drawable {
//       public readonly shape: Shape
//       public readonly color: Color

//       constructor(...args: any[]) {
//         super(...args)
//         this.shape = shape
//         this.color = color
//       }
//     };
//   };
// }


// export function injectDrawable(shape: Shape, color: Color) {
//   return <T extends Positional<2>>(target: T): T & Drawable => {
//     Object.defineProperties(target, {
//       shape: {
//         value: shape,
//         writable: false,
//         configurable: false
//       },
//       color: {
//         value: color,
//         writable: false,
//         configurable: false
//       }
//     })

//     return target as T & Drawable
//   }
// }