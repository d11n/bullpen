// eslint-disable-next-line max-params
(function main() {
    class Query_result {
        constructor(...args) {
            return construct_query_result.call(this, ...args);
        }
    }
    Query_result.has_id = has_id;
    return module.exports = Object.freeze(Query_result);

    // -----------

    function construct_query_result(raw_params) {
        const this_result = this;
        Object.assign(this_result, validate_constructor_params(raw_params));
        return this_result;
    }

    function validate_constructor_params(raw_params) {
        const params = {};
        raw_params.items
            && !Array.isArray(raw_params.items)
            && throw_error('items must be an array')
            ; // eslint-disable-line indent
        raw_params.refresh_url
            && 'string' !== typeof raw_params.refresh_url
            && throw_error('refresh_url must be a string')
            ; // eslint-disable-line indent
        params.query_string = String(raw_params.query_string);
        params.items = raw_params.items || [];
        params.refresh_url = raw_params.refresh_url || null;
        params.ids = raw_params.ids || params.items.map(get_id);
        return { ...raw_params, ...params };
    }

    function get_id(item) {
        return item.id;
    }

    function has_id(result, id) {
        return result.ids.includes(id);
    }

    // -----------

    function throw_error(message) {
        throw new Error(`BULLPEN.Collection.Query_result: ${ message }`);
    }
}());
