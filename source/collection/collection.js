// eslint-disable-next-line max-params
(function main(Bullpen, WEB_SERVICE, Store, Op, Query, Query_result, UTIL) {
    const { ALL_ITEMS, NOOP } = UTIL;
    class Collection extends Bullpen {
        constructor(...args) {
            return super() && construct_collection.call(this, ...args);
        }
    }
    // Functional instance members
    Object.assign(Collection.prototype, {
        perform_operation,
        }); // eslint-disable-line indent
    // Static members
    Object.defineProperties(Collection, {
        // Final
        ALL_ITEMS: { value: ALL_ITEMS, enumerable: true },
        NOOP: { value: NOOP, enumerable: true },
        // Overridable by subclass
        Store: { value: Store, writable: true, enumerable: true },
        Operation: { value: Op, writable: true, enumerable: true },
        Query: { value: Query, writable: true, enumerable: true },
        Query_result: { value: Query_result, writable: true, enumerable: true },
        }); // eslint-disable-line indent
    return module.exports = Object.seal(Collection);

    // -----------

    function construct_collection(raw_params) {
        const this_collection = this;
        const { endpoint, store }
            = validate_params(this_collection, raw_params)
            ; // eslint-disable-line indent
        const creator_args = [ this_collection, endpoint, store ];
        this_collection.get = create_getter(...creator_args);
        this_collection.stream = create_streamer(...creator_args);
        this_collection.mutate = create_mutator(...creator_args);
        return this_collection;
    }

    function validate_params(this_collection, raw_params) {
        const params = {};
        !(raw_params.endpoint instanceof WEB_SERVICE.Web_service.Endpoint)
            && throw_error([
                'endpoint must be',
                'an instance of BULLPEN.Web_service.Endpoint',
                ].join(' ')) // eslint-disable-line indent
            ; // eslint-disable-line indent
        params.endpoint = raw_params.endpoint;
        /* eslint-disable indent */
        params.store
            = undefined === raw_params.store
                ? new this_collection.constructor.Store
            : !(raw_params.store instanceof Store)
                ? throw_error('store must be an instance of Collection.Store')
            : raw_params.store
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
    function create_getter(this_collection, endpoint, store) {
        const static_op_params = Object.assign({ endpoint, store }, {
            bullpen_verb: 'get',
            endpoint_verb: 'fetch',
            store_verb: 'fetch',
            }); // eslint-disable-line
        return function get_from_collection(arg, op, op_params) {
            return this_collection.perform_operation(
                new Op({ ...static_op_params, arg, op, op_params }),
                ); // eslint-disable-line indent
        };
    }

    function create_streamer(this_collection, endpoint, store) {
        const static_op_params = Object.assign({ endpoint, store }, {
            bullpen_verb: 'stream',
            endpoint_verb: 'fetch',
            store_verb: 'fetch',
            }); // eslint-disable-line
        return function stream_from_collection(arg, op, op_params) {
            return this_collection.perform_operation(
                new Op({ ...static_op_params, arg, op, op_params }),
                ); // eslint-disable-line indent
        };
    }

    function create_mutator(this_collection, endpoint, store) {
        const static_op_params = Object.assign({ endpoint, store }, {
            bullpen_verb: 'mutate',
            endpoint_verb: 'mutate', // will be http verb for rest services
            store_verb: 'mutate',
            }); // eslint-disable-line
        return function mutate_collection(arg, op, op_params) {
            if ('string' !== typeof op) {
                throw new TypeError([
                    'When calling a bullpen mutation operation,',
                    'arg 1 must be the name of the operation to perform',
                    ].join(' ')); // eslint-disable-line indent
            }
            this_collection.perform_operation(
                new Op({ ...static_op_params, arg, op, op_params }),
                ); // eslint-disable-line indent
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
            debugger;
            const initial_store_result = op.execute_on_store();
            if (![ undefined, NOOP ].includes(initial_store_result)) {
                return resolve_promise(prepare_result(initial_store_result));
            }
            const endpoint_result = op.execute_on_endpoint(op.params);
            if (NOOP === endpoint_result) {
                const store_result = op.execute_on_store(op.params);
                NOOP === store_result && throw_noop_error(op.verb, op.name);
                return resolve_promise(prepare_result(store_result));
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

    function throw_noop_error(verb, op) {
        throw_error(`${ verb }('${ op }') is a noop`);
    }

    function throw_endpoint_return_error(verb) {
        throw_error(
            `endpoint.${ verb }() must return a Promise or Collection.NOOP`,
            ); // eslint-disable-line indent
    }

    function throw_error(message) {
        throw new Error(`BULLPEN.Collection: ${ message }`);
    }
}(
    require('../bullpen'),
    require('../web-service'),
    require('./store'),
    require('./operation'),
    require('./query'),
    require('./query-result'),
    require('./util'),
));
