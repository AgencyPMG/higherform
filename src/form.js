/**
 * A higher order form component that handles syncing the state of a form
 * as well as validation, etc.
 *
 * @module higherforms
 */

import React, { Component, createElement } from 'react';
import invariant from 'invariant';
import hoistStatics from 'hoist-non-react-statics';

function displayNameFor(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

class ValidationContext {
    constructor() {
        this.errors = {};
    }

    addViolation(path, message) {
        if (!this.errors[path]) {
            this.errors[path] = [];
        }
        this.errors[path].push(message);
    }

    hasErrors() {
        return Object.keys(this.errors).length > 0;
    }
}

/**
 * This is the default specification for a form.
 */
const DefaultSpec = {
    /**
     * Validates the form data.
     * 
     * @param {object} formData the data from the form.
     * @param {ValidationContext} ctx A validation context interface used to
     *        add validation violations.
     * @return void
     */
    validate: function (formData, ctx) {
        // noop
    },

    /**
     * Called on component creation to map the initial props to the form
     * values.
     *
     * @param {object} props The props passed to the component
     * @return {object|undefined} Return an object of {fieldName: value} pairs.
     *         May return a falsey value to decline doing anything
     */
    propsToData: function (props) {
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
    nextPropsToData: function (props, nextProps) {
        // noop
    }
}

/**
 * Ensure the spec from the user has the required methods.
 */
function createValidSpec(userSpec) {
    return Object.assign({}, DefaultSpec, userSpec);
}

/**
 * Creates a higher order component that decorates a form.
 *
 * @param {array} fields An array of string field names the form will track
 * @param {func|object|undefined} spec The form lifecycle spec. This includes
 *        allows you to hook in and modify how the form should behave on validaiton,
 *        setting up defualt values from the props, and handing updating props.
 *        If a function is given here it will be treated as the `validate`
 *        part of the spec.
 * @return {func} A decorator function.
 */
export default function connectForm(fields, spec) {
    if (typeof spec === 'function') {
        spec = {
            validate: spec,
        };
    } else if (typeof spec === 'undefined') {
        spec = {};
    }

    invariant(Array.isArray(fields), 'fields must be an array of field names');
    invariant(typeof spec === 'object' && !!spec, 'The form spec must be a plain object');

    const finalSpec = createValidSpec(spec);

    return function (WrappedComponent) {

        class Form extends Component {
            constructor(props, context) {
                super(props, context);
                let formData = finalSpec.propsToData(props) || {};
                fields.forEach(field => {
                    this[this._changeHandlerName(field)] = this._createChangeHandler(field);
                    if (!formData[field]) {
                        formData[field] = '';
                    }
                });

                this.state = {
                    formData,
                    errors: {},
                };
                this.validate = this.validate.bind(this);
            }

            componentWillReceiveProps(nextProps) {
                let newFormData = finalSpec.nextPropsToData(this.props, nextProps);
                if (!!newFormData) {
                    fields.forEach(f => {
                        if (!newFormData[f]) {
                            newFormData[f] = '';
                        }
                    });
                    this.setState({
                        formData: newFormData
                    });
                }
            }

            validate() {
                return new Promise((resolve, reject) => {
                    let ctx = new ValidationContext();
                    finalSpec.validate(this.state.formData, ctx);

                    if (ctx.hasErrors()) {
                        this.setState({
                            errors: ctx.errors,
                        });
                        reject(ctx.errors);
                    } else {
                        resolve(this.state.formData);
                    }
                });
            }

            _changeHandlerName(field) {
                return field + 'Change';
            }

            _createChangeHandler(field) {
                return event => {
                    let value = event.target.value;
                    this.setState(function (ns) {
                        return {
                            formData: Object.assign({}, ns.formData, {
                                [field]: value,
                            }),
                        };
                    });
                };
            }

            get fields() {
                let f = {};
                fields.forEach(fn => {
                    f[fn] = {
                        name: fn,
                        value: this.state.formData[fn],
                        onChange: this[this._changeHandlerName(fn)],
                    };
                });

                return f;
            }

            get form() {
                return {
                    validate: this.validate,
                    errors: this.state.errors,
                }
            }

            getWrappedInstance() {
                return this.instance;
            }

            // fairly common for form elements to have a `submit` method on the
            // wrapped instance. So provide some sugar for that.
            submit() {
                if (typeof this.instance.submit === 'function') {
                    return this.instance.submit();
                }

                throw new Error('this.instance.submit is not a function');
            }

            render() {
                this.instance = createElement(WrappedComponent, {
                    fields: this.fields,
                    form: this.form,
                    ref: f => this.instance = f,
                    ...this.props
                });

                return this.instance;
            }
        }

        Form.displayName = `Form(${displayNameFor(WrappedComponent)})`;
        Form.WrappedComponent = WrappedComponent;

        return hoistStatics(Form, WrappedComponent);
    };
}
