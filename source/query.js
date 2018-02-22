// eslint-disable-next-line max-params
(function main() {
    /// ## Static methods
    /// ```
    /// Query.convert_to_uri_query(query_object)
    /// Query.convert_to_json(query_object)
    /// Query.translate_to_uri_query(
    ///     query_object,
    ///     translate_dict,
    ///     )
    /// ```
    Query.convert_to_uri_query = convert_to_uri_query;
    Query.convert_to_json = convert_to_json;
    Query.translate_to_uri_query = translate_to_uri_query;

    /// ## Sort Strategies
    /// ```
    /// Query.SORT_DESC
    /// Query.SORT_ASC
    /// ```
    /// <small>
    /// **Note**<br/>
    /// By constructing `String`s, the sort strategies act more like
    /// ES6 `Symbol`s, wherein `===` checks the object reference instead of
    /// the string primitive (`constructed_string.valueOf()`), and would be
    /// `false`. However, the `==` fuzzy check would be `true`, which is
    /// different from `Symbol`s.
    /// </small>
    /* eslint-disable no-new-wrappers */
    Query.SORT_STRATEGIES = [
        Query.SORT_DESC = new String('desc'),
        Query.SORT_ASC = new String('asc'),
        ]; // eslint-disable-line indent
    /* eslint-enable no-new-wrappers */

    /// ## Instance members
    /// ```
    /// query_object.to_uri_query()
    /// query_object.to_json()
    /// query_object.translate_to_uri_query(transform_dict)
    /// ```

    Object.assign(Query.prototype, get_default_query_params());
    Object.defineProperties(Query.prototype, {
        to_uri_query: { value: convert_this_query_to_uri_query },
        to_json: { value: convert_this_query_to_json },
        translate_to_json: { value: translate_this_query_to_uri_query },
        }); // eslint-disable-line indent

    Object.freeze(Query.prototype);
    return module.exports = Object.freeze(Query);

    // -----------

    function Query(params) {
        const this_query = this;
        Object.assign(this_query, params);
        return this_query;
    }

    /// ## Default query attributes
    function get_default_query_params() {
        return {
            /// `search_for`<br/>Parseable search string
            search_for: '',
            /// `per_page`<br/>Items per page
            per_page: 10,
            /// `page`<br/>Which page in the result set
            page: 0,
            /// `sort_by`<br/>Sequence of `{ field_name: SORT_STRATEGY }` pairs,
            /// where order is enforced
            sort_by: [ { updated_at: Query.SORT_DESC } ],
            /// `filter_by`<br/>Set of `{ field_name: value }` pairs,
            /// where order is ignored
            filter_by: [],
            }; // eslint-disable-line indent
    }

    // -----------

    function convert_to_uri_query(query_params) {
        if ('object' !== typeof query_params) {
            throw new Error('query_params must be an object');
        }
        let uri_query = '';
        uri_query += get_uri_query_pair('?', 'search_for');
        uri_query += get_uri_query_pair('&', 'per_page');
        uri_query += get_uri_query_pair('&', 'page');
        uri_query += append_sort_by_pairs('&', 'sort_by');
        uri_query += append_filter_by_pairs('&', 'filter_by');
        return uri_query;

        // -----------

        function get_uri_query_pair(separator, key) {
            const value = encodeURIComponent(query_params[key]);
            return get_uri_query_append(separator, key, value);
        }
        function append_sort_by_pairs(separator, key) {
            const value = encodeURIComponent(JSON.stringify(query_params[key]));
            return get_uri_query_append(separator, key, value);
        }
        function append_filter_by_pairs(separator, key) {
            const value = encodeURIComponent(JSON.stringify(query_params[key]));
            return get_uri_query_append(separator, key, value);
        }
    }
    function convert_this_query_to_uri_query() {
        const this_query = this;
        return convert_to_uri_query(this_query);
    }

    // -----------

    function translate_to_uri_query(query_params, translate_dict) {
        if ('object' !== typeof query_params
            || null === query_params
            ) { // eslint-disable-line indent
            throw new Error('query_params must be an object');
        } else if ('object' !== typeof translate_dict
            || null === translate_dict
            ) { // eslint-disable-line indent
            throw new Error('translate_dict must be an object');
        }
        const translatable_keys = [
            'search_for',
            'per_page',
            'page',
            'sort_by',
            'filter_by',
            ]; // eslint-disable-line indent
        let uri_query = '';
        // TODO: handle sort_by and filter_by fallbacks
        for (let i = 0, n = translatable_keys.length - 1; i <= n; i++) {
            const original_key = translatable_keys[i];
            const { key, value } = translate_dict[original_key]
                ? translate_dict[original_key](query_params[original_key])
                : { key: original_key, value: query_params[original_key] }
                ; // eslint-disable-line indent
            const encoded = encode_uri_query_pair_dict(key, value);
            uri_query += get_uri_query_append(
                0 === i ? '?' : '&',
                encoded.key,
                encoded.value,
                ); // eslint-disable-line indent
        }
        return uri_query;
    }
    function translate_this_query_to_uri_query(field_name_dict) {
        const this_query = this;
        return translate_to_uri_query(this_query, field_name_dict);
    }

    // -----------

    function get_uri_query_append(separator, key, value) {
        return `${ separator }${ key }=${ value }`;
    }

    function encode_uri_query_pair_dict(key, value) {
        return {
            key: encodeURIComponent(key),
            value: encodeURIComponent(value),
            }; // eslint-disable-line indent
    }

    // -----------

    function convert_to_json(query_object) {
        if (query_object instanceof Query) {
            const { search_for, sort_by, filter_by } = query_object;
            const { per_page, page } = query_object;
            return JSON.stringify(
                { search_for, per_page, page, sort_by, filter_by },
                ); // eslint-disable-line indent
        }
        throw new Error('query_object must be an instance of BULLPEN.Query');
    }
    function convert_this_query_to_json() {
        const this_query = this;
        return convert_to_json(this_query);
    }
}());
