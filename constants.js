const GAME_STATES = {
    BATTING: 'BATTING',
    BOWLING: 'BOWLING',
    COMPLETED: 'COMPLETED',
    TEAM_SELECTION: 'TEAM_SELECTION',
    TOSS: 'TOSS',
    QUIT_REQUESTED: 'QUIT_REQUESTED',
    FORFEITED: 'FORFEITED'
};

const ACHIEVEMENTS = {
    FIRST_FIFTY: 'First Fifty',
    CENTURY_MAKER: 'Century Maker',
    PERFECT_OVER: 'Perfect Over',
    HAT_TRICK: 'Hat-trick',
    MATCH_WINNER: 'Match Winner',
    TOURNAMENT_CHAMPION: 'Tournament Champion',
    RAPID_FIFTY: 'Rapid Fifty',
    ECONOMY_KING: 'Economy King',
    ALL_ROUNDER: 'All-Rounder Excellence',
    TEAM_LOYALTY: 'Team Loyalty'
};

const LEAGUES = {
    INTERNATIONAL: 'international',
    IPL: 'ipl',
    PSL: 'psl',
    BPL: 'bpl',
    LPL: 'lpl',
    BBL: 'bbl',
    SA20: 'sa20',
    ILT20: 'ilt20',
    T20: 't20',
    ODI: 'odi',
    TEST: 'test'
};

const SCORECARD_STYLES = {
    international: {
        t20: 'icc_t20',
        odi: 'icc_odi',
        test: 'icc_test'
    },
    ipl: 'ipl_style',
    psl: 'psl_style',
    bpl: 'bpl_style',
    lpl: 'lpl_style',
    bbl: 'bbl_style',
    sa20: 'sa20_style',
    ilt20: 'ilt20_style'
};

module.exports = {
    GAME_STATES,
    ACHIEVEMENTS,
    LEAGUES,
    SCORECARD_STYLES
};