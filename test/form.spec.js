import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
                    {this._data()}
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

        _data() {
            let fd = this.props.form.data


            return (
                <div className="form-data">
                    {Object.keys(fd).map((k, i) => <p key={i}>{k}: {JSON.stringify(fd[k])}</p>)}
                </div>
            );
        }
    }

    describe('#FieldSpec(object)', function () {
        let submitted = null;
        const submit = (formData) => submitted = formData;
        beforeEach(function () {
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

            assert.isNull(submitted);
            const errors = TestUtils.scryRenderedDOMComponentsWithClass(tree, 'error');
            assert.lengthOf(errors, 1, 'should have rendered one error');
        });
    });

    describe('#FieldSpec(function)', function () {
        let submitted = null;
        const submit = (formData) => submitted = formData;
        let args = [];
        const FieldSpec = (props, prevFields) => {
            args.push({props, prevFields});
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
            submitted = null;
            args = [];
        });

        function assertExpectedArgs(args) {
            assert.property(args, 'props', 'should have a props field');
            assert.property(args, 'prevFields', 'should have a prevFields property');
        }

        it('should invoke the function to create fields on render', function () {
            const tree = TestUtils.renderIntoDocument(<Form fieldType="checkbox" submit={submit} />);

            changeInput(tree, {
                target: {value: ''},
            });
            submitForm(tree);

            assert.lengthOf(args, 1, 'should have invoked the FieldSpec function once');
            assertExpectedArgs(args[0]);
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
            assertExpectedArgs(args[0]);
            assert.equal(args[0].props.fieldType, 'checkbox');
            assertExpectedArgs(args[1]);
            assert.equal(args[1].props.fieldType, 'input');
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
