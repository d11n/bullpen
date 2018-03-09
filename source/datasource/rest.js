// eslint-disable-next-line max-params
(function main(Datasource, DATASOURCE_UTIL) {
    assign_instance_members();
    return module.exports = Object.freeze(Rest_datasource);

    // -----------

    function Rest_datasource(params) {
        const this_datasource = this;
        Datasource.call(this_datasource, params);
        return this_datasource;
    }

    function assign_instance_members() {
        return Object.assign(Rest_datasource.prototype = new Datasource, {
            fetch: make_fetch_request,
            create: make_post_request,
            overwrite: make_overwrite_request,
            patch: make_patch_request,
            delete: make_delete_request,

            // Sometimes a POST is not semantically a create operation
            // e.g. POST /article/42/publish
            post: make_post_request,
            }); // eslint-disable-line
    }

    // -----------

    function make_fetch_request(params) {
        return DATASOURCE_UTIL.make_request_from_instance.call(
            this,
            Object.assign({}, params, { http_verb: 'GET' }),
            ); // eslint-disable-line indent
    }
    function make_post_request(params) {
        return DATASOURCE_UTIL.make_request_from_instance.call(
            this,
            Object.assign({}, params, { http_verb: 'POST' }),
            ); // eslint-disable-line indent
    }
    function make_overwrite_request(params) {
        return DATASOURCE_UTIL.make_request_from_instance.call(
            this,
            Object.assign({}, params, { http_verb: 'PUT' }),
            ); // eslint-disable-line indent
    }
    function make_patch_request(params) {
        return DATASOURCE_UTIL.make_request_from_instance.call(
            this,
            Object.assign({}, params, { http_verb: 'PATCH' }),
            ); // eslint-disable-line indent
    }
    function make_delete_request(params) {
        return DATASOURCE_UTIL.make_request_from_instance.call(
            this,
            Object.assign({}, params, { http_verb: 'DELETE' }),
            ); // eslint-disable-line indent
    }
}(
    require('./index.js'),
    require('./util'),
));
