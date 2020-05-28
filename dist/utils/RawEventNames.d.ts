import DynamicObject from "./DynamicObject";
export declare const conversionTable: DynamicObject<string>;
export declare type EventName = 'webhooksUpdate' | 'voiceServerUpdate' | 'voiceStateUpdate' | 'userUpdate' | 'typingStart' | 'presenceUpdate' | 'messageReactionRemoveEmoji' | 'messageReactionRemoveAll' | 'messageReactionRemove' | 'messageReactionAdd' | 'messageDeleteBulk' | 'messageDelete' | 'messageUpdate' | 'messageCreate' | 'inviteDelete' | 'inviteCreate' | 'guildRoleDelete' | 'guildRoleUpdate' | 'guildRoleCreate' | 'guildMembersChunk' | 'guildMemberUpdate' | 'guildMemberRemove' | 'guildMemberAdd' | 'guildIntegrationsUpdate' | 'guildEmojisUpdate' | 'guildBanRemove' | 'guildBanAdd' | 'guildDelete' | 'guildUpdate' | 'guildCreate' | 'channelPinsUpdate' | 'channelDelete' | 'channelUpdate' | 'channelCreate' | 'invalidSession' | 'reconnect' | 'resumed' | 'ready' | 'hello';
export default conversionTable;
export declare function toFriendlyName(rawName: string): string;
