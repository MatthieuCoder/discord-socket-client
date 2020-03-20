import { hostname } from 'os'
import GatewayConfig from './config/index'
import DiscordSocket, { DiscordSocketState } from './websocket/DiscordSocket'
import conf from './config'

let r = new DiscordSocket(Object.assign({
    stateUpdateInterval: 5000,
    token: conf.token
} as GatewayConfig, GatewayConfig.prototype), new DiscordSocketState)

r.start()