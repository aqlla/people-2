import { HTMLElementConfig } from './types.js';

export const $$ = document.getElementById;

export const $in = (id) => document.getElementById(id) as HTMLInputElement;


const upperIndex = (s: string, i: number) => s.replace(s[i], s[i].toUpperCase());

export const upperFirst = s => upperIndex(s, 0);

export const elementNotFound = (id: string): DOMException => new DOMException(`Cound not find element with id ${id}`);

export const domo = {
    make: <TElement extends HTMLElement>(tag: keyof HTMLElementTagNameMap, attributes: HTMLElementConfig): TElement => {
        const el = document.createElement(tag) as TElement;
        for (const [k, v] of Object.entries(attributes)) {
            if (k === 'classList') {
                el.className = v.join(" ");
            }
        }
        return el;
    }
};
