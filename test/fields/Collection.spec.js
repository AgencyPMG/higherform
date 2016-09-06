import { fields, validators } from '../../src';
import TrackingField from './TrackingField';

describe('fields/Collection', function () {
    const name = 'testField';
    const values = ['one', 'two', 'three'];
    let tf = null;
    let col = null;

    beforeEach(function () {
        tf = new TrackingField(validators.required());
        col = fields.collection(tf);
    });

    describe('#filterInput', function () {
        it('should apply the underlying fields filterInput to each element of the input value', function () {
            col.filterInput(values);

            assert.lengthOf(tf.filterInputCalls, 3);
            assert.deepEqual(tf.filterInputCalls, values);
        });

        it('should return an empty array when no input is given', function () {
            assert.deepEqual(col.filterInput(), [])
        });
    });

    describe('#filterOutput', function () {
        it('should apply the underlying fields filterOutput to each element of the output value', function () {
            col.filterOutput(values);

            assert.lengthOf(tf.filterOutputCalls, 3);
            assert.deepEqual(tf.filterOutputCalls, values);
        });
    });

    describe('#validate', function () {
        it('should return a context with violations when the underlying field does not validate', function () {
            let ctx = col.validate(['', '', '']);

            assert.isTrue(ctx.hasViolations());
            assert.lengthOf(ctx.getViolations(), 3)
            ctx.getViolations().forEach(v => assert.lengthOf(v, 1));
        });

        it('should return a context without violations when the underlying field validates', function () {
            let ctx = col.validate(values);

            assert.isFalse(ctx.hasViolations());
        });

        it('should validate correctly when the nested field is complex (@regression)', function () {
            let c = fields.collection(fields.shape({
                req: fields.input(validators.required('broken')),
            }));

            let ctx = c.validate([{req: ''}], validators.context());

            assert.isTrue(ctx.hasViolations());
            let vios = ctx.getViolations();
            assert.lengthOf(vios, 1);
            assert.deepEqual(vios[0], {req: ['broken']});
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
            return col.toMethods(name, updateValue, getValue);
        }

        describe('#props', function () {
            it("should proxy to the underlying field's props method", function () {
                let props = buildMethods().props(0);

                // one call to put the proxies, the other to fetch the props
                assert.lengthOf(tf.toMethodsCalls, 2);
                assert.property(props, 'name');
                assert.equal(props.name, `${name}[0]`);
                assert.property(props, 'value');
                assert.equal(props.value, values[0]);
                assert.property(props, 'onChange');
                assert.typeOf(props.onChange, 'function');
            });

            it('should provide a change handler that updates only the index of the underlying array', function () {
                let props = buildMethods().props(0);

                props.onChange({target: {value: 'changed'}});

                assert.lengthOf(updatedValues, 1);
                assert.typeOf(updatedValues[0], 'function', 'should provide an update callback');
                assert.deepEqual(updatedValues[0](values), ['changed', 'two', 'three']);
            });
        });

        describe('#length', function () {
            it('should return the length of the underlying values', function () {
                assert.equal(buildMethods().length(), values.length);
            });
        });

        describe('#add', function () {
            it('should add an element to the end of the values when an index is not given', function () {
                buildMethods().add();

                assert.lengthOf(updatedValues, 1);
                assert.typeOf(updatedValues[0], 'function', 'should provide an update callback');

                let nv = updatedValues[0](values);
                assert.deepEqual(nv, ['one', 'two', 'three', '']);
            });

            it('should add an element at the specified index when provided', function () {
                buildMethods().add(1);

                assert.lengthOf(updatedValues, 1);
                assert.typeOf(updatedValues[0], 'function', 'should provide an update callback');

                let nv = updatedValues[0](values);
                assert.deepEqual(nv, ['one', '', 'two', 'three']);
            });
        });

        describe('#remove', function () {
            it('should remove the value at the specified index', function () {
                buildMethods().remove(1);

                assert.lengthOf(updatedValues, 1);
                assert.typeOf(updatedValues[0], 'function', 'should provide an update callback');

                let nv = updatedValues[0](values);
                assert.deepEqual(nv, ['one', 'three']);
            });
        });
    });
});
