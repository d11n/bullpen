// eslint-disable-next-line max-params
(function main(UTIL) {
    class Store {
        constructor(...args) {
            return construct_store.apply(this, args);
        }
    }
    const { NOOP, validate_op_args } = UTIL;

    // Instance members (for overridability in subclasses)
    Object.assign(Store.prototype, {
        initialize_struct,
        fetch: fetch_from_store,
        mutate: mutate_store,
        perform_default_fetch,
        perform_key_fetch,
        perform_key_mutation,
    });
    return module.exports = Object.freeze(Store);

    // -----------

    function construct_store(params) {
        const store = this;
        const { state, operations } = validate_params(params);
        const struct = store.initialize_struct({ store, state });

        const fetch_dict = {};
        const mutate_dict = {};
        add_ops_to_dicts();

        store.fetch = create_method({
            store,
            method: 'fetch',
            struct,
            op_dict: fetch_dict,
        });
        store.mutate = create_method({
            store,
            method: 'mutate',
            struct,
            op_dict: mutate_dict,
        });

        return Object.freeze(store);

        // -----------

        function add_ops_to_dicts() {
            fetch_dict[undefined] = store.perform_default_fetch;
            for (const key of Object.keys(state)) {
                fetch_dict[key] = store.perform_key_fetch;
                mutate_dict[key] = store.perform_key_mutation;
            }
            if (operations && operations.fetch) {
                for (const key of Object.keys(operations.fetch)) {
                    if (fetch_dict[key]) {
                        throw_error([
                            'cannot name an operation the same thing',
                            'as a key in state',
                        ]);
                    }
                    fetch_dict[key] = operations.fetch[key];
                }
            }
            if (operations && operations.mutate) {
                for (const key of Object.keys(operations.mutate)) {
                    if (mutate_dict[key]) {
                        throw_error([
                            'cannot name an operation the same thing',
                            'as a key in state',
                        ]);
                    }
                    mutate_dict[key] = operations.mutate[key];
                }
            }
            return true;
        }
    }

    function validate_params(raw_params) {
        return { ...raw_params };
    }

    function initialize_struct({ state }) {
        return { ...state };
    }

    // -----------

    function create_method(params) {
        const { store, method, struct, op_dict } = params;
        return function perform_operation(perform_params) {
            const op = validate_op_args(perform_params);
            if (op_dict[op.name]) {
                const store_class_method = store.constructor.prototype[method];
                return store_class_method({
                    perform_operation: op_dict[op.name],
                    struct,
                    op,
                });
            }
            return NOOP;
        };
    }

    function fetch_from_store(fetch_params) {
        const { perform_operation, struct, op } = fetch_params;
        return perform_operation({ struct, op });
    }

    function mutate_store(mutate_params) {
        const { perform_operation, struct, op } = mutate_params;
        perform_operation({ struct, op });
        return undefined;
        // ^ Never return data on mutate.
        //   subscribe to Mobx/Redux stores to trigger fresh fetches.
    }

    // -----------

    function perform_default_fetch({ struct }) {
        return struct;
    }

    function perform_key_fetch({ struct, op }) {
        return struct[op.name];
    }

    function perform_key_mutation({ struct, op }) {
        // Throw to force override?
        Object.assign(struct[op.name], op.params);
        return struct;
    }

    // -----------

    /* eslint-disable no-unused-vars */
    function throw_error(raw_message) {
        const message = Array.isArray(raw_message)
            ? raw_message.join(' ')
            : raw_message
            ;
        throw new Error(`BULLPEN.Statepen.Store: ${ message }`);
    }
}(
    require('./util'),
));
