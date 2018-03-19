// eslint-disable-next-line max-params
(function main(Datasource, Store, Query, Query_result, COLLECTION_UTIL) {
    class Collection {
        constructor(...args) {
            return construct_collection.call(this, ...args);
        }
    }
    const { ALL_ITEMS, NOOP } = COLLECTION_UTIL;
    Object.freeze(Object.assign(Collection, {
        ALL_ITEMS,
        NOOP,
        Datasource,
        Store,
        Query,
        Query_result,
        })); // eslint-disable-line indent
    return module.exports = Collection;

    // -----------

    function construct_collection(raw_params) {
        const this_collection = this;
        const params = validate_params(raw_params);
        const { datasource, store } = params;
        this_collection.get = create_getter(datasource, store);
        this_collection.stream = create_streamer(datasource, store);
        this_collection.mutate = create_mutator(datasource, store);
        return this_collection;
    }

    function validate_params(raw_params) {
        !(raw_params.datasource instanceof Datasource)
            && throw_error([
                'datasource must be',
                'an instance of BULLPEN.Collection.Datasource',
                ].join(' ')) // eslint-disable-line indent
            ; // eslint-disable-line indent
        !(raw_params.store instanceof Store)
            && throw_error(
                'store must be an instance of BULLPEN.Collection.Store',
                ) // eslint-disable-line indent
            ; // eslint-disable-line indent
        return raw_params;
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
        return function get_from_collection(arg0, op, params) {
            validate_op_args(arg0, op, params);
            const promise = new Promise;
            const op_params = params;
            perform_op({ datasource, store, arg0, op, op_params })
                .then(dereference)
                ; // eslint-disable-line indent
            return promise;

            // -----------

            function dereference(value) {
                const dereferenced_value = JSON.parse(JSON.stringify(value));
                return promise.resolve(dereferenced_value);
            }
        };
    }

    function create_streamer(datasource, store) {
        return function get_from_collection(arg0, op, params) {
            validate_op_args(arg0, op, params);
            const promise = new Promise;
            const op_params = params;
            perform_op({ datasource, store, arg0, op, op_params })
                .then((value) => promise.resolve(value))
                ; // eslint-disable-line indent
            return promise;
        };
    }

    function create_mutator(datasource, store) {
        return function mutate_collection(arg0, op, params) {
            validate_op_args(arg0, op, params);
            if ('string' !== typeof op) {
                throw new TypeError([
                    'When calling a bullpen mutation operation,',
                    'arg 1 must be the name of the operation to perform',
                    ].join(' ')); // eslint-disable-line indent
            }
            const promise = new Promise;
            const op_params = params;
            perform_op({ datasource, store, arg0, op, op_params })
                .then(() => promise.resolve()) // Never return data on mutate
                ; // eslint-disable-line indent
            return promise;
        };
    }

    // -----------

    function perform_op(params) {
        const { datasource, store, verb, arg0, op, op_params } = params;
        const promise = new Promise;
        const datasource_result = datasource[verb](arg0, op, op_params);
        if (NOOP === datasource_result) {
            perform_store_op(op_params);
        } else if (datasource_result instanceof Promise) {
            datasource_result.then((response) => perform_store_op(response));
        } else {
            throw_datasource_return_error(verb);
        }
        return promise;

        // -----------

        function perform_store_op(input) {
            const store_result = store[verb](arg0, op, input);
            const output = NOOP === store_result
                ? NOOP === datasource_result
                    ? throw_invalid_fetch_op_error(op)
                    : input
                : store_result
                ; // eslint-disable-line indent
            return promise.resolve(output);
        }
    }

    // -----------

    function validate_op_args(arg0, op, params) {
        switch (true) {
            case undefined === arg0:
            case COLLECTION_UTIL.ALL_ITEMS === arg0:
            case arg0 instanceof Query:
            case 'string' === typeof arg0:
            case 'number' === typeof arg0:
                if (op && 'string' !== typeof op) {
                    throw_error([
                        'When calling a bullpen operation,',
                        'if arg 1 is provided, it must be a string',
                        'that is the name of the operation to perform',
                        ].join(' ')); // eslint-disable-line indent
                } else if (params && 'object' !== typeof params) {
                    throw_error([
                        'When calling a bullpen operation,',
                        'if arg 2 is provided, it must be an params object',
                        ].join(' ')); // eslint-disable-line indent
                }
                return true;
        }
        return throw_error([
            'When calling a bullpen operation, if args are provided,',
            'arg 0 of must be one of:',
            'a string, a number, COLLECTION.ALL_ITEMS, or',
            'an instance of COLLECTION.Query',
            ].join(' ')); // eslint-disable-line indent
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
