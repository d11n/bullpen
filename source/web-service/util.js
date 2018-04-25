// eslint-disable-next-line max-params
(function main() {
    return module.exports = Object.freeze({
        make_request_from_instance,
        compose_url_from_instance,
        trim_slashes,
        }); // eslint-disable-line indent

    // -----------

    function make_request_from_instance(params) {
        const this_endpoint = this;
        const { preparer } = this_endpoint;
        const headers = Object.assign(
            {},
            this_endpoint.headers,
            params.headers,
            ); // eslint-disable-line indent
        return this_endpoint.constructor.make_request(
            Object.assign({}, params, { headers, preparer }),
            compose_url_from_instance.bind(this_endpoint),
            ); // eslint-disable-line indent
    }

    function compose_url_from_instance(params) {
        const this_endpoint = this;
        const { protocol, domain, port, path_prefix } = this_endpoint;
        const instance_params = { protocol, domain, port, path_prefix };
        return this_endpoint.constructor.compose_url(
            Object.assign({}, instance_params, params),
            ); // eslint-disable-line indent
    }

    function trim_slashes(value) {
        return value.replace(/(?:^\/+|\/+$)/g, '');
    }
}());
