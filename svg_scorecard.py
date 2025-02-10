import os
import json
from datetime import datetime

# Tournament styles from the existing configuration
TOURNAMENT_STYLES = {
    'PSL': {
        'backgroundColor': '#01411C',  # PSL Green
        'textColor': '#FFFFFF',
        'title': 'HBL PSL 9'
    },
    'IPL': {
        'backgroundColor': '#1A237E',  # IPL Navy Blue
        'textColor': '#FFFFFF',
        'title': 'TATA IPL 2024'
    },
    'BPL': {
        'backgroundColor': '#006A4E',  # BPL Green
        'textColor': '#FFFFFF',
        'title': 'BPL 2024'
    },
    'BBL': {
        'backgroundColor': '#2B2B2B',  # BBL Dark Theme
        'textColor': '#FFFFFF',
        'title': 'KFC BBL|13'
    },
    'SA20': {
        'backgroundColor': '#E31837',  # SA20 Red
        'textColor': '#FFFFFF',
        'title': 'Betway SA20'
    },
    'INTERNATIONAL': {
        't20': {
            'backgroundColor': '#1F2937',
            'textColor': '#FFFFFF',
            'title': 'ICC Men\'s T20I'
        },
        'odi': {
            'backgroundColor': '#1E3A8A',
            'textColor': '#FFFFFF',
            'title': 'ICC Men\'s ODI'
        },
        'test': {
            'backgroundColor': '#18181B',
            'textColor': '#FFFFFF',
            'title': 'ICC World Test Championship'
        }
    }
}

# Team colors based on jerseys
TEAM_COLORS = {
    # PSL Teams
    'Karachi Kings': '#0085CA',
    'Peshawar Zalmi': '#FDB913',
    'Lahore Qalandars': '#00A651',
    'Islamabad United': '#ED1B24',
    'Quetta Gladiators': '#652D90',
    'Multan Sultans': '#00B7EB',
    
    # International Teams
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
}

def generate_scorecard(match_data, tournament='INTERNATIONAL', format='t20'):
    """Generate an SVG scorecard for a cricket match."""
    # Get tournament style
    style = TOURNAMENT_STYLES[tournament]
    if tournament == 'INTERNATIONAL':
        style = style[format]
    
    # Get team color for background
    team_color = TEAM_COLORS.get(match_data['batting_team'], style['backgroundColor'])
    
    # Calculate run rate
    overs = match_data['score']['overs'] + (match_data['score']['balls'] / 6)
    run_rate = match_data['score']['runs'] / overs if overs > 0 else 0
    
    # Generate SVG
    svg = f'''<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
    <!-- Background with team color -->
    <rect width="100%" height="100%" fill="{team_color}" opacity="0.9"/>
    
    <!-- Tournament Title -->
    <text x="400" y="50" font-family="Arial" font-size="24" fill="{style['textColor']}"
          text-anchor="middle" font-weight="bold">
        {style['title']}
    </text>
    
    <!-- Team Names -->
    <text x="400" y="100" font-family="Arial" font-size="28" fill="{style['textColor']}"
          text-anchor="middle">
        {match_data['team1']} vs {match_data['team2']}
    </text>
    
    <!-- Score -->
    <text x="400" y="200" font-family="Arial" font-size="48" fill="{style['textColor']}"
          text-anchor="middle" font-weight="bold">
        {match_data['score']['runs']}/{match_data['score']['wickets']} ({match_data['score']['overs']}.{match_data['score']['balls']})
    </text>
    
    <!-- Run Rate -->
    <text x="400" y="250" font-family="Arial" font-size="24" fill="{style['textColor']}"
          text-anchor="middle">
        CRR: {run_rate:.2f}
    </text>
</svg>'''

    # Ensure output directory exists
    output_dir = os.path.join(os.path.dirname(__file__), '../../output')
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate unique filename with timestamp
    filename = f'scorecard_{datetime.now().strftime("%Y%m%d_%H%M%S")}.svg'
    filepath = os.path.join(output_dir, filename)
    
    # Save SVG file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(svg)
    
    return filepath

def generate_detailed_scorecard(match_data):
    svg = f'''<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <!-- Main Background -->
    <rect width="100%" height="100%" fill="#0066cc"/>
    
    <!-- Score Section -->
    <text x="400" y="50" font-family="Arial" font-size="24" fill="white" text-anchor="middle">
        {match_data['team1']} vs {match_data['team2']}
    </text>
    <text x="400" y="100" font-family="Arial" font-size="36" fill="white" text-anchor="middle">
        {match_data['score']['runs']}/{match_data['score']['wickets']} 
        ({match_data['score']['overs']}.{match_data['score']['balls']})
    </text>
    
    <!-- Current Batsmen -->
    <text x="50" y="200" font-family="Arial" font-size="18" fill="white">
        Batting: {match_data.get('current_batsmen', {}).get('striker', 'TBD')}* 
        {match_data.get('current_batsmen_stats', {}).get('striker', '')}
    </text>
    <text x="50" y="230" font-family="Arial" font-size="18" fill="white">
        Non-striker: {match_data.get('current_batsmen', {}).get('non_striker', 'TBD')}
        {match_data.get('current_batsmen_stats', {}).get('non_striker', '')}
    </text>
    
    <!-- Current Bowler -->
    <text x="50" y="280" font-family="Arial" font-size="18" fill="white">
        Bowling: {match_data.get('current_bowler', 'TBD')}
        {match_data.get('current_bowler_stats', '')}
    </text>
    
    <!-- This Over -->
    <text x="50" y="330" font-family="Arial" font-size="18" fill="white">
        This Over: {match_data.get('this_over', '')}
    </text>
</svg>'''
    
    return svg

def test_scorecards():
    """Test function to generate sample scorecards for different tournaments."""
    test_match = {
        'team1': 'Karachi Kings',
        'team2': 'Peshawar Zalmi',
        'batting_team': 'Karachi Kings',
        'score': {
            'runs': 185,
            'wickets': 4,
            'overs': 15,
            'balls': 2
        },
        'current_batsmen': {
            'striker': 'Babar Azam',
            'non_striker': 'Mohammad Rizwan'
        },
        'current_batsmen_stats': {
            'striker': '72(48)',
            'non_striker': '45(32)'
        },
        'current_bowler': 'Shaheen Afridi',
        'current_bowler_stats': '3-0-28-2',
        'this_over': '1 W 4 . 2 1'
    }
    
    # Generate for PSL
    psl_card = generate_scorecard(test_match, tournament='PSL')
    print(f"Generated PSL scorecard: {psl_card}")
    
    # Generate for International T20
    test_match['team1'] = 'India'
    test_match['team2'] = 'Australia'
    test_match['batting_team'] = 'India'
    intl_card = generate_scorecard(test_match, tournament='INTERNATIONAL', format='t20')
    print(f"Generated International T20 scorecard: {intl_card}")

if __name__ == '__main__':
    test_scorecards()
