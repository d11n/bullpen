// eslint-disable-next-line max-params
(function main(axios, Uri_query, Endpoint, WEB_SERVICE_UTIL) {
    class Web_service {
        constructor(...args) {
            return construct_web_service.call(this, ...args);
        }
    }
    // Instance members
    Object.assign(Web_service.prototype, {
        // Default params
        headers: {},
        http_verb: 'GET',
        protocol: 'https',
        domain: null,
        port: null,
        path_prefix: null,
        query: {},
        // Abstract instance methods
        fetch: () => throw_error('Children of Web_service must define fetch()'),
        // Instance methods
        get_endpoint,
        }); // eslint-disable-line
    // Static members
    Object.assign(Web_service, { Endpoint, compose_url, make_request });
    return module.exports = Object.freeze(Web_service);

    // -----------

    function construct_web_service(params) {
        const this_web_service = this;
        Object.assign(this_web_service, validate_constructor_params(params));
        return this_web_service;
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
                url += `/${ WEB_SERVICE_UTIL.trim_slashes(path_segments[i]) }`;
            }
        }
        const url_query = new Uri_query(query);
        return `${ url || '/' }${ url_query }`;
    }

    function get_endpoint(params) {
        const this_web_service = this;
        return new Endpoint({ ...params, web_service: this_web_service });
    }

    // -----------

    function throw_error(message) {
        throw message instanceof Error
            ? message
            : new Error(`BULLPEN.Web_service: ${ message }`)
            ; // eslint-disable-line indent
    }
}(
    require('axios'),
    require('uri-query'),
    require('./endpoint'),
    require('./util'),
));
