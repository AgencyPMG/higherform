import { validators as v } from '../src'

describe('validators', function () {
    describe('#ensureMessage', function () {
        it('should error if message is not an string or function', function () {
            assert.throws(v.ensureMessage.bind(undefined, {}), 'must be strings or functions');
        });

        it('should return the default message if message is empty', function () {
            assert.equal(v.ensureMessage(undefined, 'default msg'), 'default msg');
        });

        it('should return the message if provided', function () {
            assert.equal(v.ensureMessage('provided', 'default'), 'provided');
        });

        it('should return the message function if provided', function () {
            let m = () => {};
            assert.strictEqual(v.ensureMessage(m, 'default'), m);
        });
    });

    describe('#toViolation', function () {
        it('should return the message directly when it is a string', function () {
            assert.equal(v.toViolation('oops', 123), 'oops');
        });

        it('should invoke the function with a value and arguments when message is a function', function () {
            let args = null;
            const message = (...calledWith) => {
                args = calledWith;
                return 'test oops';
            };

            const violation = v.toViolation(message, 123, 'here');

            assert.equal(violation, 'test oops');
            assert.isNotNull(args);
            assert.equal(123, args[0]);
            assert.equal('here', args[1]);
        });
    });

    describe('#required', function () {
        const validator = v.required();

        it('should add a violation when the value is falsy', function () {
            const ctx = v.context();

            validator('', ctx);

            assert.isTrue(ctx.hasViolations());
        });

        it('should do nothing when the value is truthy', function () {
            const ctx = v.context();

            validator('yep', ctx);

            assert.isFalse(ctx.hasViolations());
        });
    });

    describe('#oneOf', function () {
        const validator = v.oneOf(['one', 'two']);

        it('should add a violation if the value is not in the provided list', function () {
            const ctx = v.context();

            validator('three', ctx);

            assert.isTrue(ctx.hasViolations());
        });

        it('should do nothing when the value is whitelisted', function () {
            const ctx = v.context();

            validator('one', ctx);

            assert.isFalse(ctx.hasViolations());
        });
    });

    describe('#matches', function () {
        const validator = v.matches(/hello/);

        it('should add a violation if the value does not match the pattern', function () {
            const ctx = v.context();

            validator('nope', ctx);

            assert.isTrue(ctx.hasViolations());
        });

        it('should do nothing when the value matches the pattern', function () {
            const ctx = v.context();

            validator('hello, world', ctx);

            assert.isFalse(ctx.hasViolations());
        });
    });

    describe('#chain', function () {
        let oneCalled = null;
        let twoCalled = null;
        const one = (value, ctx)  => oneCalled = [value, ctx];
        const two = (value, ctx) => twoCalled = [value, ctx];
        const validator = v.chain(one, two);

        beforeEach(function () {
            oneCalled = null;
            twoCalled = null;
        });

        it('should call each validator in the chain', function () {
            const ctx = v.context();

            validator('value', ctx);

            for (let call of [oneCalled, twoCalled]) {
                assert.equal(call[0], 'value');
                assert.strictEqual(call[1], ctx);
            }
        });
    });

    describe('#shortChain', function () {
        let oneCalled = null;
        let twoCalled = null;
        const one = (value, ctx)  => {
            ctx.addViolation('oops');
            oneCalled = [value, ctx];
        };
        const two = (value, ctx) => twoCalled = [value, ctx];
        const validator = v.shortChain(one, two);

        beforeEach(function () {
            oneCalled = null;
            twoCalled = null;
        });

        it('should stop as soon as a validator adds a violation', function () {
            const ctx = v.context();

            validator('value', ctx);

            assert.isTrue(ctx.hasViolations());
            assert.isNotNull(oneCalled);
            assert.equal(oneCalled[0], 'value');
            assert.strictEqual(oneCalled[1], ctx);
            assert.isNull(twoCalled);
        });
    });
});
