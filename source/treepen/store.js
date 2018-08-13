// eslint-disable-next-line max-params
(function main(UTIL) {
    class Store {
        constructor(...args) {
            return construct_store.apply(this, args);
        }
    }
    const { validate_op_args } = UTIL;

    // Instance members (for overridability in subclasses)
    Object.assign(Store.prototype, {
        initialize_struct,
        fetch: fetch_from_store,
        mutate: mutate_store,
        perform_default_fetch,
        perform_key_fetch,
    });
    return module.exports = Object.freeze(Store);

    // -----------

    function construct_store(params) {
        const store = this;
        const { tree, operations } = validate_params(params);
        const struct = store.initialize_struct({ store, tree });
        Object.seal(struct);

        const fetch_dict = operations ? { ...operations.fetch } : {};
        fetch_dict[undefined] = store.perform_default_fetch;
        store.fetch = create_method({
            store,
            method: 'fetch',
            struct,
            op_dict: fetch_dict,
        });

        const mutate_dict = operations ? { ...operations.mutate } : {};
        store.mutate = create_method({
            store,
            method: 'mutate',
            struct,
            op_dict: mutate_dict,
        });

        return Object.freeze(store);
    }

    function validate_params(raw_params) {
        return raw_params || {};
    }

    function initialize_struct({ tree }) {
        return Object.defineProperties({}, {
            tree: { value: { ...tree }, enumerable: true },
            is_hydrated: { value: false, enumerable: true, writable: true },
        });
    }

    // -----------

    function create_method(params) {
        const { store, method, struct, op_dict } = params;
        return function perform_operation(perform_params) {
            const { op, data } = validate_op_args(perform_params);
            const store_class_method = store.constructor.prototype[method];
            if (op_dict[op.name]) {
                return store_class_method({
                    perform_operation: op_dict[op.name],
                    struct,
                    op,
                    data,
                });
            }
            // Since keys aren't predefined, don't NOOP, fallback to key fetcher
            return store_class_method({
                perform_operation: store.perform_key_fetch,
                struct,
                op: {
                    name: undefined,
                    params: { ...op.params, key: op.name },
                },
                data,
            });
        };
    }

    function fetch_from_store(fetch_params) {
        const { perform_operation, struct, op, data } = fetch_params;
        return perform_operation({ struct, op, data });
    }

    function mutate_store(mutate_params) {
        const { perform_operation, struct, op, data } = mutate_params;
        perform_operation({ struct, op, data });
        return undefined;
        // ^ Never return data on mutate.
        //   subscribe to Mobx/Redux stores to trigger fresh fetches.
    }

    // -----------

    function perform_default_fetch({ struct, op, data }) {
        if (!data && !struct.is_hydrated) {
            return undefined;
        } else if (data) {
            struct.tree = data;
            Object.defineProperties(struct, {
                is_hydrated: { value: true },
            }); // ^ Prevent marking as unhydrated
        }
        return struct.tree;
    }

    function perform_key_fetch({ struct, op, data }) {
        const { key } = op.params;
        let value = data;
        if (value) {
            struct.tree[key] = value;
        } else {
            value = struct.tree[key];
        }
        return value;
    }

    // -----------

    /* eslint-disable no-unused-vars */
    function throw_error(raw_message) {
        const message = Array.isArray(raw_message)
            ? raw_message.join(' ')
            : String(raw_message)
            ;
        throw new Error(`BULLPEN.Treepen.Store: ${ message }`);
    }
}(
    require('./util'),
));
