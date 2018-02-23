// eslint-disable-next-line max-params
(function main(Datasource, Collection, View, Query) {
    return module.exports = Object.freeze({
        Datasource,
        Collection,
        View,
        Query,
        }); // eslint-disable-line indent
}(
    require('./datasource'),
    require('./collection'),
    require('./view'),
    require('./query'),
));
