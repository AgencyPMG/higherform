/**
 * A field object sufficient for `input` (other than checkboxes or radios),
 * select, or textareas.
 *
 * @module higherform
 */

import Field from './Field';

export default class SimpleField extends Field {
    toProps(name, changeHandler, currentValue) {
        return () => {
            return {
                value: currentValue,
                onChange: changeHandler,
                name,
            };
        };
    }

    createChangeHandler(name, updateValue) {
        return event => {
            updateValue(event.target.value);
        };
    }
}
