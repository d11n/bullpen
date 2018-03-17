// eslint-disable-next-line max-params
(function main(API, Collection) {
    const { Mofo_api, Rest_api } = API;
    return module.exports = Object.freeze({
        Mofo_api,
        Rest_api,
        Collection,
        }); // eslint-disable-line indent
}(
    require('./api'),
    require('./collection'),
));
