import { env } from '@/env'

export const generalConfig: GeneralConfigType = {

	name: 'Fortuna Dev Bot', // the name of your bot
	description: '', // the description of your bot
	defaultLocale: 'en', // default language of the bot, must be a valid locale
	ownerId: env.BOT_OWNER_ID,
	timezone: 'Europe/Paris', // default TimeZone to well format and localize dates (logs, stats, etc)

	simpleCommandsPrefix: '!', // default prefix for simple command messages (old way to do commands on discord)
	automaticDeferring: true, // enable or not the automatic deferring of the replies of the bot on the command interactions

	// useful links
	links: {
		invite: 'https://discord.com/oauth2/authorize?client_id=1249477671033897122&permissions=8&integration_type=0&scope=bot+applications.commands',
		supportServer: 'https://discord.gg/9WKCFqBAap',
		gitRemoteRepo: 'https://github.com/barthofu/tscord',
	},

	automaticUploadImagesToImgur: false, // enable or not the automatic assets upload

	devs: [], // discord IDs of the devs that are working on the bot (you don't have to put the owner's id here)

	// define the bot activities (phrases under its name). Types can be: PLAYING, LISTENING, WATCHING, STREAMING
	activities: [
		{
			text: 'ReTerra',
			type: 'PLAYING',
		},
		{
			text: 'BillyTee Solve Endless Bugs',
			type: 'WATCHING',
		},
		{
			text: 'JT Write Literal Books',
			type: 'WATCHING',
		},
		{
			text: 'Rowan Create Models',
			type: 'WATCHING',
		},
		{
			text: 'Pilus Create Models',
			type: 'WATCHING',
		},
	],

}

// global colors
export const colorsConfig = {

	primary: '#2F3136',
}
