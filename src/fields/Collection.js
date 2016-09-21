/**
 * A field object for collections.
 *
 * @module higherform
 */

import invariant from 'invariant';
import { context, stubContext } from '../validators';

export default class Collection {
    constructor(field) {
        this.field = field;
    }

    toMethods(name, updateValue, getValue) {
        let fm = {};

        let methodsFor = idx => {
            if (!fm[idx]) {
                fm[idx] = this.field.toMethods(`${name}[${idx}]`, value => {
                    updateValue(function (nextValue) {
                        let out = nextValue.slice();
                        out.splice(idx, 1, typeof value === 'function' ? value(nextValue[idx]) : value);

                        return out;
                    });
                }, () => getValue()[idx]);
            }

            return fm[idx];
        };

        let methods = {
            length: () => getValue().length,

            remove: idx => {
                updateValue(function (currentValue) {
                    let out = currentValue.slice();
                    out.splice(idx, 1);

                    return out;
                });
            },

            add: idx => {
                updateValue(currentValue => {
                    let out = currentValue.slice()
                    let where = typeof idx === 'undefined' ? currentValue.length : idx;

                    out.splice(where, 0, this.field.filterInput(undefined));

                    return out;
                });
            },

            map: callback => {
                invariant(typeof callback === 'function', 'Collection.map callbacks must be functions');
                let out = [];
                let len = getValue().length;
                for (let i = 0; i < len; i++) {
                    out.push(callback(methodsFor(i), i))
                }

                return out;
            },
        };

        for (let m of Object.keys(this.field.toMethods(name, updateValue, getValue))) {
            if (!methods[m]) {
                methods[m] = (idx, ...args) => methodsFor(idx)[m](...args);
            }
        }

        return methods;
    }

    filterOutput(currentValue) {
        invariant(Array.isArray(currentValue), 'Collection outputs must be arrays');
        return currentValue.map(this.field.filterOutput, this.field);
    }

    filterInput(inValue) {
        if (typeof inValue === 'undefined') {
            inValue = [];
        }

        invariant(Array.isArray(inValue), 'Collection inputs must be arrays');
        return inValue.map(this.field.filterInput, this.field);
    }

    validate(formData, ctx) {
        let hasViolations = false;
        let violations = new Array(formData.length);
        formData.map((fieldData, idx) => {
            let sc = this.field.validate(fieldData, context());
            if (sc.hasViolations()) {
                hasViolations = true;
                violations[idx] = sc.getViolations();
            }
        });

        return stubContext(hasViolations, violations);
    }
}
