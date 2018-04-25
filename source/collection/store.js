// eslint-disable-next-line max-params
(function main(Query, UTIL) {
    class Store {
        constructor(...args) {
            return construct_store.call(this, ...args);
        }
    }
    const { ALL_ITEMS, NOOP, validate_op_args } = UTIL;
    // Functional instance members (for overridability in subclasses)
    Object.assign(Store.prototype, {
        initialize_store_struct,
        fetch: fetch_from_store,
        mutate: mutate_store,
        perform_default_fetch,
        }); // eslint-disable-line indent
    return module.exports = Object.freeze(Store);

    // -----------

    function construct_store(raw_params) {
        const this_store = this;
        const params = validate_params(raw_params);
        const { operations, default_fetch } = params;
        // debugger;
        const store_struct = this_store.initialize_store_struct(this_store);
        Object.seal(store_struct);
        const fetch_dict = operations ? { ...operations.fetch } : {};
        fetch_dict[undefined] = default_fetch
            || this_store.perform_default_fetch
            ; // eslint-disable-line indent
        this_store.fetch = create_method({
            store: this_store,
            method: 'fetch',
            store_struct,
            op_dict: fetch_dict,
            }); // eslint-disable-line indent
        this_store.mutate = create_method({
            store: this_store,
            method: 'mutate',
            store_struct,
            op_dict: operations ? { ...operations.mutate } : {},
            }); // eslint-disable-line indent
        Object.freeze(this_store);
        return this_store;

        // -----------
    }

    function validate_params(raw_params) {
        return raw_params || {};
    }

    function initialize_store_struct(this_store) {
        const store_struct = Object.defineProperties({}, {
            is_item_map_hydrated: {
                value: false,
                writable: true,
                enumerable: true,
                }, // eslint-disable-line indent
            item_map: { value: new Map, enumerable: true },
            query_result_map: { value: new Map, enumerable: true },
            }); // eslint-disable-line indent
        Object.defineProperties(store_struct, {
            item_list: {
                get: () => Array.from(store_struct.item_map.values()),
                }, // eslint-disable-line indent
            }); // eslint-disable-line indent
        Object.defineProperties(this_store, {
            is_hydrated: {
                get: () => store_struct.is_item_map_hydrated,
                enumerable: true,
                }, // eslint-disable-line indent
            has: {
                value: (id) => store_struct.item_map.get(id),
                enumerable: true,
                }, // eslint-disable-line indent
            }); // eslint-disable-line indent
        return store_struct;
    }

    // -----------

    function create_method(params) {
        const { store, method, store_struct, op_dict } = params;
        return function perform_operation(raw_arg0, raw_op, raw_op_params) {
            const [ arg0, op, op_params ]
                = validate_op_args(raw_arg0, raw_op, raw_op_params)
                ; // eslint-disable-line indent
            if (op_dict[op]) {
                const store_class_method = store.constructor.prototype[method];
                return store_class_method({
                    perform_operation: op_dict[op],
                    store_struct,
                    arg0,
                    params: op_params,
                    }); // eslint-disable-line indent
            }
            return NOOP;
        };
    }

    function fetch_from_store(fetch_params) {
        const { perform_operation, store_struct, arg0, params } = fetch_params;
        const operation_output = perform_operation(store_struct, arg0, params);
        return operation_output;
    }

    function mutate_store(mutate_params) {
        const { perform_operation, store_struct, arg0, params } = mutate_params;
        perform_operation(store_struct, arg0, params);
        return undefined;
        // ^ Never return data on mutate.
        //   mutate.then(fetch)
        //   or subscribe to Mobx/Redux stores to trigger fresh fetches.
    }

    // -----------

    function perform_default_fetch(store_struct, arg, endpoint_payload) {
        /* eslint-disable indent */
        return arg instanceof Query ? fetch_query()
            : ALL_ITEMS === arg ? fetch_all()
            : fetch_one()
            ;
        /* eslint-enable indent */

        // -----------

        function fetch_query() {
            debugger;
            const key = arg.query_id;
            let value = store_struct.query_result_map.get(key);
            if (endpoint_payload) {
                value = {
                    query: String(arg.query_string),
                    result: JSON.parse(JSON.stringify(endpoint_payload)),
                    }; // eslint-disable-line indent
                store_struct.query_result_map.set(key, value);
            }
            return value
                && (String(arg.query_string) === value.query || undefined)
                && value.result
                ; // eslint-disable-line indent
        }

        function fetch_all() {
            debugger;
            if (!endpoint_payload && !store_struct.is_item_map_hydrated) {
                return undefined;
            } else if (endpoint_payload) {
                !Array.isArray(endpoint_payload)
                    && throw_error(
                        'web service attempted to hydrate store with non-array',
                        ) // eslint-disable-line indent
                    ; // eslint-disable-line indent
                store_struct.item_map.clear();
                for (const item of endpoint_payload) {
                    store_struct.item_map.set(item.id, item);
                }
                store_struct.is_item_map_hydrated = true;
            }
            return store_struct.item_list;
        }

        function fetch_one() {
            debugger;
            let item = endpoint_payload;
            if (item) {
                if (arg !== item.id) {
                    throw_error([
                        'id does not match',
                        'id fetched from web service',
                        ].join(' ')); // eslint-disable-line indent
                }
                store_struct.item_map.set(item.id, item);
            } else {
                item = store_struct.item_map.get(arg);
            }
            return item;
        }
    }

    // -----------

    function throw_error(message) {
        throw new Error(`BULLPEN.Collection: ${ message }`);
    }
}(
    require('./query'),
    require('./util'),
));
