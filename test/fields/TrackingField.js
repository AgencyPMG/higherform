import { fields } from '../../src';

export default class TrackingField extends fields.Field {
    constructor(validators) {
        super(validators);
        this.toMethodsCalls = [];
        this.validateCalls = [];
        this.filterInputCalls = [];
        this.filterOutputCalls = [];
    }

    filterInput(inValue) {
        this.filterInputCalls.push(inValue);
        return super.filterInput(inValue);
    }

    filterOutput(outValue) {
        this.filterOutputCalls.push(outValue)
        return super.filterOutput(outValue);
    }

    toMethods(name, updateValue, getValue) {
        this.toMethodsCalls.push([name, updateValue, getValue]);
        return super.toMethods(name, updateValue, getValue);
    }

    validate(formData, ctx) {
        this.validateCalls.push([formData, ctx]);
        return super.validate(formData, ctx);
    }
}
