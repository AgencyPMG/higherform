import { fields } from '../../src';

describe('fields/Radio', function () {
    const name = 'example';
    let field = new fields.Radio();

    describe('#toMethods(props)', function () {
        it('should return props with checked set to whether or not the current value is equal to the field', function () {
            let updateValue = () => { }

            let props = field.toMethods(name, updateValue, () => 'test').props('test');

            assert.property(props, 'checked');
            assert.isTrue(props.checked);
            assert.property(props, 'value');
            assert.equal(props.value, 'test');
            assert.property(props, 'name');
            assert.equal(props.name, name);
            // the actual on change handler is tested in the `Field` base class
            assert.property(props, 'onChange');
            assert.typeOf(props.onChange, 'function');
        });
    });
});
