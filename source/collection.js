// eslint-disable-next-line max-params
(function main(UTIL, Bullpen) {
    Collection.prototype = new Bullpen;
    return module.exports = Collection;

    // -----------

    function Collection(raw_params) {
        const this_collection = this;
        const { accessors, queryor, mutators } = validate_params(raw_params);

        const { get_accessor, get_mutator, get_queryor } = UTIL;
        /* eslint-disable indent */
        this_collection.get
            = get_accessor(get_from_collection, accessors)
            ;
        this_collection.stream
            = get_accessor(stream_from_collection, accessors)
            ;
        this_collection.mutate
            = get_mutator(mutate_collection, mutators)
            ;
        this_collection.query
            = get_queryor(query_collection, queryor)
            ;
        this_collection.stream_query
            = get_queryor(stream_collection_query, queryor)
            ;
        /* eslint-enable indent */
        return this_collection;
    }
    function validate_params(raw_params) {
        return raw_params;
    }

    /// ## Collection.get(item_or_composition_name, params)
    /// Get a fully dereferenced item or composition from the collection.
    /// <br/>
    /// This is useful when getting live updates is not desireable, often in
    /// writeable contexts (e.g. saving a form) and frequently updating
    /// read-only contexts (e.g. Twitter feed).
    /// <br/>
    /// e.g.
    /// Two users are editing the same form at the same time. To prevent the
    /// first user to save their form from replacig the form contents for the
    /// other user (causing them to lose their work), the contents of the form
    /// should be retrieved use `get()`, instead of `stream()`.
    function get_from_collection(accessor, key, raw_params) {
        return UTIL.dereference(accessor(key, raw_params));
    }
    function stream_from_collection(accessor, key, raw_params) {
        return Bullpen.stream(accessor(key, raw_params));
    }

    // eslint-disable-next-line max-params
    function mutate_collection(mutator, key, raw_params, then) {
        mutator(key, raw_params, then);
        return true;
    }

    function query_collection(queryor, raw_params) {
        return UTIL.dereference(queryor(raw_params));
    }
    function stream_collection_query(queryor, raw_params) {
        return Bullpen.stream(queryor(raw_params));
    }
}(
    require('./util'),
    require('./bullpen'),
));
