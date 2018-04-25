// eslint-disable-next-line max-params
(function main(Web_service, Mofo_service, Rest_service) {
    return module.exports = Object.freeze({
        Web_service,
        Mofo_service,
        Rest_service,
        }); // eslint-disable-line indent
}(
    require('./web-service'),
    require('./mofo'),
    require('./rest'),
));
