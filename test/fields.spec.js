import { fields } from '../src';

describe('fields', function () {
    const simpleSugar = ['input', 'select', 'textarea'];
    simpleSugar.forEach(name => {
        describe('#'+name, function () {
            it('should return an instance of SimpleField', function () {
                assert.instanceOf(fields[name](), fields.SimpleField);
            });
        });
    });

    describe('#checkbox', function () {
        it('should return an instance of Checkbox', function () {
            assert.instanceOf(fields.checkbox(), fields.Checkbox);
        });
    });

    describe('#radio', function () {
        it('should return an instance of Radio', function () {
            assert.instanceOf(fields.radio(), fields.Radio);
        });
    });
});
