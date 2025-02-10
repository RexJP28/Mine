const fs = require('fs');
const path = require('path');

// Simple league styles
const STYLES = {
    PSL: {
        backgroundColor: '#01411C',  // PSL Green
        textColor: '#FFFFFF',
        title: 'HBL PSL 9'
    },
    IPL: {
        backgroundColor: '#1A237E',  // IPL Navy Blue
        textColor: '#FFFFFF',
        title: 'TATA IPL 2024'
    },
    INTERNATIONAL: {
        backgroundColor: '#1F2937',  // Dark Blue
        textColor: '#FFFFFF',
        title: 'ICC Men\'s T20'
    }
};

function generateScorecard(matchData, tournament = 'PSL') {
    const style = STYLES[tournament] || STYLES.PSL;  // Default to PSL if tournament style not found

    const svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <rect width="100%" height="100%" fill="${style.backgroundColor}"/>

    <!-- Title -->
    <text x="400" y="50" font-family="Arial" font-size="24" fill="${style.textColor}"
          text-anchor="middle" font-weight="bold">
        ${style.title}
    </text>

    <!-- Teams -->
    <text x="400" y="100" font-family="Arial" font-size="28" fill="${style.textColor}"
          text-anchor="middle">
        ${matchData.team1} vs ${matchData.team2}
    </text>

    <!-- Score -->
    <text x="400" y="180" font-family="Arial" font-size="48" fill="${style.textColor}"
          text-anchor="middle" font-weight="bold">
        ${matchData.score.runs}/${matchData.score.wickets} (${matchData.score.overs}.${matchData.score.balls})
    </text>

    <!-- Bottom Info -->
    <text x="50" y="350" font-family="Arial" font-size="20" fill="${style.textColor}">
        Man of the Match: ${matchData.manOfTheMatch || 'TBD'}
    </text>
    <text x="750" y="350" font-family="Arial" font-size="20" fill="${style.textColor}"
          text-anchor="end">
        ${matchData.matchResult || 'Match in Progress'}
    </text>
</svg>`;

    // Ensure output directory exists
    const outputDir = path.join(__dirname, '../../output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const filepath = path.join(outputDir, `scorecard_${Date.now()}.svg`);
    fs.writeFileSync(filepath, svg);
    return filepath;
}

// Test function
function testScorecard() {
    const testMatch = {
        team1: 'Pakistan',
        team2: 'India',
        score: {
            runs: 185,
            wickets: 4,
            overs: 15,
            balls: 2
        },
        manOfTheMatch: 'Babar Azam',
        matchResult: 'Pakistan won by 6 wickets'
    };

    console.log('Generating test scorecard...');
    const cardPath = generateScorecard(testMatch, 'INTERNATIONAL');
    console.log('Scorecard generated:', cardPath);
}

// Run test if called directly
if (require.main === module) {
    testScorecard();
}

module.exports = { generateScorecard, STYLES };