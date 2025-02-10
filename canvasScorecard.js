const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs');

// Constants for different scorecard styles
const STYLES = {
    PSL: {
        backgroundColor: '#01411C', // PSL Green
        textColor: '#FFFFFF',
        accentColor: '#85B641',
        headerColor: '#C4DE8C',
        brandingText: 'HBL PSL 9',
        width: 1920,
        height: 1080,
        fontFamily: 'Arial'
    },
    IPL: {
        backgroundColor: '#1A237E', // IPL Navy Blue
        textColor: '#FFFFFF',
        accentColor: '#FF9800',
        headerColor: '#FFA726',
        brandingText: 'TATA IPL 2024',
        width: 1920,
        height: 1080,
        fontFamily: 'Arial'
    },
    INTERNATIONAL: {
        backgroundColor: '#1F2937', // ICC Style Dark Blue
        textColor: '#FFFFFF',
        accentColor: '#3B82F6',
        headerColor: '#60A5FA',
        brandingText: 'ICC MEN\'S T20',
        width: 1920,
        height: 1080,
        fontFamily: 'Arial'
    }
};

class CanvasScorecardGenerator {
    constructor(style = 'INTERNATIONAL') {
        this.style = STYLES[style];
        this.canvas = createCanvas(this.style.width, this.style.height);
        this.ctx = this.canvas.getContext('2d');
    }

    generateScorecard(gameData) {
        // Clear canvas
        this.ctx.fillStyle = this.style.backgroundColor;
        this.ctx.fillRect(0, 0, this.style.width, this.style.height);

        // Draw header bar
        this.ctx.fillStyle = this.style.accentColor;
        this.ctx.fillRect(0, 0, this.style.width, 80);
        
        // Draw branding text
        this.ctx.font = `bold 36px ${this.style.fontFamily}`;
        this.ctx.fillStyle = this.style.textColor;
        this.ctx.fillText(this.style.brandingText, 50, 55);

        // Draw score bar
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(0, 80, this.style.width, 120);
        
        // Draw main score
        this.ctx.font = `bold 72px ${this.style.fontFamily}`;
        this.ctx.fillStyle = this.style.textColor;
        const score = `${gameData.score.innings1.runs}/${gameData.score.innings1.wickets}`;
        this.ctx.fillText(score, 50, 150);

        // Draw overs
        this.ctx.font = `48px ${this.style.fontFamily}`;
        const overs = `(${gameData.score.innings1.overs}.${gameData.score.innings1.balls})`;
        this.ctx.fillText(overs, 300, 150);

        // Draw run rate
        this.ctx.font = `36px ${this.style.fontFamily}`;
        this.ctx.fillStyle = this.style.headerColor;
        const runRate = `CRR: ${(gameData.score.innings1.runs / gameData.score.innings1.overs).toFixed(2)}`;
        this.ctx.fillText(runRate, 50, 220);

        // Draw batting stats
        this.drawBattingStats(gameData.battingStats);

        // Draw bowling stats
        this.drawBowlingStats(gameData.bowlingStats);

        // Draw partnership info
        this.drawPartnershipInfo(gameData.battingStats);

        // Draw last 5 overs
        if (gameData.score.innings1.lastFiveOvers) {
            this.drawLastOversInfo(gameData.score.innings1.lastFiveOvers);
        }

        // Save the canvas to file
        const outputDir = path.join(__dirname, '../../output');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const buffer = this.canvas.toBuffer('image/png');
        const outputPath = path.join(outputDir, `scorecard_${Date.now()}.png`);
        fs.writeFileSync(outputPath, buffer);

        return outputPath;
    }

    drawBattingStats(battingStats) {
        if (!battingStats) return;

        let yPos = 300;
        Object.entries(battingStats).forEach(([name, stats], index) => {
            const y = yPos + (index * 50);
            const sr = ((stats.runs / stats.balls) * 100).toFixed(1);

            // Draw batter name and score
            this.ctx.font = `32px ${this.style.fontFamily}`;
            this.ctx.fillStyle = this.style.textColor;
            this.ctx.fillText(`${name}* ${stats.runs}(${stats.balls})`, 50, y);

            // Draw strike rate and boundaries
            this.ctx.font = `28px ${this.style.fontFamily}`;
            this.ctx.fillStyle = this.style.headerColor;
            this.ctx.fillText(`SR: ${sr} | ${stats.fours}×4s ${stats.sixes}×6s`, 450, y);
        });
    }

    drawBowlingStats(bowlingStats) {
        if (!bowlingStats) return;

        let yPos = 500;
        Object.entries(bowlingStats).forEach(([name, stats], index) => {
            const y = yPos + (index * 50);
            const er = (stats.runs / stats.overs).toFixed(1);

            // Draw bowler name and figures
            this.ctx.font = `32px ${this.style.fontFamily}`;
            this.ctx.fillStyle = this.style.textColor;
            this.ctx.fillText(`${name} ${stats.overs}-${stats.maidens}-${stats.runs}-${stats.wickets}`, 800, y);

            // Draw economy rate
            this.ctx.font = `28px ${this.style.fontFamily}`;
            this.ctx.fillStyle = this.style.headerColor;
            this.ctx.fillText(`ER: ${er}`, 1200, y);
        });
    }

    drawPartnershipInfo(battingStats) {
        if (!battingStats) return;

        const activeBatsmen = Object.entries(battingStats).slice(-2);
        if (activeBatsmen.length < 2) return;

        const [striker, nonStriker] = activeBatsmen;
        const partnership = striker[1].runs + nonStriker[1].runs;

        this.ctx.font = `32px ${this.style.fontFamily}`;
        this.ctx.fillStyle = this.style.headerColor;
        this.ctx.fillText(`Partnership: ${partnership} runs`, 50, 700);
    }

    drawLastOversInfo(lastOvers) {
        this.ctx.font = `32px ${this.style.fontFamily}`;
        this.ctx.fillStyle = this.style.headerColor;
        this.ctx.fillText(`Last 5 overs: ${lastOvers}`, 800, 700);
    }
}

module.exports = {
    CanvasScorecardGenerator,
    STYLES
};
