// eslint-disable-next-line max-params
(function main(axios, Uri_query, Api, API_UTIL) {
    class Ajax_api extends Api {
        constructor(...args) {
            return super() && construct_ajax_api.call(this, ...args);
        }
    }
    // Instance members
    Object.assign(Ajax_api.prototype, {
        // Default params
        headers: {},
        http_verb: 'GET',
        protocol: 'https',
        domain: null,
        port: null,
        path_prefix: null,
        query: {},

        // Abstract methods
        fetch: () => throw_error('Children of Ajax_api must define fetch()'),
        }); // eslint-disable-line
    // Static members
    Object.assign(Ajax_api, { compose_url, make_request });
    return module.exports = Object.freeze(Ajax_api);

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
        return new Promise(_make_request);

        // -----------

        function _make_request(resolve_promise) {
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
                if (params.preparer) {
                    const request_metadata = Object.assign({}, params);
                    delete request_metadata.preparer;
                    response.data = params.preparer(request_metadata, response);
                }
                return resolve_promise(response);
            }
            function process_axios_rejection(axios_rejection) {
                return axios_rejection.response
                    ? process_axios_response(axios_rejection.response)
                    : throw_error(axios_rejection)
                    ; // eslint-disable-line indent
            }
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

    // -----------

    function throw_error(message) {
        throw message instanceof Error
            ? message
            : new Error(`BULLPEN.Ajax_api: ${ message }`)
            ; // eslint-disable-line indent
    }
}(
    require('axios'),
    require('uri-query'),
    require('./api'),
    require('./util'),
));
