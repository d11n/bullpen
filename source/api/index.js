// eslint-disable-next-line max-params
(function main(Api, Ajax_api, Mofo_api, Rest_api) {
    return module.exports = Object.freeze({
        Api,
        Ajax_api,
        Mofo_api,
        Rest_api,
        }); // eslint-disable-line indent
}(
    require('./api'),
    require('./ajax'),
    require('./mofo'),
    require('./rest'),
));
