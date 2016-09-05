import { fields } from '../../src';

describe('fields/Checkbox', function () {
    const name = 'example';
    let field = new fields.Checkbox();

    describe('#createChangeHandler', function () {
        it('should return a change handler that sets checked and the target value', function () {
            let value = null;
            let updateValue = v => value = v({checked: false, value: '1'});
            let onChange = field._createChangeHandler(updateValue);

            onChange({target: {value: 'test'}}, {});

            assert.deepEqual(value, {
                checked: true,
                value: 'test',
            });
        });
    });

    describe('#toProps', function () {
        function assertExpectedProps(props) {
            assert.property(props, 'name');
            assert.equal(props.name, name);
            assert.property(props, 'onChange');
            assert.typeOf(props.onChange, 'function');
        }

        it('should return a set of props with checked and onChange', function () {
            let checked = true;
            let updateValue = () => { };

            let props = field.toProps(name, updateValue, {checked})();

            assertExpectedProps(props);
            assert.property(props, 'value');
            assert.equal(props.value, '1');
            assert.property(props, 'checked');
            assert.isTrue(props.checked);
        });

        it('should return the correct props event when the currentValue is undefined (@regression)', function () {
            let updateValue = () => { };

            let props = field.toProps(name, updateValue)();

            assertExpectedProps(props);
            assert.property(props, 'value');
            assert.equal(props.value, '1');
            assert.property(props, 'checked');
            assert.isFalse(props.checked);
        });

        it('should return props will the value from the call when provided', function () {
            let checked = false;
            let updateValue = () => { };
            let value = 'yep';

            let props = field.toProps(name, updateValue)(value);

            assertExpectedProps(props);
            assert.property(props, 'value');
            assert.equal(props.value, 'yep');
            assert.property(props, 'checked');
            assert.isFalse(props.checked);
        });
    });

    describe('#filterOutput', function () {
        it('should return the currentValue.value when the input is checked', function () {
            assert.equal(field.filterOutput({
                checked: true,
                value: 'test',
            }), 'test');
        });

        it('should return true when the currentValue.value is falsy and the input is checked', function () {
            assert.isTrue(field.filterOutput({
                checked: true,
                value: '',
            }));
        });

        it('should return undefined when currentValue.checked is falsy', function () {
            assert.isUndefined(field.filterOutput({
                checked: false,
            }));
        });
    });

    describe('#filterInput', function () {
        it('should return an object with checked set to the truthiness of the input', function () {
            assert.deepEqual(field.filterInput('testing'), {
                checked: true,
                value: 'testing',
            });
        });

        it('should return an object with both checked and value set when given a undefined (@regression)', function () {
            assert.deepEqual(field.filterInput(), {
                checked: false,
                value: '1',
            });
        });

        it('should return an object with the same properties and values as give (@regression)', function () {
            let orig = {
                checked: true,
                value: 'testing123',
            };
            let nv = field.filterInput(orig);

            assert.deepEqual(nv, {
                checked: true,
                value: 'testing123',
            });
            assert.notStrictEqual(nv, orig);
        });
    });

    describe('#validate', function () {
        it('should execute the validators on the currentValue.value', function () {
            let args = null;
            let validator = (...called) => args = called;
            let ctx = {addViolation: () => {}};
            let field = new fields.Checkbox(validator);

            field.validate({
                checked: true,
                value: 'test',
            }, ctx);

            assert.isNotNull(args);
            assert.equal(args[0], 'test');
            assert.strictEqual(args[1], ctx);
        });
    });
});
