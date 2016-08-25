import { fields } from '../../src';

describe('fields/Radio', function () {
    const name = 'example';
    let field = new fields.Radio();

    describe('#toProps', function () {
        it('should return props with checked set to whether or not the current value is equal to the field', function () {
            let onChange = () => {};
            let props = field.toProps(name, onChange, 'test')('test');

            assert.deepEqual(props, {
                checked: true,
                value: 'test',
                onChange,
                name,
            });
        });
    });
});
