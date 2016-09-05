/**
 * The various field specifications. There are only a few of these "built in"
 * but users may implement (or extend) the `Field` interface to make their
 * own. Fields are very notably lacking anything related to display. Because 
 * higherforms doesn't care about that. Our goal is only to manage state and
 * validation.
 * 
 * @module higherform
 */

import Field from './Field';
import Checkbox from './Checkbox';
import Radio from './Radio';

function sf(validators) {
    return new Field(validators);
}

export { Field, Checkbox, Radio };
export const input = sf;
export const textarea = sf;
export const select = sf;
export const checkbox = function (validators) {
    return new Checkbox(validators);
};
export const radio = function (validators) {
    return new Radio(validators);
};
