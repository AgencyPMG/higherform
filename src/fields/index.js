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
import Collection from './Collection';

function sf(validators) {
    return new Field(validators);
}

export { Field, Checkbox, Radio, Collection };
export const input = sf;
export const textarea = sf;
export const select = sf;
export function checkbox(validators) {
    return new Checkbox(validators);
}
export function radio(validators) {
    return new Radio(validators);
}
export function collection(field) {
    return new Collection(field);
}
