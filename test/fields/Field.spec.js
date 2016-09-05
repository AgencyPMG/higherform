import { fields } from '../../src';

describe('fields/Field', function () {
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

    describe('#filterOutput', function () {
        it('should not alter the currentValue', function () {
            let field = new fields.Field();

            assert.strictEqual(field.filterOutput('formData'), 'formData');
        });
    });

    describe('#filterInput', function () {
        const field = new fields.Field();
        it('should not alter the inValue', function () {
            assert.strictEqual(field.filterInput('inData'), 'inData');
        });

        it('should return an empty string when given `undefined` (@regression)', function () {
            assert.strictEqual(field.filterInput(undefined), '');
        });

        it('should return an empty string when given `null` (@regression)', function () {
            assert.strictEqual(field.filterInput(null), '');
        });

        it('should return an empty string when given `false` (@regression)', function () {
            assert.strictEqual(field.filterInput(false), '');
        });
    });

    describe('#createChangeHandler', function () {
        const field = new fields.Field();

        it('returns a change handler that updates the form will a value from the event', function () {
            let value = null;
            let updateValue = v => value = v;
            let onChange = field._createChangeHandler(updateValue);

            onChange({target: {value: 'test'}}, value);

            assert.equal(value, 'test');
        });
    });

    describe('#toProps', function () {
        const field = new fields.Field();

        it('returns a set of props with the value and onChange set', function () {
            const name = 'example';
            let value = 'test';
            let updateValue = v => {}

            let props = field.toProps(name, updateValue, value)();

            assert.property(props, 'value');
            assert.equal(props.value, 'test');
            assert.property(props, 'onChange');
            assert.typeOf(props.onChange, 'function');
            assert.property(props, 'name');
            assert.equal(props.name, name);
        });
    });
});
