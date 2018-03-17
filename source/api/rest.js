// eslint-disable-next-line max-params
(function main(Ajax_api, API_UTIL) {
    class Rest_api extends Ajax_api {
        constructor(...args) {
            return super(...args);
        }
        fetch(params) {
            return make_request.call(this, params, 'GET');
        }
        create(params) {
            return make_request.call(this, params, 'POST');
        }
        overwrite(params) {
            return make_request.call(this, params, 'PUT');
        }
        patch(params) {
            return make_request.call(this, params, 'PATCH');
        }
        delete(params) {
            return make_request.call(this, params, 'DELETE');
        }
        // Sometimes a POST is semantically not a create operation
        // e.g. POST /article/42/publish
        post(params) {
            return make_request.call(this, params, 'POST');
        }
    }
    return module.exports = Object.freeze(Rest_api);

    // -----------

    function make_request(params, http_verb) {
        return API_UTIL.make_request_from_instance.call(
            this,
            Object.assign({}, params, { http_verb }),
            ); // eslint-disable-line indent
    }
}(
    require('./ajax'),
    require('./util'),
));
