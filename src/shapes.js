/**
 * Values suitable for use within `propTypes` of components.
 *
 * @module higherform
 */

import { PropTypes } from 'react';

export const FormShape = PropTypes.shape({
    submit: PropTypes.func,
    errors: PropTypes.object,
});

export const FieldShape = PropTypes.object;

export const FieldsShape = PropTypes.objectOf(FieldShape);
