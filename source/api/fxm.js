// eslint-disable-next-line max-params
(function main(Ajax_api, API_UTIL) {
    // Fetch XOR Mutate
    class Fxm_api extends Ajax_api {
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
    return module.exports = Object.freeze(Fxm_api);

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