// eslint-disable-next-line max-params
(function main(Bullpen, WEB_SERVICE, Store, Op, UTIL) {
    const { NOOP } = UTIL;
    class Treepen extends Bullpen {
        constructor(...args) {
            return super(...args) && construct_treepen.apply(this, args);
        }
    }
    // Instance members
    Object.assign(Treepen.prototype, {
        perform_operation,
    });
    // Static members
    Object.defineProperties(Treepen, {
        // Final
        NOOP: { value: NOOP, enumerable: true },
        // Overridable by subclass
        Store: { value: Store, writable: true, enumerable: true },
        Operation: { value: Op, writable: true, enumerable: true },
    });
    return module.exports = Object.seal(Treepen);

    // -----------

    function construct_treepen(raw_params) {
        const treepen = this;
        const { endpoint, store } = validate_params(treepen, raw_params);
        const creator_args = [ treepen, endpoint, store ];
        treepen.get = create_getter(...creator_args);
        treepen.stream = create_streamer(...creator_args);
        treepen.mutate = create_mutator(...creator_args);
        return treepen;
    }

    function validate_params(treepen, raw_params) {
        const { endpoint, store } = raw_params;
        const params = {};
        /* eslint-disable indent */
        params.endpoint
            = !(endpoint instanceof WEB_SERVICE.Web_service.Endpoint)
                ? throw_error(
                    'endpoint must be an instance of Web_service.Endpoint',
                    )
                : endpoint
            ;
        params.store
            = undefined === store
                ? new treepen.constructor.Store
            : !(store instanceof Store)
                ? throw_error('store must be an instance of Treepen.Store')
            : store
            ;
        /* eslint-enable indent */
        return params;
    }

    // -----------

    /// ## Collection.get(
    /// ###    Collection.ALL_ITEMS | Collection.Query | String/Number id,
    /// ###    String op,
    /// ###    Object params,
    /// ###    )
    /// Get a fully dereferenced item or composed result from the collection.
    /// <br/>
    /// `get()` is used when live updates are not desireable, typically in
    /// writeable contexts (e.g. editing a form) and frequently-updating
    /// read-only contexts (e.g. social feed).
    /// <br/>
    /// e.g.
    /// Two users are editing the form for the same article at the same time.
    /// To prevent the first user to save from replacig the form contents of the
    /// other user (causing them to lose their work), the contents of the form
    /// should be retrieved use `get()`, instead of `stream()`.
    function create_getter(treepen, endpoint, store) {
        const static_op_params = Object.assign({ endpoint, store }, {
            bullpen_verb: 'get',
            endpoint_verb: 'fetch',
            store_verb: 'fetch',
        });
        return function get_from_tree(name, params) {
            return treepen.perform_operation(
                new Op({ ...static_op_params, name, params }),
            );
        };
    }

    function create_streamer(treepen, endpoint, store) {
        const static_op_params = Object.assign({ endpoint, store }, {
            bullpen_verb: 'stream',
            endpoint_verb: 'fetch',
            store_verb: 'fetch',
        });
        return function stream_from_tree(name, params) {
            return treepen.perform_operation(
                new Op({ ...static_op_params, name, params }),
            );
        };
    }

    function create_mutator(treepen, endpoint, store) {
        const static_op_params = Object.assign({ endpoint, store }, {
            bullpen_verb: 'mutate',
            endpoint_verb: 'mutate', // will be http verb for rest services
            store_verb: 'mutate',
        });
        return function mutate_tree(name, params) {
            if ('string' !== typeof name) {
                throw new TypeError([
                    'When calling a Treepen mutation operation,',
                    'arg 0 must be either the key to mutate,',
                    'or the name of the operation to perform',
                ]);
            }
            treepen.perform_operation(
                new Op({ ...static_op_params, name, params }),
            );
            return undefined;
            // ^ Never return data on mutate
            //   Fetch after mutation via subscription or promise
        };
    }

    // -----------

    function perform_operation(op) {
        return new Promise(_perform_operation);

        // -----------

        function _perform_operation(resolve_promise) {
            const initial_store_result = op.execute_on_store();
            if (undefined !== initial_store_result) {
                return resolve_promise(prepare_result(initial_store_result));
            }
            const endpoint_result = op.execute_on_endpoint(op.params);
            if (WEB_SERVICE.NOOP === endpoint_result) {
                return resolve_promise(prepare_result(initial_store_result));
            }
            return endpoint_result instanceof Promise
                ? endpoint_result.then(process_endpoint_result)
                : throw_endpoint_return_error(op.verb)
                ; // eslint-disable-line indent

            // -----------

            function process_endpoint_result(raw_result) {
                const store_result = op.execute_on_store(raw_result);
                const result = NOOP === store_result
                    ? raw_result
                    : store_result
                    ;
                return resolve_promise(prepare_result(result));
            }

            function prepare_result(result) {
                /* eslint-disable indent */
                return 'get' === op.verb ? JSON.parse(JSON.stringify(result))
                    : 'mutate' === op.verb ? undefined
                    : result
                    ;
                /* eslint-enable indent */
            }
        }
    }

    // -----------

    function throw_endpoint_return_error(verb) {
        throw_error(`endpoint.${ verb }() must return a Promise or NOOP`);
    }

    function throw_error(raw_message) {
        const message = Array.isArray(raw_message)
            ? raw_message.join(' ')
            : String(raw_message)
            ;
        throw new Error(`BULLPEN.Treepen: ${ message }`);
    }
}(
    require('../bullpen'),
    require('../web-service'),
    require('./store'),
    require('./operation'),
    require('./util'),
));
