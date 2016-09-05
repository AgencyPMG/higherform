/**
 * A field object for radio buttons.
 *
 * @module higherform
 */

import invariant from 'invariant';
import Field from './Field';

export default class Radio extends Field {
    toProps(name, updateValue, currentValue) {
        return fieldValue => {
            invariant(typeof fieldValue !== 'undefined', 'You must supply a field value to radio field toProps');

            return {
                checked: fieldValue === currentValue,
                onChange: this._createChangeHandler(updateValue),
                value: fieldValue,
                name,
            };
        };
    }
}
