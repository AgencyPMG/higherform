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
     * Returns a plain object of methods that can be used to programmatically
     * update the field. Not useful for all fields, but complex fields may use
     * this to provide a programmatic API (eg. collections).
     *
     * @param {string} name The name of the field in the form as a whole.
     * @param {function(value|function)} updateValue The callback used to update
     *        the underlying form value
     * @param {function} getValue Get the current value of the field. Useful for
     *        late binding the state from the form to props.
     * @return {object}
     */
    toMethods(name, updateValue, getValue) {
        return {
            props: this._buildPropsMethod(name, updateValue, getValue),
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
        return inValue || '';
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
     * Returns a function that can build props for the fields.
     *
     * @param {string} name The name of the field in the form.
     * @param {function} changeHandler The change handler 
     * @param {function} getValue Fetch the current value of the field
     * @return {function} A function that can be called to render the props for the fields.
     */
    _buildPropsMethod(name, updateValue, getValue) {
        return () => {
            return {
                name,
                value: getValue(),
                onChange: this._createChangeHandler(updateValue),
            };
        };
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
