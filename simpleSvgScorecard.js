const fs = require('fs');
const path = require('path');

// Team colors based on jerseys
const TEAM_COLORS = {
    // PSL Teams
    'Karachi Kings': '#0085CA',
    'Peshawar Zalmi': '#FDB913',
    'Lahore Qalandars': '#00A651',
    'Islamabad United': '#ED1B24',
    'Quetta Gladiators': '#652D90',
    'Multan Sultans': '#00B7EB',

    // International Teams
    'India': '#0033A0',
    'Australia': '#FFD700',
    'Pakistan': '#01411C',
    'England': '#1EA5DC',
    'South Africa': '#007A4D',
    'New Zealand': '#000000'
};

// Tournament styles
const TOURNAMENT_STYLES = {
    PSL: {
        backgroundColor: '#0066cc',
        textColor: '#FFFFFF',
        accentColor: '#FFD700',
        title: 'HBL PSL 9',
        pattern: '<path d="M0 0l25 25l-25 25l25-25l25 25l-25-25l25-25l-25 25z" stroke="#FFD700" stroke-width="0.5" opacity="0.1"/>'
    },
    IPL: {
        backgroundColor: '#1A237E',
        textColor: '#FFFFFF',
        accentColor: '#FF9800',
        title: 'TATA IPL 2024',
        pattern: '<circle cx="30" cy="30" r="25" fill="none" stroke="#FF9800" stroke-width="0.5" opacity="0.1"/>'
    },
    BPL: {
        backgroundColor: '#006A4E',
        textColor: '#FFFFFF',
        accentColor: '#E31837',
        title: 'BPL 2024',
        pattern: '<rect x="0" y="0" width="20" height="20" fill="#E31837" opacity="0.1"/>'
    }
};

function generateScorecard(matchData, tournament = 'PSL') {
    const style = TOURNAMENT_STYLES[tournament];
    const teamColor = TEAM_COLORS[matchData.battingTeam] || style.backgroundColor;

    const svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="800" height="450" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <pattern id="bgPattern" patternUnits="userSpaceOnUse" width="50" height="50">
            ${style.pattern}
        </pattern>
    </defs>

    <!-- Background -->
    <rect width="100%" height="100%" fill="${teamColor}"/>
    <rect width="100%" height="100%" fill="url(#bgPattern)"/>

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
    <text x="400" y="200" font-family="Arial" font-size="48" fill="${style.textColor}"
          text-anchor="middle" font-weight="bold">
        ${matchData.score.runs}/${matchData.score.wickets} (${matchData.score.overs}.${matchData.score.balls})
    </text>

    <!-- Required Rate -->
    <text x="400" y="250" font-family="Arial" font-size="24" fill="${style.accentColor}"
          text-anchor="middle">
        CRR: ${((matchData.score.runs) / (matchData.score.overs + matchData.score.balls/6)).toFixed(2)}
    </text>

    <!-- Match Result and MoM -->
    <text x="50" y="420" font-family="Arial" font-size="20" fill="${style.textColor}">
        Man of the Match: ${matchData.manOfTheMatch || 'TBD'}
    </text>
    <text x="750" y="420" font-family="Arial" font-size="20" fill="${style.textColor}"
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


function generateDetailedScorecard(matchData) {
    const svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="1000" height="1200" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <rect width="100%" height="100%" fill="#1F2937"/>

    <!-- Title -->
    <text x="500" y="50" font-family="Arial" font-size="32" fill="#FFFFFF"
          text-anchor="middle" font-weight="bold">
        Cricket Match Scorecard
    </text>

    <!-- Teams -->
    <text x="500" y="100" font-family="Arial" font-size="28" fill="#FFFFFF"
          text-anchor="middle">
        ${matchData.team1} vs ${matchData.team2}
    </text>

    <!-- First Innings -->
    <text x="50" y="150" font-family="Arial" font-size="24" fill="#FFFFFF">
        1st INNINGS (${matchData.team1}: ${matchData.firstInnings.score})
    </text>

    <!-- First Innings Batting -->
    <text x="50" y="190" font-family="monospace" font-size="18" fill="#FFFFFF">
        BATTING
        Batter           R    B   4s  6s  SR
        ${matchData.firstInnings.batting.map((b, i) => 
            `${b.name.padEnd(15)} ${b.runs.toString().padStart(4)} ${b.balls.toString().padStart(4)} ${b.fours.toString().padStart(4)} ${b.sixes.toString().padStart(4)} ${b.strikeRate.toString().padStart(7)}`
        ).join('\n        ')}
    </text>

    <!-- First Innings Bowling -->
    <text x="50" y="400" font-family="monospace" font-size="18" fill="#FFFFFF">
        BOWLING
        Bowler           O    M    R    W   ECON
        ${matchData.firstInnings.bowling.map((b, i) => 
            `${b.name.padEnd(15)} ${b.overs.toString().padStart(4)} ${b.maidens.toString().padStart(4)} ${b.runs.toString().padStart(4)} ${b.wickets.toString().padStart(4)} ${b.economy.toString().padStart(7)}`
        ).join('\n        ')}
    </text>

    <!-- Second Innings -->
    <text x="50" y="600" font-family="Arial" font-size="24" fill="#FFFFFF">
        2nd INNINGS (${matchData.team2}: ${matchData.secondInnings.score})
    </text>

    <!-- Second Innings Batting -->
    <text x="50" y="640" font-family="monospace" font-size="18" fill="#FFFFFF">
        BATTING
        Batter           R    B   4s  6s  SR
        ${matchData.secondInnings.batting.map((b, i) => 
            `${b.name.padEnd(15)} ${b.runs.toString().padStart(4)} ${b.balls.toString().padStart(4)} ${b.fours.toString().padStart(4)} ${b.sixes.toString().padStart(4)} ${b.strikeRate.toString().padStart(7)}`
        ).join('\n        ')}
    </text>

    <!-- Second Innings Bowling -->
    <text x="50" y="850" font-family="monospace" font-size="18" fill="#FFFFFF">
        BOWLING
        Bowler           O    M    R    W   ECON
        ${matchData.secondInnings.bowling.map((b, i) => 
            `${b.name.padEnd(15)} ${b.overs.toString().padStart(4)} ${b.maidens.toString().padStart(4)} ${b.runs.toString().padStart(4)} ${b.wickets.toString().padStart(4)} ${b.economy.toString().padStart(7)}`
        ).join('\n        ')}
    </text>

    <!-- Match Summary -->
    <text x="500" y="1100" font-family="Arial" font-size="24" fill="#FFFFFF"
          text-anchor="middle" font-weight="bold">
        ${matchData.result}
    </text>
    <text x="500" y="1140" font-family="Arial" font-size="20" fill="#FFFFFF"
          text-anchor="middle">
        Player of the Match: ${matchData.playerOfMatch}
    </text>
</svg>`;

    const outputDir = path.join(__dirname, '../../output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const filepath = path.join(outputDir, `detailed_scorecard_${Date.now()}.svg`);
    fs.writeFileSync(filepath, svg);
    return filepath;
}

// Test function
function testScorecard() {
    const testMatch = {
        team1: 'Karachi Kings',
        team2: 'Peshawar Zalmi',
        battingTeam: 'Karachi Kings',
        score: {
            runs: 185,
            wickets: 4,
            overs: 15,
            balls: 2
        },
        manOfTheMatch: 'Babar Azam',
        matchResult: 'Karachi Kings won by 6 wickets'
    };

    console.log('Generating PSL scorecard...');
    const pslPath = generateScorecard(testMatch, 'PSL');
    console.log('PSL scorecard generated:', pslPath);

    // Test IPL
    testMatch.team1 = 'Mumbai Indians';
    testMatch.team2 = 'Chennai Super Kings';
    testMatch.manOfTheMatch = 'MS Dhoni';
    testMatch.matchResult = 'Chennai Super Kings won by 5 wickets';

    console.log('\nGenerating IPL scorecard...');
    const iplPath = generateScorecard(testMatch, 'IPL');
    console.log('IPL scorecard generated:', iplPath);
}

// Test data for detailed scorecard
const detailedTestMatch = {
    team1: 'Pakistan',
    team2: 'India',
    firstInnings: {
        score: '185/4 (15.2 overs)',
        batting: [
            { name: 'Babar Azam', runs: 82, balls: 48, fours: 8, sixes: 3, strikeRate: 170.83 },
            { name: 'M Rizwan', runs: 45, balls: 28, fours: 4, sixes: 2, strikeRate: 160.71 },
            { name: 'Iftikhar Ahmed', runs: 35, balls: 15, fours: 2, sixes: 4, strikeRate: 233.33 }
        ],
        bowling: [
            { name: 'B Kumar', overs: 4, maidens: 0, runs: 42, wickets: 2, economy: 10.50 },
            { name: 'A Patel', overs: 3, maidens: 0, runs: 32, wickets: 2, economy: 10.67 }
        ]
    },
    secondInnings: {
        score: '182/7 (15.2 overs)',
        batting: [
            { name: 'KL Rahul', runs: 55, balls: 32, fours: 6, sixes: 2, strikeRate: 171.88 },
            { name: 'V Kohli', runs: 48, balls: 28, fours: 4, sixes: 3, strikeRate: 171.43 }
        ],
        bowling: [
            { name: 'Shaheen Afridi', overs: 4, maidens: 1, runs: 28, wickets: 2, economy: 7.00 },
            { name: 'Haris Rauf', overs: 3, maidens: 0, runs: 35, wickets: 1, economy: 11.67 }
        ]
    },
    result: 'Pakistan won by 3 runs',
    playerOfMatch: 'Babar Azam (82 off 48)'
};

// Run test if called directly
if (require.main === module) {
    testScorecard();
    console.log('\nGenerating detailed scorecard...');
    const cardPath = generateDetailedScorecard(detailedTestMatch);
    console.log('Scorecard generated:', cardPath);
}

module.exports = {
    generateScorecard,
    generateDetailedScorecard,
    TOURNAMENT_STYLES,
    TEAM_COLORS
};