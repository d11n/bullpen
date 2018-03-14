// eslint-disable-next-line max-params
(function main(Uri_query, UTIL, Datasource, Thin_promise, Query_result) {
    class Collection {
        constructor(...args) {
            return construct_collection.call(this, ...args);
        }
    }
    Object.assign(Collection, {
        ALL_ITEMS: new String(''), // eslint-disable-line no-new-wrappers
        Query: Uri_query,
        Query_result,
        }); // eslint-disable-line indent
    return module.exports = Object.freeze(Collection);

    // -----------

    function construct_collection(raw_params) {
        const this_collection = this;
        const params = validate_params(raw_params);

        const { datasource, namespace, operations } = params;
        const { store_creator, default_operation } = params;
        const op_tree = { ...operations };
        const store_struct = {
            is_item_list_fully_hydrated: false,
            item_list: [],
            query_result_dict: {},
            }; // eslint-disable-line indent
        const store = Object.seal(
            store_creator ? store_creator(store_struct) : store_struct,
            ); // eslint-disable-line indent

        const { preparer, item_preparer, query_result_preparer } = params;
        const real_item_preparer = item_preparer || preparer || noprep;
        const result_preparer = query_result_preparer || preparer || noprep;

        assign_fetchers();
        assign_mutators();
        return this_collection;

        // -----------

        function assign_fetchers() {
            const op_dict = op_tree.fetch || {};
            delete op_tree.fetch;
            const fetcher_params = {
                store,
                datasource,
                verb: 'fetch',
                namespace,
                op_dict,
                item_preparer: real_item_preparer,
                query_result_preparer: result_preparer,
                default_operation: default_operation || perform_default_op,
                }; // eslint-disable-line indent
            this_collection.get = create_getter(fetcher_params);
            this_collection.stream = create_streamer(fetcher_params);
            return true;
        }

        function assign_mutators() {
            const op_verb_list = Object.keys(op_tree);
            for (const verb of op_verb_list) {
                if ('function' === typeof datasource[verb]) {
                    this_collection[verb] = create_mutator({
                        store,
                        datasource,
                        verb,
                        namespace,
                        op_dict: operations[verb],
                        item_preparer: real_item_preparer,
                        query_result_preparer: result_preparer,
                        }); // eslint-disable-line indent
                } else {
                    throw_invalid_verb_error(verb);
                }
            }
            return true;
        }
    }

    function validate_params(raw_params) {
        return raw_params;
    }

    // -----------

    /// ## Collection.get(Collection.ALL_ITEMS | Collection.Query | id, params)
    /// Get a fully dereferenced item or composition from the collection.
    /// <br/>
    /// This is useful when getting live updates is not desireable, often in
    /// writeable contexts (e.g. editing a form) and frequently-updating
    /// read-only contexts (e.g. Twitter feed).
    /// <br/>
    /// e.g.
    /// Two users are editing the same form at the same time. To prevent the
    /// first user to save their form from replacig the form contents for the
    /// other user (causing them to lose their work), the contents of the form
    /// should be retrieved use `get()`, instead of `stream()`.
    function create_getter(params) {
        return function get_from_collection(...args) {
            const next_thing = new Thin_promise;
            perform_operation({ ...params, args })
                .then(dereference_op_result)
                ; // eslint-disable-line indent
            return next_thing;

            // -----------

            function dereference_op_result(result) {
                const dereferenced_result = JSON.parse(JSON.stringify(result));
                return next_thing.do(dereferenced_result);
            }
        };
    }
    function create_streamer(params) {
        return function stream_from_collection(...args) {
            return perform_operation({ ...params, args });
        };
    }
    function create_mutator(params) {
        return function mutate_collection(...args) {
            if ('string' !== typeof args[1]) {
                throw new TypeError([
                    'when calling a bullpen mutation operation,',
                    'arg 1 must be the name of the operation to perform',
                    ].join(' ')); // eslint-disable-line indent
            }
            return perform_operation({ ...params, args });
        };
    }

    function perform_operation(params) {
        const { store, datasource, verb, namespace, args, op_dict } = params;
        const url_params = build_request_params(namespace, args);
        const { operation } = url_params;
        if (op_dict[operation] && 'function' !== typeof op_dict[operation]) {
            throw_invalid_op_error(verb, operation);
        }
        const operation_params = { ...url_params };
        if (operation_params.payload) {
            operation_params.params = operation_params.payload;
            delete operation_params.payload;
        }
        const { default_operation } = params;
        const operate = op_dict[operation]
            ? op_dict[operation]
            : default_operation
            ; // eslint-disable-line indent
        return operate(operation_params, store, make_request);

        // -----------

        function make_request() {
            datasource[verb](url_params).then(process_response);
            const next_thing = new Thin_promise;
            return next_thing;

            // -----------

            function process_response(raw_response) {
                const { item_preparer, query_result_preparer } = params;
                const raw_data = raw_response.data;
                if (Array.isArray(raw_data)) {
                    return next_thing.do(raw_data.map(item_preparer));
                } else if (raw_data instanceof Query_result) {
                    const query_result = new Query_result(raw_data);
                    query_result.items = raw_data.items
                        .map(query_result_preparer)
                        ; // eslint-disable-line indent
                    return next_thing.do(query_result);
                }
                return next_thing.do(item_preparer(raw_data));
            }
        }
    }

    function build_request_params(namespace, args) {
        const request_params = { namespace };
        switch (true) {
            case undefined === args[0]:
                return request_params;
            case Collection.ALL_ITEMS === args[0]:
                break;
            case args[0] instanceof Uri_query:
                request_params.query = String(args[0]);
                break;
            case 'string' === typeof args[0]:
            case 'number' === typeof args[0]:
                request_params.id = args[0];
                break;
            default:
                throw new TypeError([
                    'when calling a bullpen operation, arg 0 must be one of:',
                    'a string, a number, BULLPEN.Collection.ALL_ITEMS,',
                    'or an instance of BULLPEN.Collection.Query',
                    ].join(' ')); // eslint-disable-line indent
        }
        if ('string' === typeof args[1]) {
            request_params.operation = args[1];
            if ('object' === typeof args[2]) {
                request_params.payload = args[2];
            }
        }
        return request_params;
    }

    // -----------

    function perform_default_op(operation, store, make_request) {
        const next_thing = new Thin_promise;
        if (operation.id) {
            const item = store.item_list.find((itm) => operation.id === itm.id);
            if (item) {
                next_thing.do(item);
            } else {
                make_request().then(update_item);
            }
        } else if (operation.query) {
            make_request().then(update_query_result);
        } else if (store.is_item_list_fully_hydrated) {
            next_thing.do(store.item_list);
        } else {
            make_request().then(update_items);
        }
        return next_thing;

        // -----------

        function update_item(item) {
            _update_item(item);
            return next_thing.do(item);
        }
        function _update_item(item) {
            const i = store.item_list.findIndex((itm) => item.id === itm.id);
            -1 === i
                ? store.item_list.push(item)
                : (store.item_list[i] = item) // eslint-disable-line
                ; // eslint-disable-line indent
            return item;
        }

        function update_items(items) {
            for (let i = 0, n = items.length - 1; i <= n; i++) {
                const item = items[i];
                _update_item(item);
            }
            store.is_item_list_fully_hydrated = true;
            return next_thing.do(store.item_list);
        }

        function update_query_result(query_result) {
            store.query_result_dict[query_result.name] = query_result;
            return next_thing.do(query_result);
        }
    }

    // -----------

    function throw_invalid_verb_error(verb) {
        throw new Error(
            `operations.${ verb } must match a method on the datasource`,
            ); // eslint-disable-line indent
    }

    function throw_invalid_op_error(verb, operation) {
        throw new Error([
            `operations.${ verb }.${ operation }`,
            'is not defined in this bullpen',
            ].join(' ')); // eslint-disable-line indent
    }

    function noprep(value) {
        return value;
    }
}(
    require('uri-query'),
    require('../../util'),
    require('../../datasource'),
    require('../../thin-promise'),
    require('./query-result'),
));
