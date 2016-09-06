# Higher Form

A ReactJS library for dealing with forms.

## Quick Example

```js
import React, { PropTypes, Component } form 'react';
import higherform, { fields, validators, FormShape, FieldsShape } from 'higherform';

class MyForm extends Component {
    static propTypes = {
        form: FormShape,
        fields: FieldsShape,
    }

    onSubmit(event) {
        event.preventDefault();

        // on form submit call the higher form submit method and provide a
        // handler for the form data.
        this.props.form.submit(formData => {
            // save formData somehow
        });
    }

    render() {
        let { form, fields} = this.props;

        return (
            <form onSubmit={this.onSubmit.bind(this)}>
                <input type="text" {...fields.name.props()} />
            </form>
        );
    }
}

const FieldSpec = {
    name: fields.input(validators.required('Please enter a name')),
}

export default higherform(FieldSpec)(MyForm);
```

## Dynamic Field Specs from Props

Pass a function to `higherform` rather than a specification object. It will be
invoked on object instantiation as well as whenever new props are received.

```js
import React, { PropTypes, Component } form 'react';
import higherform, { fields, validators, FormShape, FieldsShape } from 'higherform';

class MyForm extends Component {
    static propTypes = {
        form: FormShape,
        fields: FieldsShape,
        selectValues: PropTypes.arrayOf(PropTypes.string).isRequired,
    }

    onSubmit(event) {
        event.preventDefault();

        this.props.form.submit(formData => {
            // save formData somehow
        });
    }

    render() {
        let { form, fields, selectValues } = this.props;

        return (
            <form onSubmit={this.onSubmit.bind(this)}>
                <select {...fields.selectField.props()}>
                    <option value="">Select a Value</option>
                    {selectValues.map((v, key) => <option key={key} value={v}>{v}</option>)}
                </select>
            </form>
        );
    }
}

export default higherform(ownProps => {
    return {
        selectField: fields.select(validators.oneOf(ownProps.selectValues)),
    };
})(MyForm);
```

## Working with Radio Buttons

The `fields` prop passed to your form component is an object of functions. Radio
button fields require that you pass the value of the radio field. This helps
higherform track whether or not the radio input should be checked.

```js
import React, { Component } from 'react';
import higherform, { fields } from 'higherform';

class FormWithRadio extends Component {
    render() {
        return (
            let { fields } = this.props;
            <form>
                <input type="radio" {...fields.radioField.props('one')} />
                // render <input type="radio" value="one" onClick={...} checked={"one" === HigherForm.state.radioField} />
                <input type="radio" {...fields.radioField.props('two')} />
                <input type="radio" {...fields.radioField('three')} />
            </form>
        );
    }
}

export default higherform({
    radioField: fields.radio(),
})(FormWithRadio);

```

## Setting Initial Values on the Form

`higherform` takes a second `FormSpec` object that deals with mapping the
incoming (and next) props to form data. Form spec can provide `propsToForm` and
`nextPropsToForm` methods.

```js

import higherform, { fields } from 'higherform';

// same `MyForm component from above

function entityToForm(entity) {
    return {
        name: entity.name,
        otherField: entity.whatever,
    };
}

const FormSpec = {
    // invoke on component instiantiation. Use this to set the default values
    // in the form field. Should return an object with the field names as keys
    propsToForm: props => entityToForm(props.entity),

    // invoked whenever the component receives new props. This is useful for
    // updating the form if/when the underlying data changes. Say, for instance,
    // the form is to edit some entity in your application. If the underlying
    // entity prop change, the form should show the new values. Return an object
    // here to reset the form data. Or return a falsy value to decline doing
    // anything.
    nextPropsToForm: (props, nextProps) => {
        if (props.id !== nextProps.id) {
            return entityToForm(nextProps.entity);
        }
    },
};

const FieldSpec = {
    name: fields.input(),
    otherField: fields.select(),
};

export default higherform(FieldSpec, FormSpec)(MyForm);
```

## Fields

Fields are barebones objects that adhere to the `higherforms.fields.Field`
interface. Essentially the field abstraction is a way to define validation, what
props are provied to your components, and how those form values should be
stored.

There are several field *types* available.

```js
import { fields } from 'higherform';

const FieldSpec = {
    // suitable for just about any <input /> tag except radio buttons and
    // checkboxes.
    input: fields.input(),

    // suitable for radio buttons and checkboxes.
    checkbox: fields.checkbox(),
    radio: fields.radio(),

    textarea: fields.textarea(),

    select: fields.select(),
};
```

## Validators

Validators are functions that are invoke with the current form value as well as
a *validation context*. A validation context provies a way to add violations
(errors) to the form.

Here's a custom validator example.

```js
import higherform, { fields } from 'higherform';

const FieldSpec = {
    // the function passed to `input` is a validator
    hello: fields.input(function (value, ctx) {
        if (! /hello/.test(value)) {
            ctx.addViolation('Name does not contain hello!');
        }
    }),
};
```

If any validators cause form violations, the form's handler (the callback passed
to `this.props.form.submit`) is not invoked. Instead the form's state is updated
and the violations are passed to your component at `this.props.form.errors`.

### Built in Validators

```js
import { fields, validators } from 'higherform';

const FieldSpec = {
    // marks the field as required. Only non-empty values will be accepted
    required: fields.input(validators.required('Error message to display if the field is empty')),

    // only allows the field to take a whitelist of values.
    whitelist: fields.input(validators.oneOf([
        'one',
        'two',
    ], 'error message to display to the user'),

    // only allows values that match the provied pattern.
    matches: fields.input(validators.matches(/hello/, 'error message to display')),

    // invokes all the validators provied.
    chain: fields.input(validators.chain(
        // both of these use the default error messages
        validators.required(),
        validators.oneOf(['one', 'two']),
    )),

    // like chain, this takes a set of validators, but it stops invoking them
    // if/when the first violation happens.
    shortChain: fields.input(validators.shortChain(
        validators.required(),
        validators.oneOf(['one', 'two']),
    )),
```

### About Validator Messages

No built in validator requires a message. If you choose to provide a message
it can be a string or a function. If a function, it will be invoked with the
value.

```js
const FieldSpec = {
    whitelist: fields.input(validators.oneOf([
        'one',
        'two',
    ], function (invalidValue) {
        return `${invalidValue} is not an acceptable answer.`;
    }),
};
```
