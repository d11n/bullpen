// eslint-disable-next-line max-params
(function main(Bullpen, Store, Op, UTIL) {
    const { NOOP } = UTIL;
    class Statepen extends Bullpen {
        constructor(...args) {
            return super(...args) && construct_statepen.apply(this, args);
        }
    }
    // Instance members
    Object.assign(Statepen.prototype, {
        perform_operation,
    });
    // Static members
    Object.defineProperties(Statepen, {
        // Final
        NOOP: { value: NOOP, enumerable: true },
        // Overridable by subclass
        Store: { value: Store, writable: true, enumerable: true },
        Operation: { value: Op, writable: true, enumerable: true },
    });
    return module.exports = Object.seal(Statepen);

    // -----------

    function construct_statepen(raw_params) {
        const statepen = this;
        const { store } = validate_params(statepen, raw_params);
        const creator_args = [ statepen, store ];
        statepen.get = create_getter(...creator_args);
        statepen.stream = create_streamer(...creator_args);
        statepen.mutate = create_mutator(...creator_args);
        return statepen;
    }

    function validate_params(statepen, raw_params) {
        const params = {};
        /* eslint-disable indent */
        raw_params.endpoint
            && throw_error([
                'Statepens cannot use an endpoint',
                'because they can only contain local, non-persistent data',
                ])
            ;
        params.store
            = undefined === raw_params.store
                ? new statepen.constructor.Store
            : !(raw_params.store instanceof Store)
                ? throw_error('store must be an instance of Collection.Store')
            : raw_params.store
            ;
        /* eslint-enable indent */
        return params;
    }

    // -----------

    function create_getter(statepen, store) {
        const static_op_params = Object.assign({ store }, {
            bullpen_verb: 'get',
            store_verb: 'fetch',
        });
        return function get_from_state(name, params) {
            return statepen.perform_operation(
                new Op({ ...static_op_params, name, params }),
            );
        };
    }

    function create_streamer(statepen, store) {
        const static_op_params = Object.assign({ store }, {
            bullpen_verb: 'stream',
            store_verb: 'fetch',
        });
        return function stream_from_state(name, params) {
            return statepen.perform_operation(
                new Op({ ...static_op_params, name, params }),
            );
        };
    }

    function create_mutator(statepen, store) {
        const static_op_params = Object.assign({ store }, {
            bullpen_verb: 'mutate',
            store_verb: 'mutate',
        });
        return function mutate_state(name, params) {
            if ('string' !== typeof name) {
                throw new TypeError([
                    'When calling a Statepen mutation operation,',
                    'arg 0 must be either the key to mutate,',
                    'or the name of the operation to perform',
                ]);
            }
            statepen.perform_operation(
                new Op({ ...static_op_params, name, params }),
            );
            return undefined;
            // ^ Never return data on mutate
            //   Fetch after mutation via subscription or promise
        };
    }

    // -----------

    function perform_operation(op) {
        return prepare_result(op.execute_on_store());

        // -----------

        function prepare_result(result) {
            /* eslint-disable indent */
            return 'get' === op.verb ? JSON.parse(JSON.stringify(result))
                : 'mutate' === op.verb ? undefined
                : result
                ;
            /* eslint-enable indent */
        }
    }

    // -----------

    function throw_error(raw_message) {
        const message = Array.isArray(raw_message)
            ? raw_message.join(' ')
            : String(raw_message)
            ;
        throw new Error(`BULLPEN.Statepen: ${ message }`);
    }
}(
    require('../bullpen'),
    require('./store'),
    require('./operation'),
    require('./util'),
));
