// eslint-disable-next-line max-params
(function main(Query, COLLECTION_UTIL) {
    class Store {
        constructor(...args) {
            return construct_store.call(this, ...args);
        }
    }
    const { ALL_ITEMS, NOOP, validate_op_args } = COLLECTION_UTIL;
    // Functional instance members (for overridability in child classes)
    Object.assign(Store.prototype, {
        initialize: (value) => value,
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
        /* eslint-disable indent */
        const store_struct = Object.seal(this_store.initialize(
            Object.defineProperties({}, {
                is_item_list_fully_hydrated: {
                    value: false,
                    writable: true,
                    enumerable: true,
                    },
                item_list: { value: [], enumerable: true },
                query_result_dict: { value: {}, enumerable: true },
                },
            )));
        /* eslint-disable indent */
        this_store.fetch = create_method({
            store: this_store,
            method: 'fetch',
            store_struct,
            op_dict: operations && operations.fetch || {},
            default_fetch,
            }); // eslint-disable-line indent
        this_store.mutate = create_method({
            store: this_store,
            method: 'mutate',
            store_struct,
            op_dict: operations && operations.mutate || {},
            default_fetch,
            }); // eslint-disable-line indent
        Object.defineProperties(this_store, {
            is_hydrated: {
                get: () => store_struct.is_item_list_fully_hydrated,
                enumerable: true,
                }, // eslint-disable-line indent
            has: {
                value: (id) => store_struct_has(store_struct, id),
                enumerable: true,
                }, // eslint-disable-line indent
            }); // eslint-disable-line indent
        Object.freeze(this_store);
        return this_store;

        // -----------
    }

    function validate_params(raw_params) {
        return raw_params || {};
    }

    // -----------

    function create_method(params) {
        const { store, method, store_struct, op_dict, default_fetch } = params;
        return function perform_operation(raw_arg0, raw_op, raw_op_params) {
            const [ arg0, op, op_params ]
                = validate_op_args(raw_arg0, raw_op, raw_op_params)
                ; // eslint-disable-line indent
            const perform_op = op
                ? op_dict[op]
                : 'fetch' === method
                    && (default_fetch || store.perform_default_fetch)
                ; // eslint-disable-line indent
            if (perform_op) {
                const store_class_method = store.constructor.prototype[method];
                return store_class_method({
                    perform_operation: perform_op,
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
        return true;
        // ^ Never return data on mutate.
        //   mutate.then(fetch)
        //   or subscribe to Mobx/Redux stores to trigger fresh fetches.
    }

    // -----------

    function perform_default_fetch(store_struct, arg0, datasource_payload) {
        /* eslint-disable indent */
        return arg0 instanceof Query ? fetch_query()
            : ALL_ITEMS === arg0 ? fetch_all()
            : fetch_one()
            ;
        /* eslint-enable indent */

        // -----------

        function fetch_query() {
            if (datasource_payload) {
                store_struct.query_result_dict[ arg0.query_id ]
                    = datasource_payload
                    ; // eslint-disable-line indent
            }
            return store_struct.query_result_dict[ arg0.query_id ];
        }

        function fetch_all() {
            if (!datasource_payload
                && !store_struct.is_item_list_fully_hydrated
                ) { // eslint-disable-line indent
                throw_error(
                    'datasource could not hydrate the store with all items',
                    ); // eslint-disable-line indent
            } else if (datasource_payload) {
                !Array.isArray(datasource_payload)
                    && throw_error(
                        'datasource attempted to hydrate store with non-array',
                        ) // eslint-disable-line indent
                    ; // eslint-disable-line indent
                const items = datasource_payload;
                for (let i = 0, n = items.length - 1; i <= n; i++) {
                    const item = items[i];
                    update_item(item);
                }
                store_struct.is_item_list_fully_hydrated = true;
            }
            return store_struct.item_list;
        }

        function fetch_one() {
            let item = datasource_payload;
            if (item) {
                if (arg0 !== item.id) {
                    throw_error('id does not match id fetched from datasource');
                }
                item = update_item(item);
            } else {
                item = store_struct_has(store_struct, arg0);
            }
            return item;
        }

        // -----------

        function update_item(item_to_upsert) {
            const i = store_struct.item_list.findIndex(
                (item_in_list) => item_to_upsert.id === item_in_list.id,
                ); // eslint-disable-line indent
            -1 === i
                ? store_struct.item_list.push(item_to_upsert)
                : store_struct.item_list[i] = item_to_upsert
                ; // eslint-disable-line indent
            return item_to_upsert;
        }
    }

    function store_struct_has(store_struct, id) {
        return store_struct.item_list
            .find((item_in_list) => id === item_in_list.id)
            ; // eslint-disable-line indent
    }

    // -----------

    function throw_error(message) {
        throw new Error(`BULLPEN.Collection: ${ message }`);
    }
}(
    require('./query'),
    require('./util'),
));
