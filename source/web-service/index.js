// eslint-disable-next-line max-params
(function main(Web_service, Mofo_service, Rest_service, UTIL) {
    const { NOOP } = UTIL;
    return module.exports = Object.freeze({
        Web_service,
        Mofo_service,
        Rest_service,
        NOOP,
    });
}(
    require('./web-service'),
    require('./mofo'),
    require('./rest'),
    require('./util'),
));
