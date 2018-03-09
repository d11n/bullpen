// eslint-disable-next-line max-params
(function main() {
    return module.exports = Thin_promise;

    // -----------

    function Thin_promise() {
        let next_args;
        this.do = set_next_args;
        this.then = set_next_func;
        return this;

        // -----------

        function set_next_func(next_func) {
            if ('function' !== typeof next_func) {
                throw new TypeError('then() must be passed a single function');
            }
            this.do = set_next_args === this.do && next_args
                ? next_func(...next_args)
                : recurse_next_func
                ; // eslint-disable-line indent
            return this;

            // -----------

            function recurse_next_func(...args) {
                this.do = next_func(...args);
                return this;
            }
        }

        function set_next_args(...args) {
            next_args = args;
            return this;
        }
    }
}());
