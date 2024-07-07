import { HtmlAttributeConfig } from "../dom/types.js";

const domo = {
    make: <TElement extends HTMLElement>
        (tag: keyof HTMLElementTagNameMap, attributes: HtmlAttributeConfig): TElement => {
        const el = document.createElement(tag) as TElement
        for (const [k, v] of Object.entries(attributes)) {
            if (k === 'classList') {
                el.className = v
            }
        }
        return el
    }
}

class FuConfigGroup extends HTMLElement {
    static classNames = {
        group: 'config-group list-item flex-col',
        title: 'title center prevent-select',
        body: 'body flex-row',
        left: 'left flex-col',
        content: 'content-main flex-col',
        input: 'input flex-col',
    };

    addAllConfigGroups_doStuff() {
        const parent = this.getParent('config');
        const sepGroup = this.makeBoidsForceConfigGroup('separation');
        parent.appendChild(sepGroup);
    }

    getParent(parentId) {
        return document.getElementById(parentId)! as Node;
    }

    makeBoidsForceConfigGroup = (force: string) => {
        const group = this.makeConfigGroup(force);
        const body = group.querySelector('.body');
        return group;
    };

    makeConfigGroup = (title: string) => {
        const groupEl = domo.make('div', { class: FuConfigGroup.classNames['group'] });
        const titleEl = domo.make('div', { class: FuConfigGroup.classNames['title'] });
        const bodyEl = domo.make('div', { class: FuConfigGroup.classNames['body'] });
        titleEl.innerText = title;
        groupEl.appendChild(titleEl);
        groupEl.appendChild(bodyEl);
        return groupEl;
    };
}
