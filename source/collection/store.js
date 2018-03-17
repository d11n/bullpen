// eslint-disable-next-line max-params
(function main() {
    class Store {
        constructor(...args) {
            return construct_store.call(this, ...args);
        }
    }
    return module.exports = Object.freeze(Store);

    // -----------

    function construct_store(params) {
        const this_result = this;
        const { store_creator, operations, default_operation } = params;
        const op_tree = { ...operations };
        const store_struct = {
            is_item_list_fully_hydrated: false,
            item_list: [],
            query_result_dict: {},
            }; // eslint-disable-line indent
        const store = Object.seal(
            store_creator ? store_creator(store_struct) : store_struct,
            ); // eslint-disable-line indent
        return this_result;
    }

    // -----------

    function throw_error(message) {
        throw new Error(`BULLPEN.Collection.Store: ${ message }`);
    }
}());
