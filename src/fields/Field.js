/**
 * The field base class. Defines the interface.
 *
 * @module higherform
 */

import invariant from 'invariant';

export default class Field {
    constructor(validators) {
        validators = validators || [];
        if (!Array.isArray(validators)) {
            validators = [validators];
        }

        invariant(
            validators.filter(v => typeof v === 'function').length === validators.length,
            'All field validators must be functions'
        );

        this.validators = validators;
    }

    /**
     * Returns a plain object of props for the field.
     *
     * @param {string} name The name of the field in the form.
     * @param {func} changeHandler The change handler 
     * @param {mixed} currentValue the current value of the field
     * @return {function} A function that can be called to render the props for the fields.
     */
    toProps(name, updateValue, currentValue) {
        return () => {
            return {
                name,
                value: currentValue,
                onChange: this._createChangeHandler(updateValue),
            };
        };
    }

    /**
     * Provides a way to filter the form value before sending it back to the
     * the end users.
     *
     * Useful if the field keeps extra state for itself.
     *
     * The default is to do nothing.
     *
     * @param {mixed} currentValue the current value of the field to filter
     * @return {mixed|undefined} `undefined` indicates that the value should not
     *         be included in the output sent to the user.
     */
    filterOutput(currentValue) {
        return currentValue;
    }

    /**
     * Filters incoming values -- like mapping props to form data.
     *
     * @param {mixed} inValue
     * @return {mixed}
     */
    filterInput(inValue) {
        return inValue;
    }

    /**
     * Validate the input for the field.
     *
     * @param {string|object} currentValue the value from the form to validate
     * @param {object} ctx The validation context.
     * @return {void}
     */
    validate(currentValue, ctx) {
        this.validators.forEach(v => v(currentValue, ctx));
    }

    /**
     * Returns a function suitable for use a change event handler. How
     * this works will depend on the the field. Checkboxes will be different
     * from text inputs, for instance.
     *
     * @param {string} name The name of the field in the form
     * @param {func(newValue)} updateValue A function that takes the new value
     *        for the field. Should you need to see the previous value for the
     *        field, pass a function to `updateValue`.
     * @return {func(event)}
     */
    _createChangeHandler(updateValue) {
        return event => {
            updateValue(event.target.value);
        };
    }
}
