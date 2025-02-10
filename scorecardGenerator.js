const path = require('path');
const fs = require('fs');

// Constants for different tournament styles
const TOURNAMENT_STYLES = {
    PSL: {
        backgroundColor: '#01411C', // PSL Green
        textColor: '#FFFFFF',
        logoPath: '../assets/psl_logo.svg',
        title: 'HBL PSL 9'
    },
    IPL: {
        backgroundColor: '#1A237E', // IPL Navy Blue
        textColor: '#FFFFFF',
        logoPath: '../assets/ipl_logo.svg',
        title: 'TATA IPL 2024'
    },
    BPL: {
        backgroundColor: '#006A4E', // BPL Green
        textColor: '#FFFFFF',
        logoPath: '../assets/bpl_logo.svg',
        title: 'BPL 2024'
    },
    LPL: {
        backgroundColor: '#00529B', // LPL Blue
        textColor: '#FFFFFF',
        logoPath: '../assets/lpl_logo.svg',
        title: 'LPL 2024'
    },
    BBL: {
        backgroundColor: '#2B2B2B', // BBL Dark Theme
        textColor: '#FFFFFF',
        logoPath: '../assets/bbl_logo.svg',
        title: 'KFC BBL|13'
    },
    SA20: {
        backgroundColor: '#E31837', // SA20 Red
        textColor: '#FFFFFF',
        logoPath: '../assets/sa20_logo.svg',
        title: 'Betway SA20'
    },
    ILT20: {
        backgroundColor: '#00205B', // ILT20 Navy
        textColor: '#FFFFFF',
        logoPath: '../assets/ilt20_logo.svg',
        title: 'DP World ILT20'
    },
    INTERNATIONAL: {
        t20: {
            backgroundColor: '#1F2937',
            textColor: '#FFFFFF',
            logoPath: '../assets/t20i_logo.svg',
            title: 'ICC Men\'s T20I'
        },
        odi: {
            backgroundColor: '#1E3A8A',
            textColor: '#FFFFFF',
            logoPath: '../assets/odi_logo.svg',
            title: 'ICC Men\'s ODI'
        },
        test: {
            backgroundColor: '#18181B',
            textColor: '#FFFFFF',
            logoPath: '../assets/test_logo.svg',
            title: 'ICC World Test Championship'
        }
    }
};

// Team color mappings based on their jerseys
const TEAM_COLORS = {
    // PSL Teams
    'Karachi Kings': '#0085CA',
    'Peshawar Zalmi': '#FDB913',
    'Lahore Qalandars': '#00A651',
    'Islamabad United': '#ED1B24',
    'Quetta Gladiators': '#652D90',
    'Multan Sultans': '#00B7EB',

    // BPL Teams
    'Rangpur Riders': '#E31837',
    'Dhaka Dominators': '#1E88E5',

    // BBL Teams
    'Perth Scorchers': '#F7941D',
    'Melbourne Stars': '#1A825C',
    'Sydney Sixers': '#FF69B4',

    // International Teams
    'India': '#0033A0',
    'Australia': '#FFD700',
    'England': '#1EA5DC',
    'South Africa': '#007A4D',
    'New Zealand': '#000000',
    'Pakistan': '#01411C',
    'West Indies': '#7B0041',
    'Sri Lanka': '#1B4A9C',
    'Bangladesh': '#006A4E',
    'Afghanistan': '#0066B3'
};

class SimpleScorecardGenerator {
    constructor(tournament = 'INTERNATIONAL', format = 't20') {
        this.tournament = tournament;
        this.format = format;

        // Handle international formats differently
        if (tournament === 'INTERNATIONAL') {
            this.style = TOURNAMENT_STYLES[tournament][format];
        } else {
            this.style = TOURNAMENT_STYLES[tournament];
        }
    }

    generateScorecard(matchData) {
        const { team1, team2, score, currentInnings } = matchData;

        // Generate SVG with team colors
        const teamColor = TEAM_COLORS[currentInnings === 1 ? team1 : team2] || this.style.backgroundColor;

        const svgContent = `
            <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
                <!-- Background with team color -->
                <rect width="100%" height="100%" fill="${teamColor}" opacity="0.9"/>

                <!-- Tournament Title -->
                <text x="400" y="50" font-family="Arial" font-size="24" fill="${this.style.textColor}" 
                      text-anchor="middle" font-weight="bold">
                    ${this.style.title}
                </text>

                <!-- Team Names -->
                <text x="400" y="100" font-family="Arial" font-size="28" fill="${this.style.textColor}" 
                      text-anchor="middle">
                    ${team1} vs ${team2}
                </text>

                <!-- Score -->
                <text x="400" y="200" font-family="Arial" font-size="48" fill="${this.style.textColor}" 
                      text-anchor="middle" font-weight="bold">
                    ${score.runs}/${score.wickets} (${score.overs}.${score.balls})
                </text>

                <!-- Current Run Rate -->
                <text x="400" y="250" font-family="Arial" font-size="24" fill="${this.style.textColor}" 
                      text-anchor="middle">
                    CRR: ${(score.runs / score.overs).toFixed(2)}
                </text>
            </svg>`;

        // Ensure output directory exists
        const outputDir = path.join(__dirname, '../../output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Generate unique filename with timestamp
        const outputPath = path.join(outputDir, `scorecard_${Date.now()}.svg`);
        fs.writeFileSync(outputPath, svgContent);

        return outputPath;
    }
}

module.exports = {
    SimpleScorecardGenerator,
    TOURNAMENT_STYLES,
    TEAM_COLORS
};