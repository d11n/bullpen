// eslint-disable-next-line max-params
(function main(axios, Uri_query, Thin_promise, Api, API_UTIL) {
    class Ajax_api extends Api {
        constructor(...args) {
            return super() && construct_ajax_api.call(this, ...args);
        }
    }
    // Instance members
    Object.freeze(Object.assign(Ajax_api.prototype, {
        // Default params
        headers: {},
        http_verb: 'GET',
        protocol: 'https',
        domain: null,
        port: null,
        path_prefix: null,
        query: {},
        })); // eslint-disable-line
    // Static members
    Object.freeze(Object.assign(Ajax_api, { compose_url, make_request }));
    return module.exports = Ajax_api;

    // -----------

    function construct_ajax_api(params) {
        const this_api = this;
        Object.assign(this_api, validate_constructor_params(params));
        return this_api;
    }

    function validate_constructor_params(raw_params) {
        return raw_params || {};
    }

    // -----------

    function make_request(params, url_composer = compose_url) {
        const prepare_data = params.preparer;
        const request_metadata = Object.assign({}, params);
        delete request_metadata.preparer;

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
            if (prepare_data) {
                response.data = prepare_data(request_metadata, response);
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
                url += `/${ API_UTIL.trim_slashes(path_segments[i]) }`;
            }
        }
        const url_query = new Uri_query(query);
        return `${ url || '/' }${ url_query }`;
    }
}(
    require('axios'),
    require('uri-query'),
    require('../thin-promise'),
    require('./api'),
    require('./util'),
));
