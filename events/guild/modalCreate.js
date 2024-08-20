const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const { api_url, embedColor } = require('../../config.json');

module.exports = {
    async execute(interaction) {
        if (interaction.customId === 'playerModal') {
            const playerId = interaction.fields.getTextInputValue('playerid');
            await interaction.deferReply({ ephemeral: true });

            try {
                const response = await axios.get(`${api_url}/api/v1/players/${playerId}`);
                const playerData = response.data;

                if (playerData.status === 'OK' && playerData.data) {
                    const { info, team, results, pastTeams, socials } = playerData.data;

                    const matchResults = results.map(result => {
                        const teamsDescription = result.teams.map(team => `**${team.name}** (${team.tag}): ${team.points}`).join('\n');
                        return `Match: [${result.event.name}](${result.match.url})\n${teamsDescription}`;
                    }).join('\n\n');

                    const embed = new EmbedBuilder()
                        .setTitle(info.name)
                        .setURL(info.url)
                        .setThumbnail(info.img)
                        .setColor(embedColor)
                        .addFields(
                            { name: 'User', value: info.user, inline: true },
                            { name: 'Country', value: info.country, inline: true },
                            { name: 'Current Team', value: team ? `[${team.name}](${team.url})\n${team.joined}` : 'N/A', inline: false },
                            { name: 'Past Teams', value: pastTeams.length > 0 ? pastTeams.map(t => `[${t.name}](${t.url}) - ${t.info}`).join('\n') : 'N/A', inline: false },
                            { name: 'Socials', value: socials.twitter ? `[Twitter](${socials.twitter_url})\n[Twitch](${socials.twitch_url})` : 'N/A', inline: false }
                        )
                        .setDescription(matchResults)
                        .setTimestamp();

                    await interaction.editReply({ embeds: [embed] });
                } else {
                    await interaction.editReply({ content: 'No player data found or invalid player ID.', ephemeral: true });
                }
            } catch (error) {
                console.error('Error fetching player data:', error);
                await interaction.editReply({ content: 'There was an error fetching player information.', ephemeral: true });
            }
        } else if (interaction.customId === 'teamModal') {
        }
    },
};
