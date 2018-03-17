// eslint-disable-next-line max-params
(function main() {
    class Thin_promise {
        constructor(...args) {
            return construct_thin_promise.call(this, ...args);
        }
    }
    return module.exports = Object.freeze(Thin_promise);

    // -----------

    function construct_thin_promise() {
        let next_args;
        this.do = set_next_args;
        this.then = set_next_func;
        return this;

        // -----------

        function set_next_func(next_func) {
            if ('function' !== typeof next_func) {
                throw new TypeError('then() must be passed a single function');
            } else if (do_next_func === this.do) {
                throw new Error('then() is already set on this "thin" promise');
            }
            this.do = set_next_args === this.do && next_args
                ? next_func(...next_args)
                : do_next_func
                ; // eslint-disable-line indent
            return this;

            // -----------

            function do_next_func(...args) {
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
