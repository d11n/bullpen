// eslint-disable-next-line max-params
(function main() {
    return module.exports = {
        dereference,
        get_accessor,
        get_mutator,
        get_queryor,
        }; // eslint-disable-line indent

    // -----------

    function dereference(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function get_accessor(wrapper_function, accessor_list) {
        return function access(key, params) {
            return wrapper_function(accessor_list[key], key, params);
        };
    }
    function get_mutator(wrapper_function, mutator_list) {
        return function mutate(key, params, then) {
            return wrapper_function(mutator_list[key], key, params, then);
        };
    }
    function get_queryor(wrapper_function, queryor) {
        return function query(params) {
            return wrapper_function(queryor, params);
        };
    }
}());
