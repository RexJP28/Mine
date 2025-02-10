import os
from datetime import datetime

STYLES = {
    'PSL': {
        'bg_color': '#01411C',  # PSL Green
        'text_color': '#FFFFFF',
        'title': 'HBL PSL 9'
    },
    'IPL': {
        'bg_color': '#1A237E',  # IPL Blue
        'text_color': '#FFFFFF',
        'title': 'TATA IPL 2024'
    },
    'INTERNATIONAL': {
        'bg_color': '#1F2937',  # Dark Blue
        'text_color': '#FFFFFF',
        'title': "ICC Men's T20"
    }
}

def generate_scorecard(match_data, tournament='PSL'):
    style = STYLES.get(tournament, STYLES['PSL'])
    
    svg = f'''<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
    <!-- Background -->
    <rect width="100%" height="100%" fill="{style['bg_color']}"/>
    
    <!-- Title -->
    <text x="400" y="50" font-family="Arial" font-size="24" fill="{style['text_color']}"
          text-anchor="middle" font-weight="bold">
        {style['title']}
    </text>
    
    <!-- Teams -->
    <text x="400" y="100" font-family="Arial" font-size="28" fill="{style['text_color']}"
          text-anchor="middle">
        {match_data['team1']} vs {match_data['team2']}
    </text>
    
    <!-- Score -->
    <text x="400" y="180" font-family="Arial" font-size="48" fill="{style['text_color']}"
          text-anchor="middle" font-weight="bold">
        {match_data['score']['runs']}/{match_data['score']['wickets']} ({match_data['score']['overs']}.{match_data['score']['balls']})
    </text>
    
    <!-- Bottom Info -->
    <text x="50" y="350" font-family="Arial" font-size="20" fill="{style['text_color']}">
        Man of the Match: {match_data.get('man_of_match', 'TBD')}
    </text>
    <text x="750" y="350" font-family="Arial" font-size="20" fill="{style['text_color']}"
          text-anchor="end">
        {match_data.get('match_result', 'Match in Progress')}
    </text>
</svg>'''
    
    # Ensure output directory exists
    output_dir = os.path.join(os.path.dirname(__file__), '../../output')
    os.makedirs(output_dir, exist_ok=True)
    
    # Save the SVG file with timestamp
    filename = f'scorecard_{datetime.now().strftime("%Y%m%d_%H%M%S")}.svg'
    filepath = os.path.join(output_dir, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(svg)
    
    return filepath

def test_scorecard():
    # Test data
    test_match = {
        'team1': 'Pakistan',
        'team2': 'India',
        'score': {
            'runs': 185,
            'wickets': 4,
            'overs': 15,
            'balls': 2
        },
        'man_of_match': 'Babar Azam',
        'match_result': 'Pakistan won by 6 wickets'
    }
    
    # Generate scorecards for different tournaments
    print('Generating scorecards...')
    for tournament in STYLES.keys():
        filepath = generate_scorecard(test_match, tournament)
        print(f'{tournament} scorecard generated: {filepath}')

if __name__ == '__main__':
    test_scorecard()
