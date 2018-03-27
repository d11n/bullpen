// eslint-disable-next-line max-params
(function main(Datasource, Store, Query, UTIL) {
    const { ALL_ITEMS } = UTIL;
    class Operation {
        constructor(...args) {
            return construct_operation.call(this, ...args);
        }
    }
    return module.exports = Object.freeze(Operation);

    // -----------

    function construct_operation(raw_params) {
        const this_op = this;
        Object.assign(this_op, validate_constructor_params(raw_params));
        const raw_arg = undefined === raw_params.arg
            ? ALL_ITEMS
            : raw_params.arg
            ;
        const data_func = raw_params.datasource[raw_params.datasource_verb];
        const store_func = raw_params.store[raw_params.store_verb];
        Object.assign(this_op, {
            is_for_all_items: ALL_ITEMS === raw_arg,
            is_for_query_result: raw_arg instanceof Query,
            execute_on_datasource,
            execute_on_store,
            }); // eslint-disable-line indent
        this_op.is_for_one_item = !this_op.is_for_all_items
            && !this_op.is_for_query_result
            ; // eslint-disable-line indent
        this_op.is_for_query_result
            ? this_op.query = raw_arg
            : this_op.is_for_one_item
                && (this_op.id = raw_arg)
            ; // eslint-disable-line indent
        return this_op;

        // -----------

        function execute_on_datasource(data) {
            return data_func(raw_arg, this_op.op, data);
        }

        function execute_on_store(data) {
            return store_func(raw_arg, this_op.op, data);
        }
    }

    function validate_constructor_params(raw_params) {
        const params = {};
        enforce_conduct();
        params.verb = raw_params.bullpen_verb;
        params.name = raw_params.op;
        params.params = raw_params.op_params;
        return params;

        // -----------

        function enforce_conduct() {
            enforce_required_object('datasource', Datasource, 'Datasource');
            enforce_required_object('store', Store, 'Store');
            const verb_list = [ 'bullpen', 'datasource', 'store' ];
            for (const verb of verb_list) {
                enforce_required_string(`${ verb }_verb`);
            }
            ![ 'get', 'stream', 'mutate' ].includes(raw_params.bullpen_verb)
                && throw_error([
                    'bullpen_verb must be either "get", "stream", or "mutate",',
                    `not '${ raw_params.bullpen_verb }'`,
                    ].join(' ')) // eslint-disable-line indent
                ; // eslint-disable-line indent
            ![ 'fetch', 'mutate' ].includes(raw_params.store_verb)
                && throw_error([
                    'bullpen_verb must be either "fetch" or "mutate",',
                    `not '${ raw_params.store_verb }'`,
                    ].join(' ')) // eslint-disable-line indent
                ; // eslint-disable-line indent
            const { datasource, datasource_verb } = raw_params;
            'function' !== typeof datasource[datasource_verb]
                && throw_error(
                    'datasource_verb must be method on the datasource',
                    ) // eslint-disable-line indent
                ; // eslint-disable-line indent
            const { arg, op, op_params } = raw_params;
            switch (true) {
                case undefined === arg:
                case ALL_ITEMS === arg:
                case arg instanceof Query:
                case 'string' === typeof arg:
                case 'number' === typeof arg:
                    if (op && 'string' !== typeof op) {
                        throw new Error([
                            'When calling a bullpen operation,',
                            'if arg 1 is provided, it must be',
                            'the name of the operation to perform',
                            ].join(' ')); // eslint-disable-line indent
                    } else if (op_params && 'object' !== typeof op_params) {
                        throw new Error([
                            'When calling a bullpen operation,',
                            'if arg 2 is provided, it must be a params object',
                            ].join(' ')); // eslint-disable-line indent
                    }
                    return true;
            }
            throw new Error([
                'When calling a bullpen operation, if args are provided,',
                'arg 0 must be one of:',
                'a string, a number, COLLECTION.ALL_ITEMS, or',
                'an instance of COLLECTION.Query',
                ].join(' ')); // eslint-disable-line indent
        }
        function enforce_required(param) {
            return undefined !== raw_params[param]
                || throw_error(`${ param } is required`)
                ; // eslint-disable-line indent
        }
        function enforce_required_object(param, Ref, name) {
            return enforce_required(param)
                && !(raw_params[param] instanceof Ref)
                && throw_error(`${ param } must be an instance of ${ name }`)
                ; // eslint-disable-line indent
        }
        function enforce_required_string(param) {
            return enforce_required(param)
                && 'string' !== typeof raw_params[param]
                && throw_error(`${ param } must be a string`)
                ; // eslint-disable-line indent
        }
    }

    // -----------

    function throw_error(message) {
        throw new Error(`BULLPEN.Collection.Operation: ${ message }`);
    }
}(
    require('../datasource'),
    require('./store'),
    require('./query'),
    require('./util'),
));
