// eslint-disable-next-line max-params
(function main(Datasource, Store, Query, Query_result, COLLECTION_UTIL) {
    class Collection {
        constructor(...args) {
            return construct_collection.call(this, ...args);
        }
    }
    const { ALL_ITEMS, NOOP, validate_op_args } = COLLECTION_UTIL;
    // Static members
    Object.defineProperties(Collection, {
        // Final
        ALL_ITEMS: { value: ALL_ITEMS, enumerable: true },
        NOOP: { value: NOOP, enumerable: true },
        // Overridable by subclass
        Datasource: { value: Datasource, writable: true, enumerable: true },
        Store: { value: Store, writable: true, enumerable: true },
        Query: { value: Query, writable: true, enumerable: true },
        Query_result: { value: Query_result, writable: true, enumerable: true },
        }); // eslint-disable-line indent
    return module.exports = Object.seal(Collection);

    // -----------

    function construct_collection(raw_params) {
        const this_collection = this;
        const { datasource, store }
            = validate_params(this_collection, raw_params)
            ; // eslint-disable-line indent
        this_collection.get = create_getter(datasource, store);
        this_collection.stream = create_streamer(datasource, store);
        this_collection.mutate = create_mutator(datasource, store);
        return this_collection;
    }

    function validate_params(this_collection, raw_params) {
        const params = {};
        !(raw_params.datasource instanceof Datasource)
            && throw_error([
                'datasource must be',
                'an instance of BULLPEN.Collection.Datasource',
                ].join(' ')) // eslint-disable-line indent
            ; // eslint-disable-line indent
        params.datasource = raw_params.datasource;
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
    function create_getter(datasource, store) {
        const verb = 'fetch';
        return function get_from_collection(raw_arg0, raw_op, raw_op_params) {
            const [ arg0, op, op_params ]
                = validate_op_args(raw_arg0, raw_op, raw_op_params)
                ; // eslint-disable-line indent
            const params = { datasource, store, verb, arg0, op, op_params };
            return do_op(params, (value) => JSON.parse(JSON.stringify(value)));
            // Maybe do something better than this ^^^
        };
    }

    function create_streamer(datasource, store) {
        const verb = 'fetch';
        return function get_from_collection(raw_arg0, raw_op, raw_op_params) {
            const [ arg0, op, op_params ]
                = validate_op_args(raw_arg0, raw_op, raw_op_params)
                ; // eslint-disable-line indent
            const params = { datasource, store, verb, arg0, op, op_params };
            return do_op(params);
        };
    }

    function create_mutator(datasource, store) {
        const verb = 'mutate';
        return function mutate_collection(raw_arg0, raw_op, raw_op_params) {
            const [ arg0, op, op_params ]
                = validate_op_args(raw_arg0, raw_op, raw_op_params)
                ; // eslint-disable-line indent
            if ('string' !== typeof op) {
                throw new TypeError([
                    'When calling a bullpen mutation operation,',
                    'arg 1 must be the name of the operation to perform',
                    ].join(' ')); // eslint-disable-line indent
            }
            const params = { datasource, store, verb, arg0, op, op_params };
            return do_op(params, () => undefined);
        };
    }

    // -----------

    function do_op(params, alterer) {
        const { datasource, store, verb, arg0, op, op_params } = params;
        return new Promise(_do_op);

        // -----------

        function _do_op(resolve_promise) {
            let datasource_result;
            if ((arg0 === Collection.ALL_ITEMS && store.is_hydrated)
                || (arg0 !== Collection.ALL_ITEMS
                    && !(arg0 instanceof Collection.Query)
                    && store.has(arg0)
                    ) // eslint-disable-line indent
                ) { // eslint-disable-line indent
                do_store_op(op_params);
            } else {
                datasource_result = datasource[verb](arg0, op, op_params);
                if (NOOP === datasource_result) {
                    do_store_op(op_params);
                } else if (datasource_result instanceof Promise) {
                    datasource_result.then((response) => do_store_op(response));
                } else {
                    throw_datasource_return_error(verb);
                }
            }

            // -----------

            function do_store_op(input) {
                const store_result = store[verb](arg0, op, input);
                const output = NOOP === store_result
                    ? NOOP === datasource_result
                        ? throw_invalid_fetch_op_error(op)
                        : input
                    : store_result
                    ; // eslint-disable-line indent
                return resolve_promise(alterer ? alterer(output) : output);
            }
        }
    }

    // -----------

    function throw_invalid_fetch_op_error(op) {
        throw_error([
            `operations.fetch.${ op }`,
            'is not defined in either the datasource or the store',
            ].join(' ')); // eslint-disable-line indent
    }

    function throw_datasource_return_error(verb) {
        throw_error(
            `datasource.${ verb }() must return a Promise or Collection.NOOP`,
            ); // eslint-disable-line indent
    }

    function throw_error(message) {
        throw new Error(`BULLPEN.Collection: ${ message }`);
    }
}(
    require('./datasource'),
    require('./store'),
    require('./query'),
    require('./query-result'),
    require('./util'),
));
