/**
* A field type for composite fields.
 *
 * @module higherform
 */

import invariant from 'invariant';
import isPlainObject from 'lodash.isplainobject';
import { context, stubContext } from '../validators';

export default class Collection {
    constructor(fields) {
        invariant(isPlainObject(fields), 'fields must be a plain object of fields');
        this.fields = fields;
    }

    toMethods(name, updateValue, getValue) {
        let fm = {};

        let methodsFor = field => {
            invariant(
                typeof this.fields[field] !== 'undefined',
                'Field passed to `props` or methodsFor must exist in the underlying field shape'
            );

            if (!fm[field]) {
                fm[field] = this.fields[field].toMethods(`${name}[${field}]`, value => {
                    updateValue(function (nextValue) {
                        return Object.assign({}, nextValue, {
                            [field]: typeof value === 'function' ? value(nextValue[field]) : value,
                        });
                    });
                }, () => getValue()[field]);
            }

            return fm[field];
        };

        return {
            props: (field, ...args) => {
                return methodsFor(field).props(...args);
            },

            methodsFor: methodsFor,
        };
    }

    filterOutput(currentValue) {
        invariant(isPlainObject(currentValue), 'Shape outputs must be objects');

        return this._mapFields(function (field, key) {
            return field.filterOutput(currentValue[key]);
        });
    }

    filterInput(inValue) {
        if (typeof inValue === 'undefined') {
            inValue = {};
        }

        invariant(isPlainObject(inValue), 'Shape inputs must be objects');

        return this._mapFields(function (field, key) {
            return field.filterInput(inValue[key]);
        });
    }

    validate(formData, ctx) {
        let hasViolations = false;
        let violations = this._mapFields(function (field, key) {
            let sc = field.validate(formData[key], context());
            if (sc.hasViolations()) {
                hasViolations = true;
            }

            return sc.hasViolations () ? sc.getViolations() : undefined;
        });

        return stubContext(hasViolations, violations);
    }

    _mapFields(callback) {
        let rv = {};
        for (let key of Object.keys(this.fields)) {
            rv[key] = callback(this.fields[key], key);
        }

        return rv;
    }
}
