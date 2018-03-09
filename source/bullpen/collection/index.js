// eslint-disable-next-line max-params
(function main(UTIL, Datasource, Bullpen, Query) {
    Collection.prototype = new Bullpen;
    assign_static_members();
    return module.exports = Collection;

    // -----------

    function Collection(raw_params) {
        const this_collection = this;
        const params = validate_params(raw_params);
        const { datasource, namespace, operations } = params;
        const { preparer, item_preparer, query_result_preparer } = params;

        const operation_verbs = Object.keys(operations);
        const real_item_preparer = item_preparer || preparer || noprep;
        const result_preparer = query_result_preparer || preparer || noprep;
        assign_fetchers();
        assign_mutators();
        return this_collection;

        // -----------

        function assign_fetchers() {
            const op_dict = operation_verbs.fetch || {};
            delete operation_verbs.fetch;
            const fetcher_params = {
                datasource,
                namespace,
                op_dict,
                item_preparer: real_item_preparer,
                query_result_preparer: result_preparer,
                }; // eslint-disable-line indent
            this_collection.get = create_getter(fetcher_params);
            this_collection.stream = create_streamer(fetcher_params);
            return true;
        }

        function assign_mutators() {
            for (const verb of operation_verbs) {
                if ('function' === typeof datasource[verb]) {
                    this_collection[verb] = create_mutator({
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

    function assign_static_members() {
        return Object.assign(Collection, {
            Query,
            ALL_ITEMS: new String(''), // eslint-disable-line no-new-wrappers
            }); // eslint-disable-line indent
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
        const { datasource, verb, namespace, op_dict } = params;
        return function get_from_collection(...args) {
            make_request({ datasource, verb, namespace, op_dict, args });
        };
    }
    function create_streamer(params) {
        const { datasource, verb, namespace, op_dict } = params;
        return function stream_from_collection(...args) {
            make_request({ datasource, verb, namespace, op_dict, args });
        };
    }
    function create_mutator(params) {
        const { datasource, verb, namespace, op_dict } = params;
        return function mutate_collection(...args) {
            make_request({ datasource, verb, namespace, op_dict, args });
        };
    }

    function make_request(params) {
        const { datasource, verb, namespace, op_dict, args } = params;
        const url_params = build_request_params(namespace, args);
        const { operation } = url_params;
        if (!op_dict[operation] || 'function' !== typeof op_dict[operation]) {
            throw_invalid_op_error(verb, operation);
        }
        const perform_operation = op_dict[operation];
        datasource[verb](url_params);
    }

    function build_request_params(namespace, args) {
        const request_params = { namespace };
        switch (true) {
            case undefined === args[0]:
                return request_params;
            case Collection.ALL_ITEMS === args[0]:
                break;
            case args[0] instanceof Query:
                request_params.query = String(args[0]);
                break;
            default:
                request_params.id = args[0];
                break;
        }
        if ('object' === typeof args[1]) {
            request_params.payload = args[1];
        } else if ('string' === typeof args[1]) {
            request_params.operation = args[1];
            if ('object' === typeof args[2]) {
                request_params.payload = args[2];
            }
        }
        return request_params;
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
    require('../../util'),
    require('../../datasource'),
    require('../index.js'),
    require('./query'),
));
