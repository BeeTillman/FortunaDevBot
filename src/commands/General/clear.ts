import { Category } from '@discordx/utilities';
import { CommandInteraction, User, ApplicationCommandOptionType, TextChannel } from 'discord.js';
import { Discord, Slash, SlashOption } from '@/decorators';

@Discord()
@Category('General')
export default class ClearCommand {
    @Slash('clear')
    async clear(
        @SlashOption({ name: 'message_count', type: ApplicationCommandOptionType.Integer, description: 'Number of messages to clear', required: true }) messageCount: number,
        @SlashOption({ name: 'author', type: ApplicationCommandOptionType.User, description: 'Author of the messages to clear', required: false }) author: User,
        interaction: CommandInteraction
    ) {
        const channel = interaction.channel;
        if (!channel || !('messages' in channel)) {
            return interaction.reply('This command can only be used in a text channel.');
        }

        // Fetch the messages in the channel
        const messages = await (channel as TextChannel).messages.fetch({ limit: messageCount });

        // Filter the messages by the author if provided
        const messagesToClear = author ? messages.filter(message => message.author.id === author.id) : messages;

        // Delete the messages
        for (const message of messagesToClear.values()) {
            await message.delete();
        }
    }
}