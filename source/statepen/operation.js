// eslint-disable-next-line max-params
(function main(Store) {
    class Operation {
        constructor(...args) {
            return construct_operation.call(this, ...args);
        }
    }
    return module.exports = Object.freeze(Operation);

    // -----------

    function construct_operation(raw_params) {
        const op = this;
        Object.assign(op, validate_constructor_params(raw_params));
        const store_func = raw_params.store[ raw_params.store_verb ];
        Object.assign(op, { execute_on_store });
        return op;

        // -----------

        function execute_on_store() {
            return store_func({ name: op.name, params: op.params });
        }
    }

    function validate_constructor_params(raw_params) {
        const params = {};
        enforce_conduct();
        params.verb = raw_params.bullpen_verb;
        params.name = raw_params.name;
        params.params = raw_params.params;
        return params;

        // -----------

        function enforce_conduct() {
            enforce_required_object('store', Store, 'Store');
            const verb_list = [ 'bullpen', 'store' ];
            for (const verb of verb_list) {
                enforce_required_string(`${ verb }_verb`);
            }
            ![ 'get', 'stream', 'mutate' ].includes(raw_params.bullpen_verb)
                && throw_error([
                    'bullpen_verb must be either "get", "stream", or "mutate",',
                    `not '${ raw_params.bullpen_verb }'`,
                    ].join(' ')) // eslint-disable-line indent
                ; // eslint-disable-line indent
            ![ 'fetch', 'mutate' ].includes(raw_params.store_verb)
                && throw_error([
                    'bullpen_verb must be either "fetch" or "mutate",',
                    `not '${ raw_params.store_verb }'`,
                    ].join(' ')) // eslint-disable-line indent
                ; // eslint-disable-line indent
            const { name, params: op_params } = raw_params;
            if (name && 'string' !== typeof name) {
                throw new Error([
                    'when calling a Statepen operation,',
                    'if arg 0 is provided, it must be',
                    'the name of the operation to perform',
                ]);
            } else if (op_params && 'object' !== typeof op_params) {
                throw new Error([
                    'when calling a Statepen operation,',
                    'if arg 1 is provided, it must be a params object',
                ]);
            }
            return true;
        }
        function enforce_required(param) {
            return undefined !== raw_params[param]
                || throw_error(`${ param } is required`)
                ; // eslint-disable-line indent
        }
        function enforce_required_object(param, Ref, name) {
            return enforce_required(param)
                && !(raw_params[param] instanceof Ref)
                && throw_error(`${ param } must be an instance of ${ name }`)
                ; // eslint-disable-line indent
        }
        function enforce_required_string(param) {
            return enforce_required(param)
                && 'string' !== typeof raw_params[param]
                && throw_error(`${ param } must be a string`)
                ; // eslint-disable-line indent
        }
    }

    // -----------

    function throw_error(message) {
        throw new Error(`BULLPEN.Statepen.Operation: ${ message }`);
    }
}(
    require('./store'),
));
