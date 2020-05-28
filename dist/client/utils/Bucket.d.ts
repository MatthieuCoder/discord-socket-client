/**
 * From Eris https://github.com/abalabahaha/eris/blob/master/lib/util/Bucket.js
 */
declare type QueuedFunction = {
    function_: Function;
    priority: boolean;
};
declare class Bucket {
    private lastReset;
    private lastSend;
    private tokens;
    private latency;
    private currentTimeout;
    private readonly interval;
    private readonly size;
    private readonly functionsQueue;
    private readonly reservedTokens;
    constructor({ size, interval, reservedTokens, latency }: {
        size: number;
        interval: number;
        reservedTokens?: number;
        latency?: number;
        storageInterface: object;
    });
    queue(queued: QueuedFunction): void;
    check(): void;
}
