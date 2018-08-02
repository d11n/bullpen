// eslint-disable-next-line max-params
(function main(Bullpen, Store, Op, UTIL) {
    const { NOOP } = UTIL;
    class View extends Bullpen {
        constructor(...args) {
            return super() && construct_view.call(this, ...args);
        }
    }
    // Functional instance members
    Object.assign(View.prototype, {
        perform_operation,
        }); // eslint-disable-line indent
    // Static members
    Object.defineProperties(View, {
        // Final
        NOOP: { value: NOOP, enumerable: true },
        // Overridable by subclass
        Store: { value: Store, writable: true, enumerable: true },
        Operation: { value: Op, writable: true, enumerable: true },
        }); // eslint-disable-line indent
    return module.exports = Object.seal(View);

    // -----------

    function construct_view(raw_params) {
        const view = this;
        const { store } = validate_params(view, raw_params);
        const creator_args = [ view, store ];
        view.get = () => throw_error([
            'use stream() instead of get().',
            'View Bullpens must always stream their values',
            'because they can only contain local, non-persistent data',
            ]); // eslint-disable-line indent
        view.stream = create_streamer(...creator_args);
        view.mutate = create_mutator(...creator_args);
        return view;
    }

    function validate_params(this_view, raw_params) {
        const params = {};
        /* eslint-disable indent */
        raw_params.endpoint
            && throw_error([
                'View Bullpens cannot use an endpoint',
                'because they can only contain local, non-persistent data',
                ])
            ;
        params.store
            = undefined === raw_params.store
                ? new this_view.constructor.Store
            : !(raw_params.store instanceof Store)
                ? throw_error('store must be an instance of Collection.Store')
            : raw_params.store
            ;
        /* eslint-enable indent */
        return params;
    }

    // -----------

    function create_streamer(view, store) {
        const static_op_params = Object.assign({ store }, {
            bullpen_verb: 'stream',
            store_verb: 'fetch',
            }); // eslint-disable-line
        return function stream_from_view(op, op_params) {
            return view.perform_operation(
                new Op({ ...static_op_params, op, op_params }),
                ); // eslint-disable-line indent
        };
    }

    function create_mutator(view, store) {
        const static_op_params = Object.assign({ store }, {
            bullpen_verb: 'mutate',
            store_verb: 'mutate',
            }); // eslint-disable-line
        return function mutate_view(op, op_params) {
            if ('string' !== typeof op) {
                throw new TypeError([
                    'When calling a View Bullpen mutation operation,',
                    'arg 0 must be the name of the operation to perform',
                    ].join(' ')); // eslint-disable-line indent
            }
            view.perform_operation(
                new Op({ ...static_op_params, op, op_params }),
                ); // eslint-disable-line indent
            return undefined;
            // ^ Never return data on mutate
            //   Fetch after mutation via subscription or promise
        };
    }

    // -----------

    function perform_operation(op) {
        return op.execute_on_store();
    }

    // -----------

    function throw_error(raw_message) {
        const message = Array.isArray(raw_message)
            ? raw_message.join(' ')
            : String(raw_message)
            ;
        throw new Error(`BULLPEN.View: ${ message }`);
    }
}(
    require('../bullpen'),
    require('./store'),
    require('./operation'),
    require('./util'),
));
