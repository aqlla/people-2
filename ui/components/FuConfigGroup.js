const domo = {
    make: (tag, attributes) => {
        const el = document.createElement(tag);
        for (const [k, v] of Object.entries(attributes)) {
            if (k === 'classList') {
                el.className = v;
            }
        }
        return el;
    }
};
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
        return document.getElementById(parentId);
    }
    makeBoidsForceConfigGroup = (force) => {
        const group = this.makeConfigGroup(force);
        const body = group.querySelector('.body');
        return group;
    };
    makeConfigGroup = (title) => {
        const groupEl = domo.make('div', { class: FuConfigGroup.classNames['group'] });
        const titleEl = domo.make('div', { class: FuConfigGroup.classNames['title'] });
        const bodyEl = domo.make('div', { class: FuConfigGroup.classNames['body'] });
        titleEl.innerText = title;
        groupEl.appendChild(titleEl);
        groupEl.appendChild(bodyEl);
        return groupEl;
    };
}
export {};
//# sourceMappingURL=FuConfigGroup.js.map