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

        this.props.form.validate().then(formData => {
            // save formData somehow
        }, err => {
            // validation error, your form should update with error states
        });
    }

    render() {
        let { form, fields} = this.props;

        return (
            <form onSubmit={this.onSubmit.bind(this)}>
                <input type="text" {..fields.name} />
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
invoked on class construct as well as whenever new props are received.

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

        this.props.form.validate().then(formData => {
            // save formData somehow
        }, err => {
            // validation error, your form should update with error states
        });
    }

    render() {
        let { form, fields, selectValues} = this.props;

        return (
            <form onSubmit={this.onSubmit.bind(this)}>
                <select {...fields.selectField}>
                    <option value="">Select a Value</option>
                    {selectValues.map((v, key) => <option key={key} value={v}>{v}</option>)}
                </select>
            </form>
        );
    }
}

const FieldSpec = {
    name: select(validators.required('Please enter a name')),
}

export default higherform(ownProps => {
    return {
        selectField: fields.select(validators.oneOf(ownProps.selectValues)),
    };
})(MyForm);
```
