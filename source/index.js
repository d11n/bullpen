// eslint-disable-next-line max-params
(function main(API, Collection) {
    const { Mofo_api, Rest_api } = API;
    console.warn([
        '☠️  BULLPEN is under active development and will change often.',
        'Not until it reaches version 0.1.0',
        'will its interface be relatively stable. ☠️',
        ].join(' ')); // eslint-disable-line indent
    return module.exports = Object.freeze({
        Mofo_api,
        Rest_api,
        Collection,
        }); // eslint-disable-line indent
}(
    require('./api'),
    require('./collection'),
));
