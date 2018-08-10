// eslint-disable-next-line max-params
(function main() {
    const NOOP = new String('NOOP'); // eslint-disable-line no-new-wrappers
    return module.exports = Object.freeze({
        NOOP,
        validate_op_args,
        }); // eslint-disable-line indent

    // -----------

    function validate_op_args({ op_name, op_params }) {
        switch (true) {
            case undefined === op_name:
            case null === op_name:
            case 'string' === typeof op_name:
                if (op_params && 'object' !== typeof op_params) {
                    throw new Error([
                        'When calling a Statepen operation,',
                        'if arg 1 is provided, it must be a params object',
                        ].join(' ')); // eslint-disable-line indent
                }
                return [ op_name, op_params ];
        }
        throw new Error([
            'When calling a Statepen operation,',
            'if args are provided, arg 0 of must be a string',
            ].join(' ')); // eslint-disable-line indent
    }
}());
