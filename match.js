const { Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { GAME_STATES, SCORECARD_STYLES } = require('../config/constants');
const crypto = require('crypto');

const activeMatches = new Collection();
const MATCHES_FILE = path.join(__dirname, '../data/active_matches.json');
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

// Load existing matches if any
try {
    if (fs.existsSync(MATCHES_FILE)) {
        const savedMatches = JSON.parse(fs.readFileSync(MATCHES_FILE, 'utf8'));
        for (const match of savedMatches) {
            // Only load matches that haven't timed out
            if (Date.now() - match.lastActive < SESSION_TIMEOUT) {
                activeMatches.set(match.sessionId, match);
            }
        }
    }
} catch (error) {
    console.error('Error loading saved matches:', error);
}

class Match {
    constructor(player1, player2, overs) {
        this.sessionId = crypto.randomBytes(16).toString('hex');
        this.player1 = player1;  // Challenger
        this.player2 = player2;  // Accepting player
        this.overs = overs || 20;
        this.state = GAME_STATES.TEAM_SELECTION;
        this.teams = {};
        this.tossWinner = null;
        this.battingTeam = null;
        this.bowlingTeam = null;
        this.currentInnings = 1;
        this.score = {
            innings1: {
                runs: 0,
                wickets: 0,
                overs: 0,
                balls: 0,
                battingOrder: [],
                bowlingFigures: {},
                powerPlayScore: '0/0',
                lastOverRuns: 0
            },
            innings2: {
                runs: 0,
                wickets: 0,
                overs: 0,
                balls: 0,
                battingOrder: [],
                bowlingFigures: {},
                powerPlayScore: '0/0',
                lastOverRuns: 0
            }
        };
        this.currentBowler = null;
        this.currentBatsmen = {
            striker: null,
            nonStriker: null
        };
        this.target = null;
        this.league = null;
        this.quitRequested = null;
        this.quitRequestedTime = null;
        this.quitApproved = false;
        this.forfeited = false;
        this.winner = null;
        this.selectedTeams = {
            player1: null,
            player2: null
        };
        this.impactPlayerAvailable = true;
        this.powerPlayInProgress = false;
        this.availableLeagues = ['international', 'ipl', 'psl', 'bpl', 'lpl', 'bbl', 'sa20', 'ilt20', 't20', 'odi', 'test'];
        this.lastActive = Date.now();
        this.createdAt = Date.now();
    }

    updateActivity() {
        this.lastActive = Date.now();
    }

    hasTimedOut() {
        return Date.now() - this.lastActive > SESSION_TIMEOUT;
    }

    requestQuit(playerId) {
        this.updateActivity();
        if (this.quitRequested) {
            if (this.quitRequested === playerId) {
                // Player who requested quit is trying to forfeit
                return this.forfeit(playerId);
            }
            // Other player is responding to quit request
            this.quitApproved = true;
            this.state = GAME_STATES.COMPLETED;
            return { 
                status: 'approved', 
                message: 'Match ended by mutual agreement',
                type: 'mutual'
            };
        }

        this.quitRequested = playerId;
        this.quitRequestedTime = Date.now();
        return { 
            status: 'requested', 
            message: 'Quit request sent to opponent. They must approve or you must forfeit.',
            type: 'request'
        };
    }

    respondToQuit(playerId, approved) {
        this.updateActivity();
        if (!this.quitRequested || this.quitRequested === playerId) {
            return { status: 'invalid', message: 'No valid quit request to respond to' };
        }

        if (approved) {
            this.quitApproved = true;
            this.state = GAME_STATES.COMPLETED;
            return { status: 'approved', message: 'Match ended by mutual agreement' };
        } else {
            // Reset quit request if not approved
            this.quitRequested = null;
            this.quitRequestedTime = null;
            return { 
                status: 'rejected', 
                message: 'Quit request rejected. Match will continue.',
                type: 'rejection'
            };
        }
    }

    forfeit(playerId) {
        this.updateActivity();
        this.forfeited = true;
        this.winner = playerId === this.player1.id ? this.player2 : this.player1;
        this.state = GAME_STATES.COMPLETED;
        return {
            status: 'forfeited',
            winner: this.winner,
            message: `Match forfeited. ${this.winner.username} wins!`,
            type: 'forfeit'
        };
    }

    setLeague(leagueName, playerId) {
        this.updateActivity();
        // Only challenger can set league
        if (playerId !== this.player1.id) {
            return { 
                status: false, 
                message: 'Only the challenger can set the league',
                availableLeagues: this.availableLeagues
            };
        }

        if (this.availableLeagues.includes(leagueName.toLowerCase())) {
            this.league = leagueName.toLowerCase();
            // Automatically return available teams after league selection
            return { 
                status: true, 
                message: `League set to ${leagueName}`,
                availableTeams: this.getAvailableTeams()
            };
        }
        return { 
            status: false, 
            message: 'Invalid league selection',
            availableLeagues: this.availableLeagues
        };
    }

    getAvailableTeams() {
        const teams = require('../data/teams.json');
        return this.league ? Object.values(teams[this.league]) : [];
    }

    startTeamSelection() {
        this.updateActivity();
        if (!this.league) return false;
        this.state = GAME_STATES.TEAM_SELECTION;
        return this.getAvailableTeams();
    }

    setOvers(overs, playerId) {
        this.updateActivity();
        // Only challenger can set overs
        if (playerId !== this.player1.id) {
            return { 
                status: false, 
                message: 'Only the challenger can set the number of overs'
            };
        }

        if (overs >= 1 && overs <= 20) {
            this.overs = overs;
            return {
                status: true,
                message: `Overs set to ${overs}`
            };
        }
        return {
            status: false,
            message: 'Overs must be between 1 and 20'
        };
    }

    setTeam(playerId, teamName) {
        this.updateActivity();
        const teams = require('../data/teams.json');
        if (!this.league || !teams[this.league]) return false;

        const team = teams[this.league][teamName];
        if (!team) return false;

        // Prevent both players from selecting the same team
        if (playerId === this.player1.id) {
            if (this.selectedTeams.player2?.name === team.name) return false;
            this.selectedTeams.player1 = team;
        } else if (playerId === this.player2.id) {
            if (this.selectedTeams.player1?.name === team.name) return false;
            this.selectedTeams.player2 = team;
        } else {
            return false;
        }

        return true;
    }

    getScorecard() {
        this.updateActivity();
        const scorecardStyle = SCORECARD_STYLES[this.league] || SCORECARD_STYLES.international.t20;
        
        const currentInningsKey = `innings${this.currentInnings}`;
        const currentInningsScore = this.score[currentInningsKey];
        
        const baseScorecard = {
            innings1: { ...this.score.innings1 },
            innings2: { ...this.score.innings2 },
            target: this.target,
            matchComplete: this.isInningsComplete(2),
            currentBatsmen: this.currentBatsmen,
            currentBowler: this.currentBowler,
            currentBatsmenStats: {
                striker: this.battingStats[this.currentBatsmen.striker] || {},
                nonStriker: this.battingStats[this.currentBatsmen.nonStriker] || {}
            },
            currentBowlerStats: this.bowlingStats[this.currentBowler] || {},
            thisOver: currentInningsScore.thisOver || [],
            league: this.league,
            style: scorecardStyle,
            lastOverSummary: currentInningsScore.lastOverSummary || ''
        };

        // Add league-specific features
        if (this.league === 'ipl') {
            baseScorecard.impactPlayerAvailable = this.impactPlayerAvailable;
        } else if (['psl', 'bpl', 'lpl'].includes(this.league)) {
            baseScorecard.powerPlayScore = this.score[`innings${this.currentInnings}`].powerPlayScore;
        }

        return baseScorecard;
    }

    swapPlayers(teamId, player1Index, player2Index) {
        this.updateActivity();
        const team = teamId === this.player1.id ? this.selectedTeams.player1 : this.selectedTeams.player2;
        if (!team || !team.players) return false;

        if (player1Index < 0 || player1Index >= team.players.length ||
            player2Index < 0 || player2Index >= team.players.length) {
            return false;
        }

        [team.players[player1Index], team.players[player2Index]] =
            [team.players[player2Index], team.players[player1Index]];

        return true;
    }

    simulateToss() {
        this.updateActivity();
        const tossWinner = Math.random() < 0.5 ? this.player1 : this.player2;
        this.tossWinner = tossWinner;
        return tossWinner;
    }

    simulateBall() {
        this.updateActivity();
        const outcomes = [
            { result: 'dot', probability: 30, runs: 0, extra: false },
            { result: '1 run', probability: 25, runs: 1, extra: false },
            { result: '2 runs', probability: 15, runs: 2, extra: false },
            { result: '4 runs', probability: 12, runs: 4, extra: false },
            { result: '6 runs', probability: 8, runs: 6, extra: false },
            { result: 'wicket', probability: 5, runs: 0, extra: false },
            { result: 'wide', probability: 3, runs: 1, extra: true },
            { result: 'no ball', probability: 2, runs: 1, extra: true }
        ];

        let random = Math.random() * 100;
        let cumulativeProbability = 0;

        for (const outcome of outcomes) {
            cumulativeProbability += outcome.probability;
            if (random <= cumulativeProbability) {
                return outcome;
            }
        }
    }

    updateScore(innings, outcome) {
        this.updateActivity();
        const inningsScore = this.score[`innings${innings}`];
        inningsScore.runs += outcome.runs;

        if (outcome.result === 'wicket') {
            inningsScore.wickets++;
        }

        if (!outcome.extra) {
            inningsScore.balls++;
            if (inningsScore.balls === 6) {
                inningsScore.overs++;
                inningsScore.balls = 0;
            }
        }

        // Update bowling figures
        if (this.currentBowler) {
            if (!inningsScore.bowlingFigures[this.currentBowler]) {
                inningsScore.bowlingFigures[this.currentBowler] = {
                    overs: 0,
                    balls: 0,
                    runs: 0,
                    wickets: 0
                };
            }

            const bowlerStats = inningsScore.bowlingFigures[this.currentBowler];
            bowlerStats.runs += outcome.runs;
            if (outcome.result === 'wicket') bowlerStats.wickets++;
            if (!outcome.extra) {
                bowlerStats.balls++;
                if (bowlerStats.balls === 6) {
                    bowlerStats.overs++;
                    bowlerStats.balls = 0;
                }
            }
        }
    }

    isInningsComplete(innings) {
        const inningsScore = this.score[`innings${innings}`];
        return inningsScore.wickets >= 10 ||
            inningsScore.overs >= this.overs ||
            (innings === 2 && inningsScore.runs > this.target);
    }

    static createMatch(player1, player2, overs = 20) {
        const match = new Match(player1, player2, overs);
        activeMatches.set(match.sessionId, match);
        Match.saveMatches();
        return match;
    }

    static getMatch(playerId) {
        return Array.from(activeMatches.values()).find(match => {
            if (match.hasTimedOut()) {
                activeMatches.delete(match.sessionId);
                return false;
            }
            return (match.player1.id === playerId || match.player2.id === playerId);
        });
    }

    static getMatchBySession(sessionId) {
        const match = activeMatches.get(sessionId);
        if (match && !match.hasTimedOut()) {
            match.updateActivity();
            return match;
        }
        if (match) {
            activeMatches.delete(sessionId);
        }
        return null;
    }

    static resumeMatch(sessionId, playerId) {
        const match = Match.getMatchBySession(sessionId);
        if (!match) {
            return { status: false, message: 'Session expired or not found' };
        }

        if (match.player1.id !== playerId && match.player2.id !== playerId) {
            return { status: false, message: 'You are not part of this match' };
        }

        return { status: true, match };
    }

    static saveMatches() {
        try {
            // Clean up timed out matches before saving
            for (const [sessionId, match] of activeMatches) {
                if (match.hasTimedOut()) {
                    activeMatches.delete(sessionId);
                }
            }

            if (!fs.existsSync(path.dirname(MATCHES_FILE))) {
                fs.mkdirSync(path.dirname(MATCHES_FILE), { recursive: true });
            }
            fs.writeFileSync(MATCHES_FILE, JSON.stringify(Array.from(activeMatches.values())));
        } catch (error) {
            console.error('Error saving matches:', error);
        }
    }

    static endMatch(sessionId) {
        const match = Match.getMatchBySession(sessionId);
        if (match) {
            activeMatches.delete(sessionId);
            Match.saveMatches();
        }
        return match;
    }

    // Add methods to handle match state
    setMatchState(newState) {
        this.updateActivity();
        this.state = newState;
        Match.saveMatches();
    }
}

// Clean up inactive matches periodically (every 5 minutes)
setInterval(() => {
    let cleanupNeeded = false;
    for (const [sessionId, match] of activeMatches) {
        if (match.hasTimedOut()) {
            activeMatches.delete(sessionId);
            cleanupNeeded = true;
        }
    }
    if (cleanupNeeded) {
        Match.saveMatches();
    }
}, 5 * 60 * 1000);

module.exports = { Match };