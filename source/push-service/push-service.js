// eslint-disable-next-line max-params
(function main(Bullpen, Channel) {
    class Push_service {
        constructor(...args) {
            return construct_push_service.call(this, ...args);
        }
    }
    // Instance members
    Object.assign(Push_service.prototype, {
        get_channel,
        }); // eslint-disable-line indent
    // Static members
    Object.assign(Push_service, { Channel });
    return module.exports = Object.freeze(Push_service);

    // -----------

    function construct_push_service(...args) {
        const this_push_service = this;
        'function' !== typeof this_push_service.connect
            && throw_error('Children must define a connect instance method')
            ; // eslint-disable-line indent
        this_push_service.connect(...args);
        return this_push_service;
    }

    function get_channel(params) {
        const this_push_service = this;
        return new Channel({ ...params, push_service: this_push_service });
    }

    // -----------

    function throw_error(message) {
        throw new Error(`BULLPEN.Push_service: ${ message }`);
    }
}(
    require('../bullpen'),
    require('./channel'),
));
