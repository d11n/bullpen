// eslint-disable-next-line max-params
(function main(Query) {
    const ALL_ITEMS = new String('*'); // eslint-disable-line no-new-wrappers
    const NOOP = new String('NOOP'); // eslint-disable-line no-new-wrappers
    return module.exports = Object.freeze({
        ALL_ITEMS,
        NOOP,
        validate_op_args,
        }); // eslint-disable-line indent

    // -----------

    function validate_op_args(raw_arg0, op, op_params) {
        const arg0 = undefined === raw_arg0
            ? ALL_ITEMS
            : raw_arg0
            ; // eslint-disable-line indent
        switch (true) {
            case ALL_ITEMS === arg0:
            case arg0 instanceof Query:
            case 'string' === typeof arg0:
            case 'number' === typeof arg0:
                if (op && 'string' !== typeof op) {
                    throw new Error([
                        'When calling a bullpen operation,',
                        'if arg 1 is provided, it must be',
                        'the name of the operation to perform',
                        ].join(' ')); // eslint-disable-line indent
                } else if (op_params && 'object' !== typeof op_params) {
                    throw new Error([
                        'When calling a bullpen operation,',
                        'if arg 2 is provided, it must be a params object',
                        ].join(' ')); // eslint-disable-line indent
                }
                return [ arg0, op, op_params ];
        }
        throw new Error([
            'When calling a bullpen operation, if args are provided,',
            'arg 0 of must be one of:',
            'a string, a number, COLLECTION.ALL_ITEMS, or',
            'an instance of COLLECTION.Query',
            ].join(' ')); // eslint-disable-line indent
    }
}(
    require('./query'),
));
