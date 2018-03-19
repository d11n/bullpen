// eslint-disable-next-line max-params
(function main(Uri_query) {
    class Query {
        constructor(...args) {
            return construct_query.call(this, ...args);
        }
    }
    return module.exports = Object.freeze(Query);

    // -----------

    function construct_query(query_id, query_string) {
        const this_query = this;
        Object.assign(
            this_query,
            validate_constructor_args(query_id, query_string),
            ); // eslint-disable-line indent
        return this_query;
    }

    function validate_constructor_args(query_id, query_string) {
        !query_id && throw_error('query_id is required');
        'string' !== typeof query_id
            && throw_error('query_id must be a string')
            ; // eslint-disable-line indent
        const params = {};
        params.query_id = query_id;
        params.query_string = Uri_query(query_string);
        return params;
    }

    // -----------

    function throw_error(message) {
        throw new Error(`BULLPEN.Collection.Query: ${ message }`);
    }
}(
    require('uri-query'),
));
