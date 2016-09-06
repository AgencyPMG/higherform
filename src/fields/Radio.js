/**
 * A field object for radio buttons.
 *
 * @module higherform
 */

import invariant from 'invariant';
import Field from './Field';

export default class Radio extends Field {
    _buildPropsMethod(name, updateValue, getValue) {
        return fieldValue => {
            invariant(typeof fieldValue !== 'undefined', 'You must supply a field value to radio field toProps');

            return {
                checked: getValue() === fieldValue,
                onChange: this._createChangeHandler(updateValue),
                value: fieldValue,
                name,
            };
        };
    }
}
