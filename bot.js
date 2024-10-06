const { Telegraf } = require('telegraf')
const fs = require('fs')
const { message } = require('telegraf/filters')
require('dotenv').config()

const {BOT_TOKEN} = process.env
const ADMIN_ID = +process.env.ADMIN_ID

const bot = new Telegraf(BOT_TOKEN)

const wishlist = JSON.parse(fs.readFileSync('wishlist.json', 'utf8'))

/*
if(ctx.from.id !== ADMIN_ID) {
    ctx.replay('You can not do it)
    return
}
*/

bot.start((ctx) => ctx.reply('Привіт, чувак!'))

bot.command('wishlist', ctx => {
    const gifts = wishlist.map((gift, index) => 
        `${index + 1}. ${gift.title} was bought by ${gift.boughtBy ? gift.boughtBy : 'no one'}`
    )
    ctx.reply(`Wishlist:\n${gifts.join(',\n')}`)
})

bot.command('add', ctx => {
    const giftTitle = ctx.message.text.replace('/add', '')
    if(giftTitle.trim()){
        const gift = {title: giftTitle, boughtBy: null}
        wishlist.push(gift)
        fs.writeFileSync('wishlist.json', JSON.stringify(wishlist, null, 2), 'utf8')
        ctx.reply(`${giftTitle.trim()} was added successfully`)
    }else{
        ctx.reply('Error. Nothing was added')
    }
   
})

bot.command('delete', ctx => {
    const giftIndex = ctx.message.text.replace('/delete', '').trim()

    if(giftIndex > 0 && giftIndex <= wishlist.length) {
        const [deletedGift] = wishlist.splice(giftIndex - 1, 1)
        fs.writeFileSync('wishlist.json', JSON.stringify(wishlist, null, 2), 'utf8')
        ctx.reply(`${deletedGift.title} was deleted`)
    }else{
        ctx.reply('Wrong data was passed')
    }
})

bot.command('buy', ctx => {
    const giftIndex = ctx.message.text.replace('/buy', '').trim()
    const user = ctx.from.first_name ? ctx.from.first_name : ctx.from.username
    
    if(giftIndex > 0 && giftIndex <= wishlist.length) {
        wishlist[giftIndex - 1].boughtBy = user
        fs.writeFileSync('wishlist.json', JSON.stringify(wishlist, null, 2), 'utf8')
        ctx.reply(`${user} bought for you ${wishlist[giftIndex - 1].title}`)
    }else{
        ctx.reply('Wrong data was passed')
    }

})

//bot.command('get_id', ctx => ctx.reply(ctx.from.id ))


bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))