// eslint-disable-next-line max-params
(function main() {
    class Bullpen {
        constructor(...args) {
            return this;
        }
    }
    Object.assign(Bullpen.prototype, {
        // Abstract methods
        get: () => throw_error('children of Bullpen must define get()'),
        stream: () => throw_error('children of Bullpen must define stream()'),
        mutate: () => throw_error('children of Bullpen must define mutate()'),
    });
    return module.exports = Object.freeze(Bullpen);

    // -----------

    function throw_error(message) {
        throw new Error(`BULLPEN.Bullpen: ${ message }`);
    }
}());
