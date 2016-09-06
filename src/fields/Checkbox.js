/**
 * A field object for checkboxes.
 *
 * @module higherform
 */

import Field from './Field';

export default class Checkbox extends Field {
    filterOutput(currentValue) {
        return currentValue.checked ? (currentValue.value || currentValue.checked) : undefined;
    }

    filterInput(inValue) {
        let iv = typeof inValue === 'object' && !!inValue ? Object.assign({}, inValue) : {
            checked: !!inValue,
            value: inValue,
        };

        if (typeof iv.checked === 'undefined') {
            iv.checked = false;
        }
        if (typeof iv.value === 'undefined') {
            // default the value to a bool-ish thing. Required so we don't
            // cause fun warnings about the input becoming controlled/uncontrolled
            // when form types switch.
            iv.value = '1';
        }

        return iv;
    }

    validate(currentValue, ctx) {
        return super.validate(this.filterOutput(currentValue), ctx);
    }

    _buildPropsMethod(name, updateValue, getValue) {
        return (value) => {
            let cv = this.filterInput(getValue());
            return {
                checked: !!cv.checked,
                onChange: this._createChangeHandler(updateValue),
                value: typeof value === 'undefined' ? cv.value : value,
                name,
            };
        };
    }

    _createChangeHandler(updateValue) {
        return event => {
            updateValue(currentValue => {
                let cv = this.filterInput(currentValue);
                return {
                    checked: !cv.checked,
                    value: event.target.value, // store the value of the field
                }
            });
        };
    }
}
