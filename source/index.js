// eslint-disable-next-line max-params
(function main(WEB_SERVICE, Collection, Statepen, Treepen) {
    const { Web_service, Mofo_service } = WEB_SERVICE;
    console.warn([
        '☠️  BULLPEN is under active development and will change often ☠️',
        '\nNot until it reaches version 0.1.0',
        'will its interface be relatively stable.',
        ].join(' ')); // eslint-disable-line indent
    return module.exports = Object.freeze({
        Web_service,
        Mofo_service,
        Collection,
        Statepen,
        Treepen,
        }); // eslint-disable-line indent
}(
    require('./web-service'),
    require('./collection'),
    require('./statepen'),
    require('./treepen'),
));
