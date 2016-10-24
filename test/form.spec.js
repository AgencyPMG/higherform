import React, { PropTypes, Component } from 'react';
import higherform, { fields, FormShape, FieldsShape } from '../src';

describe('form', function () {
    function changeInput(tree, event, type) {
        Simulate[type || 'change'](
            TestUtils.findRenderedDOMComponentWithTag(tree, 'input'),
            event
        );
    }

    function submitForm(tree) {
        Simulate.submit(TestUtils.findRenderedDOMComponentWithTag(tree, 'form'));
    }

    class BasicForm extends Component {
        static propTypes = {
            form: FormShape.isRequired,
            fields: FieldsShape.isRequired,
            originalData: PropTypes.object,
            submit: PropTypes.func,
            fieldType: PropTypes.string,
        }

        static defaultProps = {
            fieldType: 'input',
        };

        onSubmit(event) {
            event.preventDefault();

            this.props.form.submit(this.props.submit);
        }

        render() {
            let { form, fields } = this.props;

            return (
                <form onSubmit={this.onSubmit.bind(this)}>
                    <input type={this.props.fieldType === 'input' ? 'text' : this.props.fieldType} {...fields.example.props()} />
                    {this._errors()}
                    <button type="submit">Submit</button>
                </form>
            );
        }

        _errors() {
            let errors = this.props.form.errors.example;
            if (!errors) {
                return;
            }

            return (
                <div className="errors">
                    {errors.map((e, key) => <p key={key} className="error">{e}</p>)}
                </div>
            );
        }
    }

    describe('#FieldSpec(object)', function () {
        let errors = null;
        let submitted = null;
        const submit = (_errors, formData) => {
            errors = _errors;
            submitted = formData;
        };
        beforeEach(function () {
            errors = null;
            submitted = null;
        });

        it('should call the submit callback when the form is validated', function () {
            const FieldSpec = {
                // no validators
                example: fields.input(),
            };
            const Form = higherform(FieldSpec)(BasicForm);
            const tree = TestUtils.renderIntoDocument(<Form submit={submit} />);

            changeInput(tree, {
                target: {value: 'changed'},
            });
            submitForm(tree);

            assert.isUndefined(errors);
            assert.isNotNull(submitted);
            assert.deepEqual(submitted, {example: 'changed'});
        });

        it('should update the view with errors when the form fails to validate', function () {
            const FieldSpec = {
                example: fields.input(function (currentValue, ctx) {
                    ctx.addViolation('oops');
                }),
            };
            const Form = higherform(FieldSpec)(BasicForm);
            const tree = TestUtils.renderIntoDocument(<Form submit={submit} />);

            changeInput(tree, {
                target: {value: 'changed'},
            });
            submitForm(tree);

            const errors = TestUtils.scryRenderedDOMComponentsWithClass(tree, 'error');
            assert.lengthOf(errors, 1, 'should have rendered one error');
            assert.isUndefined(submitted);
        });

        it('should return a resolved Proimse when the form is validated', function (done) {
            const FieldSpec = {
                example: fields.input(),
            };
            const Form = higherform(FieldSpec)(BasicForm);
            const tree = TestUtils.renderIntoDocument(<Form submit={submit} />);

            changeInput(tree, {
                target: {value: 'changed'},
            });

            TestUtils.findRenderedComponentWithType(tree, Form)
            .submit().then(function(formData) {
                assert.deepEqual(formData, {example: 'changed'});
                done();
            });
        });

        it('should return a rejected Promise when the form is not validated', function (done) {
            const FieldSpec = {
                example: fields.input(function (currentValue, ctx) {
                    ctx.addViolation('oops');
                }),
            };
            const Form = higherform(FieldSpec)(BasicForm);
            const tree = TestUtils.renderIntoDocument(<Form submit={submit} />);

            TestUtils.findRenderedComponentWithType(tree, Form)
            .submit().catch(function(errors) {
                assert.deepEqual(errors, {example: ['oops']});
                done();
            });
        });
    });

    describe('#FieldSpec(function)', function () {
        let errors = null;
        let submitted = null;
        const submit = (_errors, formData) => {
            errors = _errors;
            submitted = formData;
        };
        let args = [];
        const FieldSpec = (props) => {
            args.push(props);
            return {
                example: fields[props.fieldType](),
            };
        };
        const Form = higherform(FieldSpec, {
            // prevents wonkiness with switching field types
            nextPropsToForm: function (props, nextProps) {
                if (props.fieldType !== nextProps.fieldType) {
                    return {};
                }
            },
        })(BasicForm);

        beforeEach(function () {
            errors = null;
            submitted = null;
            args = [];
        });

        it('should invoke the function to create fields on render', function () {
            const tree = TestUtils.renderIntoDocument(<Form fieldType="checkbox" submit={submit} />);

            changeInput(tree, {
                target: {value: ''},
            });
            submitForm(tree);

            assert.lengthOf(args, 1, 'should have invoked the FieldSpec function once');
            assert.isNotNull(submitted, 'form should have submitted');
            assert.deepEqual(submitted, {example: true});
        });

        it('should invoke the fieldSpec when the component receives new props', function () {
            class Factory extends Component {
                constructor(props) {
                    super(props);
                    this.state = {
                        fieldType: 'checkbox',
                    }
                }

                render() {
                    return <Form fieldType={this.state.fieldType} submit={submit} />
                }
            }
            const tree = TestUtils.renderIntoDocument(<Factory />);
            // trigger a `componentWillReceiveProps`
            tree.setState({fieldType: 'input'});

            changeInput(tree, {
                target: {value: 'testing123'},
            });
            submitForm(tree);

            assert.lengthOf(args, 2, 'should have invoked the FieldSpec function once');
            assert.equal(args[0].fieldType, 'checkbox');
            assert.equal(args[1].fieldType, 'input');
            assert.isNotNull(submitted, 'form should have submitted');
            assert.deepEqual(submitted, {example: 'testing123'});
        });

        it('should update the fields state in via filterInput when the form fields change (@regression)', function () {
            const calls = [];
            class TrackingField extends fields.Field {
                filterInput(value) {
                    calls.push(value);
                    return value;
                }
            };
            const Form = higherform(props => {
                return {
                    example: 'checkbox' === props.fieldType ? fields.checkbox() : new TrackingField()
                };
            })(BasicForm);

            class Factory extends Component {
                constructor(props) {
                    super(props);
                    this.state = {
                        fieldType: 'checkbox',
                    }
                }

                render() {
                    return <Form fieldType={this.state.fieldType} submit={submit} />
                }
            }
            const tree = TestUtils.renderIntoDocument(<Factory />);
            changeInput(tree, {
                target: {value: 'testing123'},
            });
            // trigger a `componentWillReceiveProps`
            tree.setState({fieldType: 'input'});

            assert.lengthOf(calls, 1, 'Should have called filterInput on the updated field');
        });
    });

    describe('#FormSpec', function () {
        const FieldSpec = {
            example: fields.input(),
        };

        function createForm(FormSpec) {
            return higherform(FieldSpec, FormSpec)(BasicForm);
        }

        it('should invoke propsToForm on render to set the initial values', function () {
            const calls = [];
            const Form = createForm({
                propsToForm: function (props) {
                    calls.push(props);
                    return {
                        example: props.initialValue,
                    };
                },
            });

            const tree = TestUtils.renderIntoDocument(<Form initialValue="testing propsToForm" />);
            const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input');

            assert.lengthOf(calls, 1, 'should have invoked propsToForm once');
            assert.equal(input.getAttribute('value'), 'testing propsToForm');
        });

        it('it should invoke nextPropsToForm when the props update', function () {
            const calls = [];
            const Form = createForm({
                propsToForm: function (props) {
                    return {
                        example: props.initialValue,
                    };
                },
                nextPropsToForm: function (props, nextProps) {
                    calls.push(nextProps);
                    if (props.initialValue !== nextProps.initialValue) {
                        return {
                            example: nextProps.initialValue,
                        };
                    }
                }
            });
            class Factory extends Component {
                constructor(props) {
                    super(props);
                    this.state = {
                        initialValue: 'initial',
                    }
                }

                render() {
                    return <Form initialValue={this.state.initialValue} />
                }
            }
            const tree = TestUtils.renderIntoDocument(<Factory />);
            tree.setState({
                initialValue: 'changing',
            });

            const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input');
            assert.lengthOf(calls, 1, 'should have invoked nextPropsToForm once');
            assert.equal(input.getAttribute('value'), 'changing');
        });
    });
});
