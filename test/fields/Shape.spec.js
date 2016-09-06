import { fields, validators } from '../../src';
import TrackingField from './TrackingField';

describe('fields/Shape', function () {
    const name = 'testField';
    const subName = 'test';
    const values = {
        [subName]: 'testing 123',
        other: 'test',
    };
    let tf = null;
    let shape = null;

    beforeEach(function () {
        tf = new TrackingField(validators.required());
        shape = fields.shape({
            [subName]: tf,
            other: fields.input(),
        });
    });

    describe('#filterInput', function () {
        it('should apply the underlying fields filterInput to each property of the input value', function () {
            shape.filterInput(values);

            assert.lengthOf(tf.filterInputCalls, 1);
            assert.deepEqual(tf.filterInputCalls, ['testing 123']);
        });
    });

    describe('#filterOutput', function () {
        it('should apply the underlying fields filterOutput to each property of the output value', function () {
            shape.filterOutput(values);

            assert.lengthOf(tf.filterOutputCalls, 1);
            assert.deepEqual(tf.filterOutputCalls, ['testing 123']);
        });
    });

    describe('#validate', function () {
        it('should return a context with violations when the underlying field does not validate', function () {
            let ctx = shape.validate({
                [subName]: '',
            });

            assert.isTrue(ctx.hasViolations());
            assert.typeOf(ctx.getViolations(), 'object');
            assert.property(ctx.getViolations(), subName);
            assert.lengthOf(ctx.getViolations()[subName], 1);
        });

        it('should return a context without violations when the underlying field validates', function () {
            let ctx = shape.validate(values);

            assert.isFalse(ctx.hasViolations());
            assert.typeOf(ctx.getViolations()[subName], 'undefined');
        });
    });

    describe('#toMethods', function () {
        let updatedValues = [];
        const updateValue = nv => updatedValues.push(nv);
        const getValue = () => values;

        beforeEach(function () {
            updatedValues = [];
        });

        function buildMethods() {
            return shape.toMethods(name, updateValue, getValue);
        }

        describe('#props', function () {
            it("should proxy to the underlying field's props method", function () {
                let props = buildMethods().props(subName);

                assert.lengthOf(tf.toMethodsCalls, 1);
                assert.property(props, 'name');
                assert.equal(props.name, `${name}[${subName}]`);
                assert.property(props, 'value');
                assert.equal(props.value, values[subName]);
                assert.property(props, 'onChange');
                assert.typeOf(props.onChange, 'function');
            });

            it('should provide a change handler that updates only the property of the underlying array', function () {
                let props = buildMethods().props(subName);

                props.onChange({target: {value: 'changed'}});

                assert.lengthOf(updatedValues, 1);
                assert.typeOf(updatedValues[0], 'function', 'should provide an update callback');
                assert.deepEqual(updatedValues[0](values), Object.assign({}, values, {[subName]: 'changed'}));
            });
        });
    });
});
