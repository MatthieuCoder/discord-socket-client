/**
 * @author MatthieuCoder
 * @description A simple package for receiving events from the discord gateway.
 * @version 1.0
 **/
import FlagManager from './utils/Flags'
import Client  from './Client'

export default {
    version: '',
    commit:  '',
    FlagManager,
    Client
}

new Client({
    token: 'NzEzMDM4MTk4MzEzNTgyNjIz.XsutIg.h66Y4IRYqiwhCArAE1KV_hoWYk0',
})
    .on('messageCreate', (message) => {
        console.log(`${message.author.username}: ${message.content}`)
    })
    .start()