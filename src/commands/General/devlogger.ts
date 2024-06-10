// Import necessary modules and classes
import { Category } from '@discordx/utilities'
import { CommandInteraction, EmbedBuilder, Client, TextChannel, User, ApplicationCommandOptionType } from 'discord.js'
import { Discord, Slash, SlashOption } from '@/decorators'
import { Pagination, PaginationType } from '@discordx/pagination'

// Function to split an array into chunks
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
	const results = [];
	while (array.length) {
		results.push(array.splice(0, chunkSize));
	}
	return results;
}

// Define the Discord command class
@Discord()
@Category('General')
export default class DevLoggerCommand {

	// Define the slash command
	@Slash('devlogger')
	async devLogger(
		// Define the command options
		@SlashOption({name: 'days', type: ApplicationCommandOptionType.Integer, description: 'Number of days to look back', required: false }) days: number,
		@SlashOption({name: 'user', type: ApplicationCommandOptionType.User, description: 'User to filter by', required: false }) user: User,
		@SlashOption({name: 'task', type: ApplicationCommandOptionType.String, description: 'Task to filter by', required: false }) task: string,
		@SlashOption({name: 'require_task', type: ApplicationCommandOptionType.Boolean, description: 'Only show messages with tasks', required: false }) requireTask: boolean,
		@SlashOption({name: 'show_content', type: ApplicationCommandOptionType.Boolean, description: 'Show or hide message content', required: false }) showContent: boolean,
		interaction: CommandInteraction,
		client: Client
	) {
		// Check if the command is used in a server
		const guild = interaction.guild;
		if (!guild) {
			return interaction.reply('This command can only be used in a server.');
		}

		// Check if the number of days is not negative
		if (days < 0) {
			return interaction.reply('The number of days cannot be negative.');
		}

		// Get all the log channels in the server
		const logChannels = guild.channels.cache.filter(channel => (channel as TextChannel).name.startsWith('logs-'));
		let messagesInfo = [];
		let userFound = false;
		try {
			// Loop through each log channel
			for (const logChannel of logChannels.values()) {
				// Fetch the messages in the log channel
				const messages = await (logChannel as TextChannel).messages.fetch({ limit: 100 });
				// Loop through each message
				for (const message of messages.values()) {
					// Check if the user is found
					if (user && message.author.id === user.id) {
						userFound = true;
					}
					// Check if the message content is not empty and if it meets the days and user requirements
					if (message.content != '' && (!days || message.createdTimestamp > Date.now() - days * 24 * 60 * 60 * 1000) && (!user || message.author.id === user.id)) {
						// Extract the task name from the message content
						const match = message.content.match(/TK-\S+/);
						const taskName = match && match[0] ? match[0].replace(',', '') : 'No task mentioned';
						// Check if the task name meets the task requirements
						if (task && task !== 'None' && taskName !== task) {
							continue;
						}
						if (task === 'None' && taskName !== 'No task mentioned') {
							continue;
						}
						if (requireTask && taskName === 'No task mentioned') {
							continue;
						}
						// Get the date and time of the message
						const date = message.createdAt.toLocaleDateString();
						const time = message.createdAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }); // format time with AM/PM
						// Get the message content and limit it to 200 characters
						const content = message.content.length > 200 ? `${message.content.substring(0, 200)}...` : message.content;
						// Get the link to the message
						const messageLink = `https://discord.com/channels/${guild.id}/${logChannel.id}/${message.id}`;
						// Push the message info to the messagesInfo array
						messagesInfo.push({
							user: message.author.username.toUpperCase(),
							date: `${date}`,
							time: `${time}`,
							task: taskName,
							content: content,
							link: messageLink,
							channel: logChannel.name
						});
					}
				}
			}
		} catch (error) {
			// Handle any errors that occur while fetching messages
			return interaction.reply('An error occurred while fetching messages. Please try again later.');
		}

		// Check if the specified user has not sent any messages to the logs channels
		if (user && !userFound) {
			return interaction.reply('The specified user has not sent any messages to the logs channels.');
		}

		// Determine the limit of entries based on the showContent option
		const entriesLimit = showContent ? 5 : 10;
		// Split the messagesInfo array into pages
		const pages = chunkArray(messagesInfo, entriesLimit);
		// Create the embeds for each page
		const embeds = pages.map((page, pageIndex) => {
			const embed = new EmbedBuilder()
				// Set the author of the embed
				.setAuthor({
					name: client.user ? client.user.username : 'Bot',
					iconURL: client.user ? client.user.displayAvatarURL({ forceStatic: false }) : 'https://example.com/default-avatar.png',
				})
				// Set the title of the embed
				.setTitle('Developer Log Tracker')
				// Set the color of the embed
				.setColor('#3fffd0')
				// Set the footer of the embed
				.setFooter({ text: `DevLogger - Page: ${pageIndex + 1}` });
			// Add fields to the embed for each message info
			page.forEach(info => {
				const contentField = showContent ? `\n**Content:**\n${info.content}` : '';
				embed.addFields({ name: `**${info.user}**     (${info.link})     _[${info.date} | ${info.time}]_`, value: `**Task:** ${info.task}${contentField}` });
			});
			return embed;
		});
		// Create the pagination for the embeds
		const pagination = new Pagination(interaction, embeds.map(embed => ({ embeds: [embed] })), { type: PaginationType.Button });
		// Send the pagination
		await pagination.send();
	}

}