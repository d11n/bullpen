// eslint-disable-next-line max-params
(function main() {
    return module.exports = Object.freeze({
        make_request_from_instance,
        compose_url_from_instance,
        trim_slashes,
        }); // eslint-disable-line indent

    // -----------

    function make_request_from_instance(params) {
        const this_datasource = this;
        const { response_data_preparer } = this_datasource;
        const headers = Object.assign(
            {},
            this_datasource.headers,
            params.headers,
            ); // eslint-disable-line indent
        return this_datasource.constructor.make_request(
            Object.assign({}, params, { headers, response_data_preparer }),
            compose_url_from_instance.bind(this_datasource),
            ); // eslint-disable-line indent
    }

    function compose_url_from_instance(params) {
        const this_datasource = this;
        const { protocol, domain, port, path_prefix } = this_datasource;
        const instance_params = { protocol, domain, port, path_prefix };
        return this_datasource.constructor.compose_url(
            Object.assign({}, instance_params, params),
            ); // eslint-disable-line indent
    }

    function trim_slashes(value) {
        return value.replace(/(?:^\/+|\/+$)/g, '');
    }
}());
