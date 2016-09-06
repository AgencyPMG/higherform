import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom';
import higherform, { fields, validators, FormShape, FieldsShape } from './src';

let nextId = 1;
function genId() {
    return `field-${nextId++}`;
}

function ErrorMessages({messages}) {
    if (!messages) {
        return null;
    }

    return (
        <div className="errors">
            {messages.map((msg, i) => <span className="help-block" key={i}>{msg}</span>)}
        </div>
    );
}

class FormComponent extends Component {
    _group(field, control, errors) {
        let messages = typeof errors === 'undefined' ? this.props.form.errors[field] : errors;

        return (
            <div className={this._groupClass(messages)}>
                <label htmlFor={field}>{field}</label>
                {control}
                <ErrorMessages messages={messages} />
            </div>
        );
    }

    _groupClass(errors) {
        let classes = [
            'form-group',
            !!errors ? 'has-error' : false
        ];

        return classes.filter(c => !!c).join(' ');
    }
}

class KitchenSink extends FormComponent {
    constructor(props) {
        super(props);
        this.onSubmit = this.onSubmit.bind(this);
        this.addToCollection = this.addToCollection.bind(this);
    }

    onSubmit(event) {
        event.preventDefault();
        this.props.form.submit(formData => {
            console.log(formData);
        });
    }

    addToCollection(event) {
        event.preventDefault();
        this.props.fields.collection.add();
    }

    removeFromCollection(event, idx) {
        event.preventDefault();
        this.props.fields.collection.remove(idx);
    }

    render() {
        let { fields, form } = this.props;
        return (
            <form className="form" onSubmit={this.onSubmit}>
                {this._group('input', <input type="text" id="input" className="form-control" {...fields.input.props()} />)}
                {this._group('textarea', <textarea id="textarea" className="form-control" {...fields.textarea.props()} />)}
                {this._group('checkbox', <input type="checkbox" id="checkbox" {...fields.checkbox.props()} />)}
                {this._group('select', <select id="select" className="form-control" {...fields.select.props()}>
                    <option value="">Select a Value</option>
                    <option value="one">First Value</option>
                    <option value="two">Second Value</option>
                </select>)}
                {this._group('radio', <div className="radio">
                    <label><input type="radio" {...fields.radio.props('one')} /> One</label>
                    <br />
                    <label><input type="radio" {...fields.radio.props('two')} /> Two</label>
                </div>)}
                <fieldset>
                    <legend>Shape Field</legend>
                    {this._group(
                        'shapeOne',
                        <input type="text" id="shapeOne" className="form-control" {...fields.shape.props('one')} />,
                        !!form.errors.shape ? form.errors.shape.one : false
                    )}
                    {this._group(
                        'shapeTwo',
                        <input type="text" id="shapeTwo" className="form-control" {...fields.shape.props('two')} />,
                        !!form.errors.shape ? form.errors.shape.two : false
                    )}
                </fieldset>
                <fieldset>
                    <legend>Collection</legend>
                    <p>
                        <button type="button" className="btn btn-default" onClick={this.addToCollection}>Add</button>
                    </p>
                    {this._renderCollection(idx => {
                        let cls = !!form.errors.collection && !!form.errors.collection[idx] ? 'has-errors' : '';
                        return <div className={`input-group ${cls}`} key={idx} style={{marginBottom: '10px'}}>
                            <input type="text" className="form-control" {...fields.collection.props(idx)} />
                            <span className="input-group-btn">
                                <button type="button" className="btn btn-default" onClick={(event) => this.removeFromCollection(event, idx)}>&times;</button>
                            </span>
                        </div>
                    })}
                </fieldset>
                <button type="submit" className="btn btn-primary">Submit</button>
            </form>
        );
    }

    _renderCollection(callback) {
        let indices = [];
        let length = this.props.fields.collection.length();
        // y u no have range function?!
        for (let i = 0; i < length; i++) {
            indices.push(i);
        }

        return <div>{indices.map(callback)}</div>
    }
}
KitchenSink.propTypes = {
    form: FormShape,
    fields: FieldsShape,
};

const FinalKitchenSink = higherform({
    input: fields.input(validators.required()),
    textarea: fields.textarea(),
    checkbox: fields.checkbox(),
    select: fields.select(validators.required()),
    radio: fields.radio(),
    shape: fields.shape({
        one: fields.input(validators.required()),
        two: fields.input(),
    }),
    collection: fields.collection(fields.input(validators.required())),
})(KitchenSink);


ReactDOM.render(<FinalKitchenSink />, document.getElementById('kitchen-sink'));
