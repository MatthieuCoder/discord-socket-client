'use strict';

export type SendOptions = {
    /**
     * The username to set to the webhook
     */
    username: string;

    /**
     * The URL of the avatar to set to the webhook
     */
    avatarURL: string;

    /**
     * The message to send if any
     */
    content: string;

    /**
     * Array of object embeds to send if any
     */
    embeds: Array<object>;
}

export type Embed = {
    color?: number | string;
    title?: string;
    author?: EmbedAuthor;
    url?: string;
    description?: string;
    thumbnail?: EmbedThumbnail;
    image?: EmbedImage;
    files?: string[];
    fields?: EmbedField[];
    timestamp?: number;
    footer?: EmbedFooter;
}

export type EmbedAuthor = {
    name?: string;
    icon_url?: string;
    url?: string;
}

export type EmbedThumbnail = {
    url?: string;
}

export type EmbedImage = {
    url?: string;
}

export type EmbedField = {
    name: string;
    value: string;
    inline?: boolean;
}

export type EmbedFooter = {
    text: string;
    icon_url?: string;
}