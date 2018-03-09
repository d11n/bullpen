// eslint-disable-next-line max-params
(function main(axios, Uri_query, Thin_promise, DATASOURCE_UTIL) {
    assign_static_members();
    assign_instance_members();
    return module.exports = Object.freeze(Datasource);

    // -----------

    function Datasource(params) {
        const this_datasource = this;
        Object.assign(this_datasource, validate_constructor_params(params));
        return this_datasource;
    }

    function assign_static_members() {
        return Object.assign(Datasource, {
            compose_url,
            make_request,
            }); // eslint-disable-line indent
    }

    function assign_instance_members() {
        return Object.assign(Datasource.prototype, {

            // Default params
            headers: {},
            http_verb: 'GET',
            protocol: 'https',
            domain: null,
            port: null,
            path_prefix: null,
            query: {},

            // Methods
            fetch: make_fetch_request,
            do: make_do_request,
            }); // eslint-disable-line
    }

    function validate_constructor_params(raw_params) {
        return raw_params || {};
    }

    // -----------

    function make_fetch_request(params) {
        return DATASOURCE_UTIL.make_request_from_instance.call(
            this,
            Object.assign({}, params, { http_verb: 'GET' }),
            ); // eslint-disable-line indent
    }
    function make_do_request(params) {
        return DATASOURCE_UTIL.make_request_from_instance.call(
            this,
            Object.assign({}, params, { http_verb: 'POST' }),
            ); // eslint-disable-line indent
    }

    // -----------

    function make_request(params, url_composer = compose_url) {
        const prepare_response_data = params.response_data_preparer;
        const request = Object.assign({}, params);
        delete request.response_data_preparer;

        const { headers, http_verb, payload } = params;
        const settings = {
            headers,
            method: http_verb,
            url: url_composer(params),
            }; // eslint-disable-line indent
        undefined !== payload && (settings.data = payload);

        axios.request(settings)
            .then(process_axios_response)
            .catch(process_axios_rejection)
            ; // eslint-disable-line indent
        const next_thing = new Thin_promise;
        return next_thing;

        // -----------

        function process_axios_response(axios_response) {
            const response = {
                status: {
                    code: axios_response.status,
                    text: axios_response.statusText,
                    }, // eslint-disable-line indent
                headers: axios_response.headers,
                data: axios_response.data,
                }; // eslint-disable-line indent
            if (prepare_response_data) {
                response.data = prepare_response_data(request, response);
            }
            return next_thing.do(response);
        }
        function process_axios_rejection(axios_rejection) {
            return process_axios_response(axios_rejection.response);
        }
    }

    function compose_url(params) {
        const { protocol, domain, port, path_prefix } = params;
        const { namespace, id, operation, query } = params;
        let url = '';
        if (domain) {
            url += `${ protocol }://${ domain }`;
            port && (url += `:${ port }`);
        }
        const path_segments = [ path_prefix, namespace, id, operation ];
        for (let i = 0, n = path_segments.length - 1; i <= n; i++) {
            if (path_segments[i]) {
                url += `/${ DATASOURCE_UTIL.trim_slashes(path_segments[i]) }`;
            }
        }
        const url_query = new Uri_query(query);
        return `${ url || '/' }${ url_query }`;
    }
}(
    require('axios'),
    require('uri-query'),
    require('../thin-promise'),
    require('./util'),
));
