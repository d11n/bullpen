// eslint-disable-next-line max-params
(function main() {
    const NOOP = new String('NOOP'); // eslint-disable-line no-new-wrappers
    return module.exports = Object.freeze({
        NOOP,
        validate_op_args,
    });

    // -----------

    function validate_op_args({ op, data }) {
        const { name, params } = op;
        switch (true) {
            case undefined === name:
            case null === name:
            case 'string' === typeof name:
                if (params && 'object' !== typeof params) {
                    throw new Error([
                        'When calling a Treepen operation,',
                        'if arg 1 is provided, it must be a params object',
                    ].join(' '));
                }
                return { op, data };
        }
        throw new Error([
            'When calling a Treepen operation,',
            'if args are provided, arg 0 of must be a string',
        ].join(' '));
    }
}());
