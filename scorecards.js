const { EmbedBuilder } = require('discord.js');

// Base scorecard with common functionality
class BaseScorecard {
    constructor(match) {
        this.match = match;
    }

    createCommonFields(embed) {
        const currentInnings = this.match.currentInnings;
        const score = this.match.score[`innings${currentInnings}`];
        
        embed.addFields(
            { name: '📊 Score', value: `${score.runs}/${score.wickets}`, inline: true },
            { name: '⏱️ Overs', value: `${score.overs}.${score.balls}`, inline: true }
        );

        if (currentInnings === 2) {
            const target = this.match.target;
            const remainingRuns = target - score.runs;
            const remainingBalls = (this.match.maxOvers * 6) - (score.overs * 6 + score.balls);
            const reqRate = ((remainingRuns / remainingBalls) * 6).toFixed(2);
            
            embed.addFields(
                { name: '🎯 Target', value: target.toString(), inline: true },
                { name: '📈 Required Rate', value: `${reqRate}/over`, inline: true },
                { name: '🎯 Equation', value: `Need ${remainingRuns} from ${remainingBalls} balls`, inline: false }
            );
        }

        return embed;
    }

    getBattingStats() {
        return Object.entries(this.match.battingStats)
            .map(([name, stats]) => {
                const strikeRate = ((stats.runs / stats.balls) * 100).toFixed(1);
                return `${name}${this.match.currentBatsmen.striker === name ? '*' : ''}: ${stats.runs}(${stats.balls}) SR: ${strikeRate}`;
            })
            .join('\n');
    }

    getBowlingStats() {
        return Object.entries(this.match.bowlingStats)
            .map(([name, stats]) => {
                const economy = ((stats.runs / stats.overs) || 0).toFixed(1);
                return `${name}: ${stats.overs}-${stats.wickets}-${stats.runs} (${economy})`;
            })
            .join('\n');
    }

    getPartnershipInfo() {
        const striker = this.match.currentBatsmen.striker;
        const nonStriker = this.match.currentBatsmen.nonStriker;
        const strikerStats = this.match.battingStats[striker] || { runs: 0, balls: 0 };
        const nonStrikerStats = this.match.battingStats[nonStriker] || { runs: 0, balls: 0 };
        
        return `${striker}* ${strikerStats.runs}(${strikerStats.balls}) & ${nonStriker} ${nonStrikerStats.runs}(${nonStrikerStats.balls})`;
    }
}

// IPL Style Scorecard
class IPLScorecard extends BaseScorecard {
    generate() {
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🏏 IPL Match')
            .setTimestamp();

        embed.addFields(
            { name: '🏏 Teams', value: `${this.match.team1.name} vs ${this.match.team2.name}`, inline: false }
        );

        this.createCommonFields(embed);

        // IPL-specific graphics and styling
        embed.addFields(
            { name: '💫 Current Partnership', value: this.getPartnershipInfo(), inline: false },
            { name: '🎯 Last 6 balls', value: this.match.history.slice(-6).map(ball => {
                if (ball === 'W') return '⚫';
                if (ball === '6') return '🟣';
                if (ball === '4') return '🔵';
                return ball === '0' ? '⚪' : '🟡';
            }).join(' '), inline: false }
        );

        if (this.match.currentBowler) {
            const bowlerStats = this.match.bowlingStats[this.match.currentBowler];
            embed.addFields({
                name: '⚾ Current Bowler',
                value: `${this.match.currentBowler}: ${bowlerStats.overs}-${bowlerStats.wickets}-${bowlerStats.runs}`,
                inline: false
            });
        }

        return embed;
    }
}

// PSL Style Scorecard
class PSLScorecard extends BaseScorecard {
    generate() {
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🏏 PSL Match')
            .setTimestamp();

        embed.addFields(
            { name: '🏏 Match', value: `${this.match.team1.name} vs ${this.match.team2.name}`, inline: false }
        );

        this.createCommonFields(embed);

        // PSL-specific graphics and styling
        const currentOver = this.match.history.slice(-6).join(' ');
        embed.addFields(
            { name: '📊 Current Over', value: currentOver || 'New Over', inline: false },
            { name: '🏏 Batting', value: this.getBattingStats(), inline: true },
            { name: '⚾ Bowling', value: this.getBowlingStats(), inline: true }
        );

        return embed;
    }
}

// BPL Style Scorecard
class BPLScorecard extends BaseScorecard {
    generate() {
        const embed = new EmbedBuilder()
            .setColor('#00aa00')
            .setTitle('🏏 BPL Match')
            .setTimestamp();

        embed.addFields(
            { name: '🏏 Match', value: `${this.match.team1.name} vs ${this.match.team2.name}`, inline: false }
        );

        this.createCommonFields(embed);

        // BPL-specific styling
        const partnerships = this.getPartnershipInfo();
        embed.addFields(
            { name: '🤝 Partnership', value: partnerships, inline: false },
            { name: '📊 Batting Stats', value: this.getBattingStats(), inline: true },
            { name: '⚾ Bowling Stats', value: this.getBowlingStats(), inline: true }
        );

        return embed;
    }
}

// LPL Style Scorecard
class LPLScorecard extends BaseScorecard {
    generate() {
        const embed = new EmbedBuilder()
            .setColor('#ff6600')
            .setTitle('🏏 LPL Match')
            .setTimestamp();

        embed.addFields(
            { name: '🏏 Teams', value: `${this.match.team1.name} vs ${this.match.team2.name}`, inline: false }
        );

        this.createCommonFields(embed);

        // LPL-specific styling
        const currentOver = this.match.history.slice(-6)
            .map(ball => {
                if (ball === 'W') return '⚫';
                if (ball === '6') return '🟣';
                if (ball === '4') return '🔵';
                return ball === '0' ? '⚪' : '🟡';
            }).join(' ');

        embed.addFields(
            { name: '📈 Current Over', value: currentOver || 'New Over', inline: false },
            { name: '🏏 Current Partnership', value: this.getPartnershipInfo(), inline: false }
        );

        return embed;
    }
}

// BBL Style Scorecard
class BBLScorecard extends BaseScorecard {
    generate() {
        const embed = new EmbedBuilder()
            .setColor('#ffd700')
            .setTitle('🏏 BBL Match')
            .setTimestamp();

        this.createCommonFields(embed);

        // BBL-specific graphics and styling
        const powerplayInfo = this.match.overs <= 4 ? 
            `Powerplay: ${this.match.score}/${this.match.wickets}` : 'Powerplay Complete';

        embed.addFields(
            { name: '⚡ Power Surge', value: powerplayInfo, inline: true },
            { name: '🎯 Recent Balls', value: this.match.history.slice(-8).map(ball => {
                if (ball === 'W') return '⚫';
                if (ball === '6') return '🟣';
                if (ball === '4') return '🔵';
                return ball === '0' ? '⚪' : '🟡';
            }).join(' '), inline: false }
        );

        return embed;
    }
}

// International T20 Style Scorecard
class T20WorldCupScorecard extends BaseScorecard {
    generate() {
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('🌏 T20 World Cup Match')
            .setTimestamp();

        this.createCommonFields(embed);

        // T20 WC specific styling
        const powerplayScore = this.match.overs <= 6 ? 
            `Powerplay: ${this.match.score}/${this.match.wickets}` : 'Powerplay Complete';
        
        embed.addFields(
            { name: '💥 Powerplay', value: powerplayScore, inline: false },
            { name: '🎯 This Over', value: this.match.history.slice(-6).join(' ') || 'New Over', inline: false },
            { name: '🏏 At Crease', value: this.getPartnershipInfo(), inline: false }
        );

        return embed;
    }
}

// ODI World Cup Style Scorecard
class ODIWorldCupScorecard extends BaseScorecard {
    generate() {
        const embed = new EmbedBuilder()
            .setColor('#0000ff')
            .setTitle('🌏 ODI World Cup Match')
            .setTimestamp();

        this.createCommonFields(embed);

        // ODI specific fields
        const currentPhase = this.match.overs <= 10 ? 'Powerplay' :
            this.match.overs <= 40 ? 'Middle Overs' : 'Death Overs';

        embed.addFields(
            { name: '📈 Match Phase', value: currentPhase, inline: true },
            { name: '💫 Partnership', value: this.getPartnershipInfo(), inline: false },
            { name: '📊 Batting', value: this.getBattingStats(), inline: false },
            { name: '⚾ Bowling', value: this.getBowlingStats(), inline: false }
        );

        return embed;
    }
}

// Factory to create appropriate scorecard based on league/tournament
function createScorecard(match) {
    switch (match.league?.toLowerCase()) {
        case 'ipl':
            return new IPLScorecard(match);
        case 'psl':
            return new PSLScorecard(match);
        case 'bpl':
            return new BPLScorecard(match);
        case 'lpl':
            return new LPLScorecard(match);
        case 'bbl':
            return new BBLScorecard(match);
        case 't20':
            return new T20WorldCupScorecard(match);
        case 'odi':
            return new ODIWorldCupScorecard(match);
        default:
            return new BaseScorecard(match);
    }
}

module.exports = {
    createScorecard,
    BaseScorecard,
    IPLScorecard,
    PSLScorecard,
    BPLScorecard,
    LPLScorecard,
    BBLScorecard,
    T20WorldCupScorecard,
    ODIWorldCupScorecard
};