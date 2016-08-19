import { fields } from '../src';

describe('fields', function () {
    describe('#Field', function () {
        it('should error when given validators that are not functions', function () {
            assert.throws(() => {
                new fields.Field('notAFunction');
            }, /must be functions/);
        });

        it('should call the provided validators with the formData and context', function () {
            let args = null;
            let formData = {one: 'two'};
            let ctx = {addViolation: () => {}};
            let field = new fields.Field(function () {
                args = arguments;
            });

            field.validate(formData, ctx);

            assert.isNotNull(args);
            assert.strictEqual(args[0], formData);
            assert.strictEqual(args[1], ctx);
        });

        it('should not alter the currentValue on `filterOutput`', function () {
            let field = new fields.Field();

            assert.strictEqual(field.filterOutput('formData'), 'formData');
        });

        it('should not alter the inValue on `filterInput`', function () {
            let field = new fields.Field();

            assert.strictEqual(field.filterInput('inData'), 'inData');
        });
    })

    describe('#SimpleField', function () {
        let field = new fields.SimpleField();

        it('returns a change handler that updates the form will a value from the event', function () {
            let value = null;
            let updateValue = v => value = v;
            let onChange = field.createChangeHandler({}, updateValue);

            onChange({target: {value: 'test'}}, value);

            assert.equal(value, 'test');
        });

        it('returns a set of props with the value and onChange set', function () {
            let onChange = () => {};
            let value = 'test';

            let props = field.toProps({}, onChange, value);

            assert.deepEqual(props, {
                value,
                onChange,
            });
        });
    });

    describe('#CheckedField', function () {
        let field = new fields.CheckedField();

        it('should return a change handler that sets checked and the target value', function () {
            let value = null;
            let updateValue = v => value = v;
            let onChange = field.createChangeHandler({}, updateValue);

            onChange({target: {value: 'test'}}, {});

            assert.deepEqual(value, {
                checked: true,
                value: 'test',
            });
        });

        it('should return a set of props with checked and onClick', function () {
            let checked = true;
            let onClick = () => { };

            let props = field.toProps({}, onClick, {checked});

            assert.deepEqual(props, {
                checked,
                onClick
            });
        });

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

        it('should return an object with checked set to the truthiness of the input', function () {
            assert.deepEqual(field.filterInput('testing'), {checked: true});
        });

        it('should execute the validators on the currentValue.value', function () {
            let args = null;
            let validator = (...called) => args = called;
            let ctx = {addViolation: () => {}};
            let field = new fields.CheckedField(validator);

            field.validate({
                checked: true,
                value: 'test',
            }, ctx);

            assert.isNotNull(args);
            assert.equal(args[0], 'test');
            assert.strictEqual(args[1], ctx);
        });
    });

    const simpleSugar = ['input', 'select', 'textarea'];
    simpleSugar.forEach(name => {
        describe('#'+name, function () {
            it('should return an instance of SimpleField', function () {
                assert.instanceOf(fields[name](), fields.SimpleField);
            });
        });
    });

    const checkedSugar = ['checkbox', 'radio'];
    checkedSugar.forEach(name => {
        describe('#'+name, function () {
            it('should return an instance of CheckedField', function () {
                assert.instanceOf(fields[name](), fields.CheckedField);
            });
        });
    });
});
