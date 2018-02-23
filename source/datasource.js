// eslint-disable-next-line max-params
(function main(axios) {
    assign_static_members();
    assign_instance_members();
    return module.exports = Object.freeze(Datasource);

    // -----------

    function assign_static_members() {
        return Object.assign(Datasource, {
            compose_url,
            make_request,
            }); // eslint-disable-line indent
    }

    function Datasource(params) {
        const this_datasource = this;
        Object.assign(this_datasource, validate_constructor_params(params));
        return this_datasource;
    }

    function assign_instance_members() {
        return Object.assign(Datasource.prototype, {
            //
            headers: {},
            http_verb: 'GET',
            protocol: 'https',
            domain: null,
            port: null,
            path_prefix: null,
            query: {},
            //
            fetch: make_fetch_request,
            create: make_create_request,
            overwrite: make_overwrite_request,
            patch: make_patch_request,
            delete: make_delete_request,
            // For clearer code when using APIs with alternate semantics:
            do: make_create_request,
            post: make_create_request,
            put: make_overwrite_request,
            }); // eslint-disable-line
    }

    function validate_constructor_params(raw_params) {
        return raw_params;
    }

    // -----------

    function make_fetch_request(params) {
        return make_request_from_instance
            .call(this, Object.assign({}, params, { http_verb: 'GET' }))
            ; // eslint-disable-line indent
    }
    function make_create_request(params) {
        return make_request_from_instance
            .call(this, Object.assign({}, params, { http_verb: 'POST' }))
            ; // eslint-disable-line indent
    }
    function make_overwrite_request(params) {
        return make_request_from_instance
            .call(this, Object.assign({}, params, { http_verb: 'PUT' }))
            ; // eslint-disable-line indent
    }
    function make_patch_request(params) {
        return make_request_from_instance
            .call(this, Object.assign({}, params, { http_verb: 'PATCH' }))
            ; // eslint-disable-line indent
    }
    function make_delete_request(params) {
        return make_request_from_instance
            .call(this, Object.assign({}, params, { http_verb: 'DELETE' }))
            ; // eslint-disable-line indent
    }

    // -----------

    function make_request(params, url_composer = compose_url) {
        const { headers, http_verb, payload } = params;
        const settings = {
            headers,
            method: http_verb,
            url: url_composer(params),
            }; // eslint-disable-line indent
        undefined !== payload && (settings.data = payload);
        let resolve_promise;
        axios.request(settings)
            .then(process_axios_resolution)
            .catch(process_axios_rejection)
            ; // eslint-disable-line indent
        return { then: set_promise_resolver };

        // -----------

        function process_axios_resolution(axios_response) {
            const translate_response_data = params.response_data_translator;
            const request = Object.assign({}, params);
            delete request.response_data_translator;
            const response = {
                status: {
                    code: axios_response.status,
                    text: axios_response.statusText,
                    }, // eslint-disable-line indent
                headers: axios_response.headers,
                data: axios_response.data,
                }; // eslint-disable-line indent
            if (translate_response_data) {
                response.data = translate_response_data(request, response);
            }
            return resolve_promise(response);
        }
        function process_axios_rejection(axios_response) {
            debugger;
            return process_axios_resolution(axios_response.response);
        }
        function set_promise_resolver(promise_resolver) {
            return resolve_promise = promise_resolver;
        }
    }
    function make_request_from_instance(params) {
        const this_datasource = this;
        const { response_data_translator } = this_datasource;
        const headers = Object.assign(
            {},
            this_datasource.headers,
            params.headers,
            ); // eslint-disable-line indent
        return this_datasource.constructor.make_request(
            Object.assign({}, params, { headers, response_data_translator }),
            compose_url_from_instance.bind(this_datasource),
            ); // eslint-disable-line indent
    }

    // -----------

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
            path_segments[i] && (url += `/${ trim_slashes(path_segments[i]) }`);
        }
        const url_query = url_encode_query(query);
        return `${ url || '/' }${ url_query }`;
    }
    function compose_url_from_instance(params) {
        const this_datasource = this;
        const { protocol, domain, port, path_prefix } = this_datasource;
        const instance_params = { protocol, domain, port, path_prefix };
        return this_datasource.constructor.compose_url(
            Object.assign({}, instance_params, params),
            ); // eslint-disable-line indent
    }

    // -----------

    function trim_slashes(value) {
        return value.replace(/(?:^\/+|\/+$)/g, '');
    }

    function url_encode_query(raw_query) {
        const query_keys = Object.keys(raw_query);
        const query_pairs = [];
        for (let qi = 0, qn = query_keys.length - 1; qi <= qn; qi++) {
            const raw_key = query_keys[qi];
            const raw_value = raw_query[raw_key];
            if (undefined === raw_value) {
                // do nothing
            } else if (null === raw_value) {
                query_pairs.push(encodeURIComponent(raw_key));
            } else if (Array.isArray(raw_value)) {
                append_queryized_array(raw_key, raw_value);
            } else if ('object' === typeof raw_value) {
                append_queryized_object(raw_key, raw_value);
            } else {
                const key = encodeURIComponent(raw_key);
                const value = encodeURIComponent(raw_value);
                query_pairs.push(`${ key }=${ value }`);
            }
        }
        return query_pairs.length > 0 ? `?${ query_pairs.join('&') }` : '';

        // -----------

        function append_queryized_array(raw_key, raw_value) {
            const key = `${ encodeURIComponent(raw_key) }[]`;
            for (let ai = 0, an = raw_value.length - 1; ai <= an; ai++) {
                const value = encodeURIComponent(raw_value[ai]);
                query_pairs.push(`${ key }=${ value }`);
            }
            return true;
        }

        function append_queryized_object(raw_key, raw_value) {
            const subkeys = Object.keys(raw_value);
            for (let oi = 0, on = subkeys.length - 1; oi <= on; oi++) {
                const subkey = subkeys[oi];
                // eslint-disable-next-line prefer-template
                const key = encodeURIComponent(raw_key)
                    + `[${ encodeURIComponent(subkey) }]`
                    ; // eslint-disable-line indent
                const value = encodeURIComponent(raw_value[subkey]);
                query_pairs.push(`${ key }=${ value }`);
            }
            return true;
        }
    }
}(
    require('axios'),
));
