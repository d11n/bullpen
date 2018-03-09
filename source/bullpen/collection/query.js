// eslint-disable-next-line max-params
(function main(Uri_query, Result) {
    assign_static_members();
    assign_instance_members();
    return module.exports = Query;

    // -----------

    function Query(params) {
        const this_query = this;
        Uri_query.call(this_query, params);
        return this_query;
    }

    function assign_static_members() {
        return Object.assign(Query, {
            Result,
            SORT_STRATEGY_SET: new WeakSet([
                /* eslint-disable no-new-wrappers */
                Query.SORT_DESC = new String('desc'),
                Query.SORT_ASC = new String('asc'),
                /* eslint-enable no-new-wrappers */
                ]), // eslint-disable-line indent
            }); // eslint-disable-line indent
    }

    function assign_instance_members() {
        return Object.assign(Query.prototype = new Uri_query, {
            // Default params
            // search_for: '',
            search: '',
            per_page: 10,
            page: 1,
            // sort_by: [ { updated_at: Query.SORT_DESC } ],
            sorts: `updated_at.${ Query.SORT_DESC }`,
            // filter_by: [],
            filter: {},
            }); // eslint-disable-line
    }
}(
    require('uri-query'),
    require('./result'),
));
