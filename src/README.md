# Higher Order Form Abstraction

The components here are used to easily track form state as well as provide
validation.

## Basic Usage Example

```js
import React, { Component, PropTypes } from 'react';
import { connectForm, FormShape, FieldsShape } from 'higherforms';

function MyForm extends Component {
    static propTypes = {
        form: FormShape,
        fields: FieldsShape,
    },

    onSubmit(event) {
        // use the validate function on the form to make sure your data is okay
        // this will set the error state and cause the form to re-render if
        // the form is not valid.
        this.props.form.validate().then(formData => {
            doSomeSaving(formData);
        });
    }

    render() {
        let { form, fields } = this.props;

        return (
            <form onSubmit={this.onSubmit.bind(this)}>
                <div class={`form-group `+(!!form.errors.name ? 'has-error' : '')}>
                    <input type="text" {...fields.name} />
                    // form.name.errors will be an array of string error messages
                    <FormErrors errors={form.name.errors} />
                </div>
                <button type="submit">Save</button>
            </form>
        );
    }
}

export default connectForm([
    // the fields to track
    'name',
], function (formData, ctx) {
    // this is a validation callback. `formData` is an object with the form
    // field names as props (the values you passed to the first argument of
    // connectForm).

    // use context to add errors
    if (!form.name) {
        ctx.addViolation('name', 'This value is required');
    }
})(MyForm);
```

An object may be passed to the second argument of `connectForm`. See
`DefaultSpec` in `amp/component/forms/form` for more info about what methods
are used on that object.
