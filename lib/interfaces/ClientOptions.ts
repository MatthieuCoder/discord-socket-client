import AbstractCacheProvider from "./AbstractCacheProvider";

export type ClientOptions = {
    guild_subscriptions?: boolean;
    sharding?: { thisShard: number; totalShards: number };
    token: string,
    indents?: number,
}

export default ClientOptions;