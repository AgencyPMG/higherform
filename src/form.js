/**
 * A higher order form component that handles syncing the state of a form
 * as well as validation, etc.
 *
 * @module higherform
 */

import React, { Component, createElement } from 'react';
import invariant from 'invariant';
import hoistStatics from 'hoist-non-react-statics';
import { context as validationContext } from './validators';

function displayNameFor(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}


/**
 * This is the default specification for a form.
 */
const DefaultFormSpec = {
    /**
     * Called on component creation to map the initial props to the form
     * values.
     *
     * @param {object} props The props passed to the component
     * @return {object|undefined} Return an object of {fieldName: value} pairs.
     *         May return a falsey value to decline doing anything
     */
    propsToForm: function (props) {
        return {};
    },

    /**
     * Invoked by the component in `componentWillReceiveProps`. This is
     * useful should you want to change the form values when the component
     * moves to a new entity or something.
     *
     * Return a falsy value here to decline the update.
     *
     * @param {object} props the components current props
     * @param {object} nextProps The components next props
     * @return {object|undefined} A new set of form data or a falsey value to
     *         decline doing an update.
     */
    nextPropsToForm: function (props, nextProps) {
        // noop
    },
}

/**
 * Ensure the spec from the user has the required methods.
 */
function createValidSpec(userSpec) {
    return Object.assign({}, DefaultFormSpec, userSpec);
}

function isPlainObject(check) {
    return typeof check === 'object' && !!check;
}

function filterFormData(formData, fields) {
    invariant(isPlainObject(formData), 'propsToForm and nextPropsToForm must return plain objects');
    let nf = {};
    for (let field in fields) {
        nf[field] = fields[field].filterInput(formData[field] || '');
    }

    return nf;
}

/**
 * Creates a higher order component that decorates a form.
 *
 * @param {object|function} fieldSpec An array of string field names the form will track
 * @param {object|undefined} formSpec The form lifecycle spec. This includes
 *        allows you to hook in and modify how the form should behave on validaiton,
 *        setting up defualt values from the props, and handing updating props.
 *        If a function is given here it will be treated as the `validate`
 *        part of the spec.
 * @return {func} A decorator function.
 */
export default function higherform(fieldSpec, formSpec) {
    if (typeof formSpec === 'undefined') {
        formSpec = {};
    }

    invariant(isPlainObject(fieldSpec) || typeof fieldSpec === 'function',  'field spec must be an object or a function');
    invariant(isPlainObject(formSpec), 'The form spec must be a plain object');

    const finalFormSpec = createValidSpec(formSpec);

    return function (WrappedComponent) {

        class HigherForm extends Component {
            constructor(props, context) {
                super(props, context);
                this.fields = undefined;
                this._configureFields(props);
                let formData = filterFormData(finalFormSpec.propsToForm(props) || {}, this.fields);
                this.state = {
                    __errors: {},
                    ...formData,
                };
                this.submit = this.submit.bind(this);
            }

            componentWillReceiveProps(nextProps) {
                let fieldsChanged = this._configureFields(nextProps);
                let newFormData = finalFormSpec.nextPropsToForm(this.props, nextProps);
                if (!!newFormData) {
                    this.setState(filterFormData(newFormData, this.fields));
                } else if (fieldsChanged) {
                    // if the fields updated, we need to ensure the state that's
                    // tracked by this class is up to date with the fields
                    this.setState(filterFormData(this.state, this.fields));
                }
            }

            /**
             * Validate the form, and if it's good to go, call the `submit` callback
             * with the form data object.
             *
             * @param {func(formData)} submit the callback to "sumbit" the form data.
             * @return void
             */
            submit(callback) {
                let toSubmit = {};
                let errors = {};
                let hasErrors = false;
                for (let field in this.fields) {
                    let ctx = validationContext();
                    this.fields[field].validate(this.state[field], ctx);
                    if (ctx.hasViolations()) {
                        hasErrors = true;
                        errors[field] = ctx.getViolations();
                    } else {
                        toSubmit[field] = this.fields[field].filterOutput(this.state[field]);
                    }
                }

                // always call `setState` here so previous errors get cleared
                // or new errors are udpated.
                this.setState({
                    __errors: errors,
                });

                if (!hasErrors) {
                    callback(toSubmit);
                }
            }

            buildFields() {
                let out = {};
                for (let field in this.fields) {
                    out[field] = this._buildFieldMethods(field);
                }

                return out;
            }

            buildForm() {
                return {
                    submit: this.submit,
                    errors: this.state.__errors,
                }
            }

            getWrappedInstance() {
                return this.instance;
            }

            render() {
                this.instance = createElement(WrappedComponent, {
                    fields: this.buildFields(),
                    form: this.buildForm(),
                    ref: f => this.instance = f,
                    ...this.props
                });

                return this.instance;
            }

            _buildFieldMethods(field) {
                return this.fields[field].toMethods(field, value => {
                    if (typeof value !== 'function') {
                        return this.setState({[field]: value});
                    }

                    return this.setState(function (nextState) {
                        return {[field]: value(nextState[field])};
                    });
                }, () => this.state[field]);
            }

            _configureFields(props) {
                var nf;
                if (typeof fieldSpec === 'function') {
                    nf = fieldSpec(props);
                    invariant(isPlainObject(nf), 'the fieldSpec function must return a plain object');
                } else {
                    nf = fieldSpec;
                }

                let updated = this.fields !== nf;

                this.fields = nf;

                return updated;
            }
        }

        HigherForm.displayName = `HigherForm(${displayNameFor(WrappedComponent)})`;
        HigherForm.WrappedComponent = WrappedComponent;

        return hoistStatics(HigherForm, WrappedComponent);
    };
}
