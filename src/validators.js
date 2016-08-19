/**
 * A set of validators to use with connectForm. All the validators here
 * are meant to be used with `combineValidators.
 *
 * @module higherforms
 */

import invariant from 'invariant';

class SubContext {
    constructor(parent) {
        this.parent = parent;
        this.path = '';
    }

    atPath(path) {
        this.path = path;
    }

    addViolation(message) {
        this.parent.addViolation(this.path, message);
    }
}


function applyValidator(value, validator, ctx) {
    let typ = typeof validator;
    if ('undefined' === typ) {
        return;
    }

    if ('function' === typ) {
        validator(value, ctx);
    } else if (Array.isArray(validator)) {
        validator.map(v => v(value, ctx));
    } else {
        throw new Error(`Validator in "combineValidators" must be functions or arrays, got "${typ}"`);
    }
}

/**
 * Combine a set of validators into a single function.
 *
 * @param {object} validators
 * @return {function} a validator suitable for use with `connectForm`
 */
export function combineValidators(validators) {
    invariant(typeof validators === 'object' && !!validators, 'Validators must be a plain object');

    return function (formData, parentContext) {
        let ctx = new SubContext(parentContext);
        Object.keys(formData).forEach(k => {
            ctx.atPath(k);
            applyValidator(formData[k], validators[k], ctx);
        });
    };
}

export function required(message) {
    if (!message) {
        message = 'This field is required.';
    }

    return function (value, ctx) {
        if (!value) {
            ctx.addViolation(message);
        }
    };
}
