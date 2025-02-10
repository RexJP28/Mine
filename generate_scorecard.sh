#!/bin/bash

# Create output directory if it doesn't exist
mkdir -p output

# Function to generate SVG scorecard
generate_scorecard() {
    local tournament=$1
    local bgcolor
    local title
    
    case $tournament in
        "PSL")
            bgcolor="#01411C"
            title="HBL PSL 9"
            ;;
        "IPL")
            bgcolor="#1A237E"
            title="TATA IPL 2024"
            ;;
        "INTERNATIONAL")
            bgcolor="#1F2937"
            title="ICC Men's T20"
            ;;
    esac

    # Generate SVG with current timestamp
    cat > "output/scorecard_${tournament,,}_$(date +%s).svg" << EOF
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <rect width="100%" height="100%" fill="${bgcolor}"/>
    
    <!-- Title -->
    <text x="400" y="50" font-family="Arial" font-size="24" fill="#FFFFFF"
          text-anchor="middle" font-weight="bold">
        ${title}
    </text>
    
    <!-- Teams -->
    <text x="400" y="100" font-family="Arial" font-size="28" fill="#FFFFFF"
          text-anchor="middle">
        Pakistan vs India
    </text>
    
    <!-- Score -->
    <text x="400" y="180" font-family="Arial" font-size="48" fill="#FFFFFF"
          text-anchor="middle" font-weight="bold">
        185/4 (15.2)
    </text>
    
    <!-- Bottom Info -->
    <text x="50" y="350" font-family="Arial" font-size="20" fill="#FFFFFF">
        Man of the Match: Babar Azam
    </text>
    <text x="750" y="350" font-family="Arial" font-size="20" fill="#FFFFFF"
          text-anchor="end">
        Pakistan won by 6 wickets
    </text>
</svg>
EOF

    echo "Generated scorecard for ${tournament}"
}

# Generate scorecards for each tournament type
generate_scorecard "PSL"
generate_scorecard "IPL"
generate_scorecard "INTERNATIONAL"

echo "All scorecards generated in output directory"
