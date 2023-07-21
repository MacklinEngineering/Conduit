export const cache = {
    cache: {},
    get: function (key) { return this.cache[key]; },
    set: function (key, val) { this.cache[key] = val; },
    dumpCache: function () { return this.cache } // this just for testing purpose
}