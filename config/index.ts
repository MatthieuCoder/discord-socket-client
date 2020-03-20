export default class GatewayConfig {

    // General gateway config
    public shard: number
    public shards: number
    public name: number
    public indents: number
    public token: string

    // Client settings
    public stateUpdateInterval: number

    // Nats for dispatching events across the workers
    public natsHost?: string
    public natsPassword?: string
    public natsUser?: string
    public natsPort?: number
    // Shared cache across all the workers
    public redisHost: string
    public redisPassword: string
    public redisUser: string
    public redisPort: string
    public reconnect: any

    /**
     * natsUrl - Gets the nats url from the configuration.
     */
    public natsUrl() {
        if(this.natsHost) {
            return `nats://${this.natsUser && this.natsPassword ? `${this.natsUser}:${this.natsPassword}@` : ''}${this.natsHost}`
        }
        return null
    }
    /**
     * redisUrl - Gets the redis url from the configuration.
     */
    public redisUrl() {
        return `redis://${this.redisUser && this.redisPassword ? `${this.redisUser}:${this.redisPassword}@` : ''}${this.redisHost}`
    }
    /**
     * getDiscordGatewayUrl - Gets the gateway uri to connect to the discord's realtime gateway.
     */
    public getDiscordGatewayUrl() {
        return `wss://gateway.discord.gg/?v=6&encoding=etf&compress=zlib-stream`
    }
}