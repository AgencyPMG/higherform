/**
 * Values suitable for use within `propTypes` of components.
 *
 * @module higherform
 */

import { PropTypes } from 'react';

export const FormShape = PropTypes.shape({
    validate: PropTypes.func,
    errors: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)),
});

export const FieldShape = PropTypes.func;

export const FieldsShape = PropTypes.objectOf(FieldShape);
