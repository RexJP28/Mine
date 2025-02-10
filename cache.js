const NodeCache = require('node-cache');

const cache = new NodeCache({
    stdTTL: 3600, // 1 hour default TTL
    checkperiod: 120 // Check for expired keys every 2 minutes
});

// Helper functions for prefix management
function getServerPrefix(serverId) {
    const prefix = cache.get(`prefix_${serverId}`);
    return prefix || 'c!'; // Default prefix if none set
}

function setServerPrefix(serverId, prefix) {
    cache.set(`prefix_${serverId}`, prefix);
}

// Helper functions for user stats
function getUserStats(userId) {
    return cache.get(`stats_${userId}`) || {
        matches: 0,
        wins: 0,
        losses: 0,
        mostUsedTeam: null,
        recentResults: [], // Array of last 5 results ('W' or 'L')
        teamStats: {} // Object to track performance with different teams
    };
}

function updateUserStats(userId, matchResult, teamUsed) {
    let stats = getUserStats(userId);

    // Update match count and win/loss
    stats.matches++;
    if (matchResult === 'W') {
        stats.wins++;
    } else {
        stats.losses++;
    }

    // Update team stats
    if (!stats.teamStats[teamUsed]) {
        stats.teamStats[teamUsed] = { matches: 0, wins: 0 };
    }
    stats.teamStats[teamUsed].matches++;
    if (matchResult === 'W') {
        stats.teamStats[teamUsed].wins++;
    }

    // Update most used team
    let mostUsedTeam = null;
    let maxMatches = 0;
    for (const [team, teamStat] of Object.entries(stats.teamStats)) {
        if (teamStat.matches > maxMatches) {
            mostUsedTeam = team;
            maxMatches = teamStat.matches;
        }
    }
    stats.mostUsedTeam = mostUsedTeam;

    // Update recent results (keep last 5)
    stats.recentResults.unshift(matchResult);
    if (stats.recentResults.length > 5) {
        stats.recentResults = stats.recentResults.slice(0, 5);
    }

    cache.set(`stats_${userId}`, stats);
    return stats;
}

module.exports = {
    cache,
    getServerPrefix,
    setServerPrefix,
    getUserStats,
    updateUserStats
};