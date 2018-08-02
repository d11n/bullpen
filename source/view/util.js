// eslint-disable-next-line max-params
(function main() {
    const NOOP = new String('NOOP'); // eslint-disable-line no-new-wrappers
    return module.exports = Object.freeze({
        NOOP,
        validate_op_args,
        }); // eslint-disable-line indent

    // -----------

    function validate_op_args(op, op_params) {
        switch (true) {
            case undefined === op:
            case null === op:
            case 'string' === typeof op:
                if (op_params && 'object' !== typeof op_params) {
                    throw new Error([
                        'When calling a bullpen operation for a view,',
                        'if arg 1 is provided, it must be a params object',
                        ].join(' ')); // eslint-disable-line indent
                }
                return [ op, op_params ];
        }
        throw new Error([
            'When calling a bullpen operation for a view,',
            'if args are provided, arg 0 of must be a string',
            ].join(' ')); // eslint-disable-line indent
    }
}());
