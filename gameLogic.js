const { GAME_STATES } = require('../config/constants');

const gameState = {
    createNewGame(playerId, team) {
        return {
            state: GAME_STATES.BATTING,
            currentPlayer: playerId,
            score: 0,
            wickets: 0,
            overs: 0,
            balls: 0,
            target: Math.floor(Math.random() * 50) + 50, // Random target between 50-100
            history: [],
            currentBatsmen: {
                striker: team.players[0].name,
                nonStriker: team.players[1].name
            },
            currentBowler: null,
            battingStats: {},
            bowlingStats: {},
            lastOverRuns: 0,
            availablePlayers: team.players.slice(2), // Players yet to bat
            team: team
        };
    },

    processBat(game) {
        const runs = Math.floor(Math.random() * 7); // 0-6 runs
        const isWicket = Math.random() < 0.2; // 20% chance of wicket

        if (isWicket) {
            game.wickets++;
            game.history.push('W');
            if (game.wickets >= 10) {
                game.state = GAME_STATES.COMPLETED;
            }
        } else {
            game.score += runs;
            game.history.push(runs);

            // Update batting stats
            const striker = game.currentBatsmen.striker;
            if (!game.battingStats[striker]) {
                game.battingStats[striker] = { runs: 0, balls: 0, fours: 0, sixes: 0 };
            }
            game.battingStats[striker].runs += runs;
            game.battingStats[striker].balls++;
            if (runs === 4) game.battingStats[striker].fours++;
            if (runs === 6) game.battingStats[striker].sixes++;

            // Rotate strike for odd runs
            if (runs % 2 === 1) {
                [game.currentBatsmen.striker, game.currentBatsmen.nonStriker] = 
                [game.currentBatsmen.nonStriker, game.currentBatsmen.striker];
            }
        }

        // Update bowling stats
        if (game.currentBowler) {
            if (!game.bowlingStats[game.currentBowler]) {
                game.bowlingStats[game.currentBowler] = { overs: 0, balls: 0, runs: 0, wickets: 0 };
            }
            game.bowlingStats[game.currentBowler].balls++;
            game.bowlingStats[game.currentBowler].runs += runs;
            if (isWicket) game.bowlingStats[game.currentBowler].wickets++;
        }

        game.balls++;
        game.lastOverRuns += runs;

        if (game.balls >= 6) {
            if (game.currentBowler) {
                game.bowlingStats[game.currentBowler].overs++;
            }
            game.overs++;
            game.balls = 0;
            game.lastOverRuns = 0;
            // Rotate strike at end of over
            [game.currentBatsmen.striker, game.currentBatsmen.nonStriker] = 
            [game.currentBatsmen.nonStriker, game.currentBatsmen.striker];
        }

        if (game.score >= game.target) {
            game.state = GAME_STATES.COMPLETED;
        }

        return { runs, isWicket };
    },

    processBowl(game) {
        const runs = Math.floor(Math.random() * 7);
        const isWicket = Math.random() < 0.15;

        if (isWicket) {
            game.wickets++;
            game.history.push('W');
            if (game.wickets >= 10) {
                game.state = GAME_STATES.COMPLETED;
            }
        } else {
            game.score += runs;
            game.history.push(runs);
        }

        game.balls++;
        if (game.balls >= 6) {
            game.overs++;
            game.balls = 0;
            // Reset current bowler after over
            game.currentBowler = null;
        }

        return { runs, isWicket };
    },

    getAvailableBowlers(game) {
        return game.team.players.filter(player => 
            (player.role === 'Bowler' || player.role === 'All-Rounder') &&
            (!game.currentBowler || player.name !== game.currentBowler)
        );
    }
};

module.exports = { gameState };