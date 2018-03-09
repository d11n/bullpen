// eslint-disable-next-line max-params
(function main() {
    Result.has_id = has_id;
    Object.assign(Result.prototype, { has_id: instance_has_id });
    return module.exports = Result;

    // -----------

    function Result(raw_params) {
        const this_batch = this;
        Object.assign(this_batch, validate_constructor_params(raw_params));
        return this_batch;
    }

    function validate_constructor_params(raw_params) {
        const params = {};
        !raw_params.name && throw_error('name is required');
        'string' !== typeof raw_params.name
            && throw_error('name must be a string')
            ; // eslint-disable-line indent
        params.name = raw_params.name;

        !raw_params.items && throw_error('items is required');
        !Array.isArray(raw_params.items)
            && throw_error('items must be an array')
            ; // eslint-disable-line indent
        params.items = raw_params.items;

        !raw_params.ids && throw_error('ids is required');
        !Array.isArray(raw_params.ids)
            && throw_error('ids must be an array')
            ; // eslint-disable-line indent
        params.ids = raw_params.ids;

        !raw_params.refresh_url && throw_error('refresh_url is required');
        'string' !== typeof raw_params.refresh_url
            && throw_error('refresh_url must be a string')
            ; // eslint-disable-line indent
        params.refresh_url = raw_params.refresh_url;

        raw_params.pagination && (params.pagination = raw_params.pagination);
        return params;
    }

    function has_id(batch, id) {
        return batch.ids.includes(id);
    }
    function instance_has_id(id) {
        return has_id(this, id);
    }

    // -----------

    function throw_error(message) {
        throw new Error(`BULLPEN.Collection.Query.Result: ${ message }`);
    }
}());
