import { hostname } from 'os'
import GatewayConfig from './config/index'
import DiscordSocket, { DiscordSocketState } from './websocket/DiscordSocket'
import ICacheProvider from './websocket/cache/ICacheProvider'

let r = new DiscordSocket(Object.assign({
    stateUpdateInterval: 5000,
    token: 'NDkxNjczNDgwMDA2MjA1NDYx.XnR99g.QfYc8iqTTQGHWsIEmePXQgEanmE'
} as GatewayConfig, GatewayConfig.prototype), new DiscordSocketState)

r.start()