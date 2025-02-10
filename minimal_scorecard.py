import os
from datetime import datetime

def generate_scorecard(match_data):
    """Generate a minimal SVG scorecard."""
    svg = f'''<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <rect width="100%" height="100%" fill="#1F2937"/>
    
    <!-- Score -->
    <text x="400" y="180" font-family="Arial" font-size="48" fill="#FFFFFF"
          text-anchor="middle" font-weight="bold">
        {match_data["score"]} ({match_data["overs"]})
    </text>
    
    <!-- Teams -->
    <text x="400" y="100" font-family="Arial" font-size="28" fill="#FFFFFF"
          text-anchor="middle">
        {match_data["team1"]} vs {match_data["team2"]}
    </text>
    
    <!-- Result -->
    <text x="400" y="300" font-family="Arial" font-size="24" fill="#FFFFFF"
          text-anchor="middle">
        {match_data["result"]}
    </text>
</svg>'''
    
    # Ensure output directory exists
    output_dir = os.path.join(os.path.dirname(__file__), '../../output')
    os.makedirs(output_dir, exist_ok=True)
    
    # Save the SVG file
    filename = f'scorecard_{datetime.now().strftime("%Y%m%d_%H%M%S")}.svg'
    filepath = os.path.join(output_dir, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(svg)
    
    return filepath

if __name__ == '__main__':
    # Test data
    test_match = {
        "team1": "Pakistan",
        "team2": "India",
        "score": "185/4",
        "overs": "15.2",
        "result": "Pakistan won by 6 wickets"
    }
    
    output_path = generate_scorecard(test_match)
    print(f"Generated scorecard: {output_path}")
