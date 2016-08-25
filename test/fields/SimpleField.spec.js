import { fields } from '../../src';

describe('fields/SimpleField', function () {
    const name = 'example';
    let field = new fields.SimpleField();

    describe('#createChangeHandler', function () {
        it('returns a change handler that updates the form will a value from the event', function () {
            let value = null;
            let updateValue = v => value = v;
            let onChange = field.createChangeHandler(name, updateValue);

            onChange({target: {value: 'test'}}, value);

            assert.equal(value, 'test');
        });
    });

    describe('#toProps', function () {
        it('returns a set of props with the value and onChange set', function () {
            let onChange = () => {};
            let value = 'test';

            let props = field.toProps(name, onChange, value)();

            assert.deepEqual(props, {
                value,
                onChange,
                name,
            });
        });
    });
});

