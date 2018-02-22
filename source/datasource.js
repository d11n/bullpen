// eslint-disable-next-line max-params
(function main(axios) {
    //
    Object.assign(Datasource, {
        compose_url,
        make_request,
        }); // eslint-disable-line indent
    //
    Object.assign(Datasource.prototype, {
        //
        headers: {},
        protocol: 'https',
        domain: null,
        port: null,
        path_prefix: null,
        //
        fetch: make_fetch_request,
        create: make_create_request,
        overwrite: make_overwrite_request,
        patch: make_patch_request,
        delete: make_delete_request,
        compose_url: compose_url_from_instance,
        // For clearer code when using APIs with alternate semantics:
        do: make_create_request,
        post: make_create_request,
        put: make_overwrite_request,
        }); // eslint-disable-line
    return module.exports = Datasource;

    // -----------

    function Datasource(params) {
        const this_datasource = this;
        Object.assign(this_datasource, params);
        return this_datasource;
    }

    // -----------

    function make_fetch_request(params) {
        return make_request_from_instance.call(this, 'GET', params);
    }
    function make_create_request(params) {
        return make_request_from_instance.call(this, 'POST', params);
    }
    function make_overwrite_request(params) {
        return make_request_from_instance.call(this, 'PUT', params);
    }
    function make_patch_request(params) {
        return make_request_from_instance.call(this, 'PATCH', params);
    }
    function make_delete_request(params) {
        return make_request_from_instance.call(this, 'DELETE', params);
    }

    // -----------

    function make_request(url_composer, http_verb, params) {
        const { headers, payload } = params;
        const settings = {
            headers,
            method: http_verb,
            url: url_composer.call(params),
            }; // eslint-disable-line indent
        undefined !== payload && (settings.data = payload);
        let resolve_promise;
        axios.request(settings).then(clean_up_axios_response);
        return { then: set_promise_resolver };

        // -----------

        function clean_up_axios_response(response) {
            return resolve_promise(response.data.data);
        }
        function set_promise_resolver(promise_resolver) {
            return resolve_promise = promise_resolver;
        }
    }
    function make_request_from_instance(http_verb, params) {
        const this_datasource = this;
        const headers = Object.assign(
            {},
            this_datasource.headers,
            params.headers,
            ); // eslint-disable-line indent
        return make_request(
            this_datasource.compose_url,
            http_verb,
            Object.assign({}, params, { headers }),
            ); // eslint-disable-line indent
    }

    // -----------

    function compose_url(params) {
        const { protocol, domain, port } = params;
        const { path_prefix, namespace, id, operation } = params;
        let url = '';
        if (domain) {
            url += `${ protocol }://${ domain }`;
            port && (url += `:${ port }`);
        }
        const path_segments = [ path_prefix, namespace, id, operation ];
        for (let i = 0, n = path_segments - 1; i <= n; i++) {
            path_segments[i] && (url += `/${ trim_slashes(path_segments[i]) }`);
        }
        return url;
    }
    function compose_url_from_instance(params) {
        const this_datasource = this;
        const { protocol, domain, port, path_prefix } = this_datasource;
        const instance_params = { protocol, domain, port, path_prefix };
        return compose_url(Object.assign({}, instance_params, params));
    }

    // -----------

    function trim_slashes(value) {
        return value.replace(/(?:^\/+|\/+$)/g, '');
    }
}(
    require('axios'),
));
