// eslint-disable-next-line max-params
(function main(Web_service, WEB_SERVICE_UTIL) {
    // Mutate or Fetch Operations
    class Mofo_service extends Web_service {
        constructor(...args) {
            return super(...args);
        }
        fetch(params) {
            return make_request.call(this, params, 'GET');
        }
        mutate(params) {
            return make_request.call(this, params, 'POST');
        }
    }
    return module.exports = Object.freeze(Mofo_service);

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
