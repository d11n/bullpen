// eslint-disable-next-line max-params
(function main(Uri_query, API, Collection, Thin_promise, Query_result) {
    class Datasource {
        constructor(...args) {
            return construct_datasource.call(this, ...args);
        }
    }
    return module.exports = Datasource;

    // -----------

    function construct_datasource(raw_params) {
        const this_datasource = this;
        const params = validate_params(raw_params);

        const { api, namespace, operations } = params;
        const { preparer, item_preparer, query_result_preparer } = params;
        const real_item_preparer = item_preparer || preparer || noprep;
        const result_preparer = query_result_preparer || preparer || noprep;

        assign_requesters();
        return this_datasource;

        // -----------

        function assign_requesters() {
            const op_tree = {};
            for (const op_def of operations) {
                const verb = Array.isArray(op_def) ? op_def[0] : Object.keys[0];
                const op = Array.isArray(op_def) ? op_def[1] : Object.values[0];
                if (!api[verb]) {
                    throw_invalid_verb_error(verb);
                } else if (!this_datasource[verb]) {
                    op_tree[verb] = {};
                    this_datasource[verb] = create_requester({
                        api,
                        verb,
                        namespace,
                        op_dict: op_tree[verb],
                        item_preparer: real_item_preparer,
                        query_result_preparer: result_preparer,
                        }); // eslint-disable-line indent
                }
                op_tree[verb][op] = 'op';
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
        return function make_request(arg0, op, payload) {
            const next_thing = new Thin_promise;
            if (op_dict[op]) {
                const url_params = build_request_params({
                    namespace,
                    arg0,
                    op,
                    payload,
                    }); // eslint-disable-line indent
                api[verb](url_params).then(process_response);
                return next_thing;
            }
            return null;

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
        };
    }

    function build_request_params(params) {
        const { namespace, arg0, op, payload } = params;
        const request_params = { namespace };
        switch (true) {
            case undefined === arg0:
                return request_params;
            case Collection.ALL_ITEMS === arg0:
                break;
            case arg0 instanceof Uri_query:
                request_params.query = String(arg0);
                break;
            case 'string' === typeof arg0:
            case 'number' === typeof arg0:
                request_params.id = arg0;
                break;
            default:
                throw new TypeError([
                    'When calling a bullpen operation, arg 0 must be one of:',
                    'a string, a number, BULLPEN.Collection.ALL_ITEMS,',
                    'or an instance of BULLPEN.Collection.Query',
                    ].join(' ')); // eslint-disable-line indent
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
        throw new Error(`BULLPEN.Collection.Datasource: ${ message }`);
    }
}(
    require('uri-query'),
    require('../api'),
    require('../thin-promise'),
    require('./collection'),
    require('./query-result'),
));
