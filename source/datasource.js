// eslint-disable-next-line max-params
(function main(API, Query, Query_result, COLLECTION_UTIL) {
    class Datasource {
        constructor(...args) {
            return construct_datasource.call(this, ...args);
        }
    }
    const { ALL_ITEMS, NOOP, validate_op_args } = COLLECTION_UTIL;
    return module.exports = Datasource;

    // -----------

    function construct_datasource(raw_params) {
        const this_datasource = this;
        const params = validate_params(raw_params);
        const { api, namespace, operations } = params;
        const op_tree = Object.assign({ fetch: {} }, operations);
        const { preparer, item_preparer, query_result_preparer } = params;
        const real_item_preparer = item_preparer || preparer || noprep;
        const result_preparer = query_result_preparer || preparer || noprep;
        assign_requesters();
        return this_datasource;

        // -----------

        function assign_requesters() {
            const verbs = Object.keys(op_tree);
            for (const verb of verbs) {
                !api[verb] && throw_invalid_verb_error(verb);
                this_datasource[verb] = create_requester({
                    api,
                    verb,
                    namespace,
                    op_dict: op_tree[verb],
                    item_preparer: real_item_preparer,
                    query_result_preparer: result_preparer,
                    }); // eslint-disable-line indent
            }
        }
    }

    function validate_params(raw_params) {
        !raw_params.api
            ? throw_error('api is required')
            : !(raw_params.api instanceof API.Api)
                && throw_error('api must be an instance of BULLPEN.Api')
            ; // eslint-disable-line indent
        return raw_params;
    }

    // -----------

    function create_requester(params) {
        const { api, verb, namespace, op_dict } = params;
        return function make_request(raw_arg0, raw_op, raw_op_params) {
            const [ arg0, op, op_params ]
                = validate_op_args(raw_arg0, raw_op, raw_op_params)
                ; // eslint-disable-line indent
            return op_dict[op] || ('fetch' === verb && undefined === op)
                ? new Promise(_make_request)
                : NOOP
                ; // eslint-disable-line indent

            // -----------

            function _make_request(resolve_promise) {
                const url_params = build_request_params({
                    namespace,
                    arg0,
                    op,
                    payload: op_params,
                    }); // eslint-disable-line indent
                api[verb](url_params).then(process_response);

                // -----------

                function process_response(raw_response) {
                    const { item_preparer, query_result_preparer } = params;
                    const raw_data = raw_response.data;
                    if (Array.isArray(raw_data)) {
                        return resolve_promise(raw_data.map(item_preparer));
                    } else if (raw_data instanceof Query_result) {
                        const query_result = new Query_result(raw_data);
                        query_result.items = raw_data.items
                            .map(query_result_preparer)
                            ; // eslint-disable-line indent
                        return resolve_promise(query_result);
                    }
                    return resolve_promise(item_preparer(raw_data));
                }
            }
        };
    }

    function build_request_params(params) {
        const { namespace, arg0, op, payload } = params;
        const request_params = {};
        if (namespace && 'string' === typeof namespace) {
            request_params.namespace = namespace;
        }
        switch (true) {
            case ALL_ITEMS === arg0:
                break;
            case arg0 instanceof Query:
                request_params.query = String(arg0.query_string);
                break;
            case 'string' === typeof arg0:
            case 'number' === typeof arg0:
                request_params.id = arg0;
                break;
            default:
                // Shouldn't happen because of validate_op_args
        }
        if ('string' === typeof op) {
            request_params.operation = op;
            if ('object' === typeof payload) {
                request_params.payload = payload;
            }
        }
        return request_params;
    }

    // -----------

    function throw_invalid_verb_error(verb) {
        throw new Error(
            `${ verb } must be a method on the provided api`,
            ); // eslint-disable-line indent
    }

    function noprep(value) {
        return value;
    }

    // -----------

    function throw_error(message) {
        throw new Error(`BULLPEN.Datasource: ${ message }`);
    }
}(
    require('./api'),
    require('./collection/query'),
    require('./collection/query-result'),
    require('./collection/util'),
));
