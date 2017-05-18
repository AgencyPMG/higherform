/**
 * A set of validators to use with connectForm. All the validators here
 * are meant to be used with `combineValidators.
 *
 * @module higherform
 */

import invariant from 'invariant';

export function context(data) {
    const errors = [];

    return {
        addViolation: function (err) {
            errors.push(err);
        },

        hasViolations: function () {
            return errors.length > 0;
        },

        getViolations: function () {
            return errors;
        },

        data,
    };
}

/**
 * A vaidation context implementation that only returns the values given.
 *
 * This is used by complex fields to do validation on their individual pieces.
 *
 */
export function stubContext(hasViolations, violations) {
    return {
        addViolation: function () {
            // noop, only here to conform to the interface
        },

        hasViolations: function () {
            return hasViolations;
        },

        getViolations: function () {
            return violations;
        }
    };
}

export function ensureMessage(message, defaultMessage) {
    if (!message) {
        message = defaultMessage;
    }
    invariant(
        typeof message === 'string' || typeof message === 'function',
        'Validator messages must be strings or functions'
    );

    return message;
}

export function toViolation(message, value, ...args) {
    return typeof message === 'function' ? message(value, ...args) : message;
}

/**
 * Errors the field if the value is falsy (empty).
 *
 * @param {string|undefined} message The message to show if the validator fails
 * @return {function}
 */
export function required(message) {
    let msg = ensureMessage(message, 'This field is required.');

    return function (value, ctx) {
        if (!value) {
            ctx.addViolation(toViolation(msg, value));
        }
    };
}

/**
 * Errors the field if the value is not one of the provided values.
 *
 * @param {array} values The allowed values.
 * @param {string|undefined} message the message to show if the validator fails
 * @return {function}
 */
export function oneOf(values, message) {
    invariant(Array.isArray(values), 'values must be an array');
    let msg = ensureMessage(message, `Must be one of the following values: ${values.join(', ')}`);

    return function (value, ctx) {
        if (values.indexOf(value) === -1) {
            ctx.addViolation(toViolation(msg, value, values));
        }
    };
}

/**
 * Errors the field if the value doesn't match the pattern.
 *
 * @param {RegExp} pattern the pattern to check agains
 * @param {string} message The message to show if the validator fails.
 * @return {function}
 */
export function matches(pattern, message) {
    invariant(pattern instanceof RegExp, 'pattern must be a RegExp');
    let msg = ensureMessage(message, 'This value is not valid.');

    return function (value, ctx) {
        if (!pattern.test(value)) {
            ctx.addViolation(toViolation(msg, value, pattern));
        }
    };
}

/**
 * Applies all the validators to the value. Every validator will be applied.
 *
 * @param {function[]} validators The validators to apply.
 * @return {function}
 */
export function chain(...validators) {
    invariant(validators.length > 0, 'chain requires at least one validator');

    return function (value, ctx) {
        validators.forEach(v => v(value, ctx));
    };
}

/**
 * Like `chain`, but stops after one validator fails.
 *
 * @param {function[]} validators The validators to apply
 * @return {function}
 */
export function shortChain(...validators) {
    invariant(validators.length > 0, 'shortChain requires at least one validator');

    return function (value, ctx) {
        for (let v of validators) {
            v(value, ctx);
            if (ctx.hasViolations()) {
                break;
            }
        }
    };
}
