
import noop from '../../../../fn/modules/noop.js';


/*
FlaggedSet(name)
A Set that flags objects added to it with the property `name` set to `true`.
*/

export default class FlaggedSet extends Set {
    constructor(name, onchange = noop) {
        super();
        this.name     = name;
        this.onchange = onchange;
    }

    add(object) {
        // Guard against no change
        if (this.has(object)) {
            return this;
        }

        super.add(object);
        object[this.name] = true;
        this.onchange();
        return this;
    }

    delete(object) {
        // Guard against no change
        if (!this.has(object)) {
            return this;
        }

        delete object[this.name];
        super.delete(object);
        this.onchange();
        return this;
    }

    find(fn) {
        // Find by fn(object)
        for (let object of this) {
            if (fn(object)) {
                return object;
            };
        }
    }

    clear() {
        // Guard against no change
        if (!this.size) {
            return this;
        }

        // delete flags
        for (let object of this) {
            delete object[this.name];
        }

        super.clear();
        this.onchange();
        return this;
    }
}
