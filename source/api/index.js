// eslint-disable-next-line max-params
(function main(Api, Ajax_api, Fxm_api, Rest_api) {
    return module.exports = Object.freeze({
        Api,
        Ajax_api,
        Fxm_api,
        Rest_api,
        }); // eslint-disable-line indent
}(
    require('./api'),
    require('./ajax'),
    require('./fxm'),
    require('./rest'),
));
