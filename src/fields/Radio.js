/**
 * A field object for radio buttons.
 *
 * @module higherform
 */

import invariant from 'invariant';
import SimpleField from './SimpleField';

export default class Radio extends SimpleField {
    toProps(name, changeHandler, currentValue) {
        return fieldValue => {
            invariant(typeof fieldValue !== 'undefined', 'You must supply a field value to radio field toProps');

            return {
                checked: fieldValue === currentValue,
                onChange: changeHandler,
                value: fieldValue,
                name,
            };
        };
    }
}
