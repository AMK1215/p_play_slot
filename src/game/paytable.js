// src/game/paytable.js

// PAYTABLE: index = matches (0-12)
// | Symbol     | 8x  | 9x  | 10x | 11x | 12x+ |
// | ---------- | --- | --- | --- | --- | ---- |
// | Crown      | 50  | 100 | 200 | 500 | 1000 |
// | Hourglass  | 10  | 25  | 50  | 100 | 200  |
// | Ring       | 5   | 10  | 25  | 50  | 150  |
// | Red Gem    | 3   | 5   | 10  | 25  | 100  |
// | Purple Gem | 2   | 4   | 8   | 15  | 50   |
// | Yellow Gem | 2   | 4   | 8   | 15  | 40   |
// | Green Gem  | 1.5 | 3   | 6   | 12  | 25   |
// | Blue Gem   | 1   | 2   | 4   | 8   | 20   |
// index: [matches from 0 to 12]
export const PAYTABLE = {
  crown:      [0,0,0,0,0,0,0,0,50,100,200,500,1000], // index = matches
  hourglass:  [0,0,0,0,0,0,0,0,10,25,50,100,200],
  ring:       [0,0,0,0,0,0,0,0,5,10,25,50,150],
  redGem:     [0,0,0,0,0,0,0,0,3,5,10,25,100],
  purpleGem:  [0,0,0,0,0,0,0,0,2,4,8,15,50],
  yellowGem:  [0,0,0,0,0,0,0,0,2,4,8,15,40],
  greenGem:   [0,0,0,0,0,0,0,0,1.5,3,6,12,25],
  blueGem:    [0,0,0,0,0,0,0,0,1,2,4,8,20]
  // index: [matches from 0 to 12]
};

// Payout multipliers for 8+ symbols anywhere
export const EIGHT_PLUS_MULTIPLIERS = {
  yellowGem:    5,    // 5x bet for 8+ yellow gems
  ring:         6,    // 6x bet for 8+ rings
  blueGem:      4,    // 4x bet for 8+ blue gems
  greenGem:     3.5, // 3.5x bet for 8+ green gems
  purpleGem:    3,  // 3x bet for 8+ purple gems
  hourglass:    7.5,  // 7.5x bet for 8+ hourglasses
  crown:         10,
  redGem:        12,
  greenGem:      15,
  blueGem:       9,
  purpleGem:     12,
  yellowGem:     12,
  redGem:        11
};

// Bet amount ranges and their multipliers
export const BET_MULTIPLIERS = {
  MIN_BET: 20,
  MAX_BET: 100000,
  // Higher bets get better multipliers
  MULTIPLIERS: {
    LOW: 1.0,    // 20-1000 bet
    MEDIUM: 1.2, // 1001-10000 bet
    HIGH: 1.5    // 10001-100000 bet
  }
}; 