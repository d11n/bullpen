// eslint-disable-next-line max-params
(function main(Collection, View, Query) {
    return module.exports = Object.freeze({
        Collection,
        View,
        Query,
        }); // eslint-disable-line indent
}(
    require('./collection'),
    require('./view'),
    require('./query'),
));
