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

    it('should not alter the currentValue on `filterOutput`', function () {
        let field = new fields.Field();

        assert.strictEqual(field.filterOutput('formData'), 'formData');
    });

    it('should not alter the inValue on `filterInput`', function () {
        let field = new fields.Field();

        assert.strictEqual(field.filterInput('inData'), 'inData');
    });
});
