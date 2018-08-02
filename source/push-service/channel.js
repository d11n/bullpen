// eslint-disable-next-line max-params
(function main(Bullpen) {
    class Channel {
        constructor(...args) {
            return construct_channel.call(this, ...args);
        }
    }
    // Instance members
    Object.assign(Channel.prototype, {
        // Abstract instance methods
        connect_subscription: () => throw_error(
            'Children must define connect_subscription()',
            ), // eslint-disable-line
        }); // eslint-disable-line
    return module.exports = Object.freeze(Channel);

    // -----------

    function construct_channel(...args) {
        const this_channel = this;
        'function' !== typeof this_channel.subscribe
            && throw_error('Children must define a subscribe instance method')
            ; // eslint-disable-line indent
        const subscriber_list = [];
        this_channel.add_subscriber = add_subscriber;
        this_channel.remove_subscriber = remove_subscriber;
        // this_channel.notify_subscribers = notify_subscribers;
        this_channel.connect_subscription(...args);
        return this_channel;

        // -----------

        function is_subscriber(bullpen) {
            for (const subscriber of subscriber_list) {
                if (bullpen === subscriber) {
                    return true;
                }
            }
            return false;
        }

        function add_subscriber(bullpen) {
            !(bullpen instanceof Bullpen)
                && throw_error([
                    'add_subscriber() only takes',
                    'an instance of BULLPEN.Bullpen',
                    ].join(' ')) // eslint-disable-line indent
                ; // eslint-disable-line indent
            !is_subscriber(bullpen) && subscriber_list.push(bullpen);
            return true;
        }

        function remove_subscriber(bullpen) {
            !(bullpen instanceof Bullpen)
                && throw_error([
                    'remove_subscriber() only takes',
                    'an instance of BULLPEN.Bullpen',
                    ].join(' ')) // eslint-disable-line indent
                ; // eslint-disable-line indent
            for (let i = 0, n = subscriber_list.length - 1; i <= n; i++) {
                if (bullpen === subscriber_list[i]) {
                    subscriber_list.splice(i, 1);
                    return true;
                }
            }
            return true;
        }

        // function push() {
        //     // for (const subscriber of subscriber_list) {
        //     //
        //     // }
        //     return true;
        // }
    }

    // -----------

    function throw_error(message) {
        throw new Error(`BULLPEN.Push_service.Channel: ${ message }`);
    }
}(
    require('../bullpen'),
));
