// eslint-disable-next-line max-params
(function main(Datasource, Collection) {
    return module.exports = Object.freeze({
        Datasource,
        Collection,
        }); // eslint-disable-line indent
}(
    require('./datasource'),
    require('./bullpen/collection'),
));
