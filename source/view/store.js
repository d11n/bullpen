// eslint-disable-next-line max-params
(function main(UTIL) {
    class Store {
        constructor(...args) {
            return construct_store.call(this, ...args);
        }
    }
    const { NOOP, validate_op_args } = UTIL;
    // Functional instance members (for overridability in subclasses)
    Object.assign(Store.prototype, {
        initialize_struct,
        fetch: fetch_from_store,
        mutate: mutate_store,
        perform_default_fetch,
        }); // eslint-disable-line indent
    return module.exports = Object.freeze(Store);

    // -----------

    function construct_store(raw_params) {
        const store = this;
        const params = validate_params(raw_params);
        const { initial_state, operations, default_fetch } = params;
        const struct = store.initialize_struct({ store, initial_state });
        Object.seal(struct);

        // #fetch()
        const fetch_dict = operations ? { ...operations.fetch } : {};
        fetch_dict[undefined] = default_fetch || store.perform_default_fetch;
        const fetch_method_params = {
            store,
            method: 'fetch',
            struct,
            op_dict: fetch_dict,
        };
        const state_keys_list = Object.keys(initial_state);
        for (const key of state_keys_list) {
            fetch_dict[key] = make_state_fetcher(key);
        }
        store.fetch = create_method(fetch_method_params);

        // #mutate()
        const mutate_method_params = {
            store,
            method: 'mutate',
            struct,
            op_dict: operations ? { ...operations.mutate } : {},
        };
        store.mutate = create_method(mutate_method_params);

        return Object.freeze(store);
    }

    function validate_params(raw_params) {
        return { ...raw_params };
    }

    function initialize_struct({ store, initial_state }) {
        const struct = Object.seal({ ...initial_state });
        return struct;
    }

    // -----------

    function create_method(params) {
        const { store, method, struct, op_dict } = params;
        return function perform_operation(raw_op, raw_op_params) {
            const [ op, op_params ]
                = validate_op_args(raw_op, raw_op_params)
                ; // eslint-disable-line indent
            if (op_dict[op]) {
                const store_class_method = store.constructor.prototype[method];
                return store_class_method({
                    perform_operation: op_dict[op],
                    struct,
                    params: op_params,
                    }); // eslint-disable-line indent
            }
            return NOOP;
        };
    }

    function fetch_from_store(fetch_params) {
        const { perform_operation, struct, params } = fetch_params;
        const operation_output = perform_operation(struct, params);
        return operation_output;
    }

    function mutate_store(mutate_params) {
        const { perform_operation, struct, params } = mutate_params;
        perform_operation(struct, params);
        return undefined;
        // ^ Never return data on mutate.
        //   mutate.then(fetch)
        //   or subscribe to Mobx/Redux stores to trigger fresh fetches.
    }

    // -----------

    function perform_default_fetch() {
        return throw_error('a key in the view\'s state tree must be specified');
    }

    function make_state_fetcher(key) {
        return function perform_state_fetch(struct) {
            return struct[key];
        };
    }

    // -----------

    /* eslint-disable no-unused-vars */
    function throw_error(message) {
        throw new Error(`BULLPEN.View: ${ message }`);
    }
}(
    require('./util'),
));
