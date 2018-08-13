// eslint-disable-next-line max-params
(function main(WEB_SERVICE, Store, UTIL) {
    const { Endpoint } = WEB_SERVICE.Web_service;
    class Operation {
        constructor(...args) {
            return construct_operation.apply(this, args);
        }
    }
    return module.exports = Object.freeze(Operation);

    // -----------

    function construct_operation(raw_params) {
        const op = this;
        Object.assign(op, validate_constructor_params(raw_params));
        const data_func = raw_params.endpoint[ raw_params.endpoint_verb ];
        const store_func = raw_params.store[ raw_params.store_verb ];
        Object.assign(op, { execute_on_endpoint, execute_on_store });
        return op;

        // -----------

        function execute_on_endpoint(data) {
            // Refactor Endpoint to use params && not be coupled to Collection
            return data_func('', op.name, {
                ...op.params,
                fallback_to_nameless: true,
            });
        }

        function execute_on_store(data) {
            return store_func({
                op: { name: op.name, params: op.params },
                data,
            });
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
            enforce_required_object('endpoint', Endpoint, 'Endpoint');
            enforce_required_object('store', Store, 'Store');
            const verb_list = [ 'bullpen', 'endpoint', 'store' ];
            for (const verb of verb_list) {
                enforce_required_string(`${ verb }_verb`);
            }
            /* eslint-disable indent */
            ![ 'get', 'stream', 'mutate' ].includes(raw_params.bullpen_verb)
                && throw_error([
                    'bullpen_verb must be either "get", "stream", or "mutate",',
                    `not '${ raw_params.bullpen_verb }'`,
                    ])
                ;
            ![ 'fetch', 'mutate' ].includes(raw_params.store_verb)
                && throw_error([
                    'store_verb must be either "fetch" or "mutate",',
                    `not '${ raw_params.store_verb }'`,
                    ])
                ;
            const { endpoint, endpoint_verb } = raw_params;
            'function' !== typeof endpoint[endpoint_verb]
                && throw_error('endpoint_verb must be method on the endpoint')
                ;
            /* eslint-enable indent */
            const { name, params: op_params } = raw_params;
            if (name && 'string' !== typeof name) {
                throw_error([
                    'when constructing a Treepen operation,',
                    'if arg 0 is provided, it must be',
                    'the name of the operation as a string',
                ]);
            } else if (op_params && 'object' !== typeof op_params) {
                throw_error([
                    'when constructing a Treepen operation,',
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

    function throw_error(raw_message) {
        const message = Array.isArray(raw_message)
            ? raw_message.join(' ')
            : String(raw_message)
            ;
        throw new Error(`BULLPEN.Treepen.Operation: ${ message }`);
    }
}(
    require('../web-service'),
    require('./store'),
    require('./util'),
));
