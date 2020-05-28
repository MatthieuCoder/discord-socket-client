var Bucket = /** @class */ (function () {
    function Bucket(_a) {
        var size = _a.size, interval = _a.interval, reservedTokens = _a.reservedTokens, latency = _a.latency;
        this.lastReset = 0;
        this.lastSend = 0;
        this.tokens = 0;
        this.functionsQueue = [];
        this.interval = interval;
        this.reservedTokens = reservedTokens || 0;
        this.size = size;
        this.latency = latency;
    }
    Bucket.prototype.queue = function (queued) {
        if (queued.priority)
            this.functionsQueue.unshift(queued);
        else
            this.functionsQueue.push(queued);
        this.check();
    };
    Bucket.prototype.check = function () {
        // Do not do anything if an operation is in timeout of if the queue length is equals to 0
        if (this.currentTimeout !== undefined || this.functionsQueue.length === 0)
            return;
        this.currentTimeout = undefined;
        // If we need to add tokens to the bucket.
        if (this.lastReset + this.interval + this.size * this.latency < Date.now()) {
            // Set the last reset for futher use.
            this.lastReset = Date.now();
            // Add the tokens to the bucket.
            this.tokens = Math.max(0, this.tokens - this.size);
        }
        var tokensAvailable = this.tokens < this.size;
        var tokensUnreserved = this.tokens < (this.tokens - this.reservedTokens);
        // While there is tokens.
        while (this.functionsQueue.length > 0 && (tokensUnreserved || (tokensAvailable && this.functionsQueue[0].priority))) {
            // Add a token to the bucket.
            this.tokens++;
            var currentItem = this.functionsQueue.shift();
            // Calculate the time we need to wait
            var value = this.latency - Date.now() + this.lastSend;
            // If we schedule the task right now.
            if (this.latency === 0 || value < 0) {
                currentItem.function_();
                this.lastSend = Date.now();
            }
            else {
                setTimeout(currentItem.function_, value);
                this.lastSend = Date.now() + value;
            }
        }
        // If there is tasks remaining
        if (this.functionsQueue.length > 0 && !this.currentTimeout) {
            var timeToWaitBeforeExecute = this.tokens < this.size
                ? this.latency // If there is enough tokens.
                : Math.max(0, this.lastReset + this.interval + this.size * this.latency - Date.now());
            this.currentTimeout = setTimeout(this.check, timeToWaitBeforeExecute);
        }
    };
    return Bucket;
}());
module.exports = Bucket;
