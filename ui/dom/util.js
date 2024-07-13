export const $$ = document.getElementById;
export const $in = (id) => document.getElementById(id);
const upperIndex = (s, i) => s.replace(s[i], s[i].toUpperCase());
export const upperFirst = s => upperIndex(s, 0);
export const elementNotFound = (id) => new DOMException(`Cound not find element with id ${id}`);
export const domo = {
    make: (tag, attributes) => {
        const el = document.createElement(tag);
        for (const [k, v] of Object.entries(attributes)) {
            if (k === 'classList') {
                el.className = v.join(" ");
            }
        }
        return el;
    }
};
//# sourceMappingURL=util.js.map