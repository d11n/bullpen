// eslint-disable-next-line max-params
(function main(Web_service, WEB_SERVICE_UTIL) {
    class Rest_service extends Web_service {
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
    return module.exports = Object.freeze(Rest_service);

    // -----------

    function make_request(params, http_verb) {
        return WEB_SERVICE_UTIL.make_request_from_instance.call(
            this,
            Object.assign({}, params, { http_verb }),
            ); // eslint-disable-line indent
    }
}(
    require('./web-service'),
    require('./util'),
));
