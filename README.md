[README.md](https://github.com/user-attachments/files/24771314/README.md)
# Life Balance Sim

A retro-style 2D life simulator game where you navigate daily choices across three key environments: Gym, Work, and Home. Every decision affects your personal wellbeing and the people around you.

## Play Now

[Play the game here](#) *(Add your GitHub Pages link after deploying)*

## About

Life Balance Sim is a choice-driven game that explores the interconnected nature of personal health, work-life balance, and family relationships. Make decisions that cascade through multiple stats, experience the consequences of neglecting self-care, and learn valuable lessons about maintaining balance in life.

## Game Features

- **Three Environments**: Gym, Work, and Home - each with unique scenarios
- **Dynamic Stats System**: Track 7 personal stats (Energy, Regulation, Confidence, Presence, Sleep, Physical, Connection)
- **NPC Relationships**: Your choices affect your partner and children's wellbeing
- **Warning System**: Get alerted when stats reach critical thresholds
- **Consequence-Driven**: Realistic game-over scenarios with meaningful lessons
- **Retro Pixel Art**: SNES-inspired 16-bit aesthetic

## Controls

| Key | Action |
|-----|--------|
| **Arrow Keys** | Move character |
| **SPACE** | Enter building / Interact with NPCs |
| **1 or 2** | Select choice in dialog |
| **ESC** | Leave building |
| **Click** | Alternative to keyboard for choices |

## Stats Explained

### Player Stats
- **Energy**: Your tank - depletes with stress, refills with rest
- **Regulation**: Emotional control - affects how hard bad choices hit
- **Confidence**: Built through wins, eroded by skipping commitments
- **Presence**: How available you are for family
- **Sleep**: Quality of rest - affects cognitive capacity
- **Physical**: Gym consistency and fitness momentum
- **Connection**: Relationship quality with your partner

### Family Stats
- **Partner**: Trust and Worry levels
- **Children**: Regulation, Security, Anxiety, and Confidence

## Game Mechanics

### The Amplification Effect
When your Regulation drops below 50%, negative consequences are amplified by 1.25x. Below 30%, they're amplified by 1.5x - representing how being dysregulated makes bad choices worse.

### Warning Thresholds
- Yellow warnings appear at 25% (or 75% for negative stats)
- Critical game-over triggers at 10% (or 95% for negative stats)

## Scenarios

### Gym
- Morning workout decisions
- Breaking the "skip slide" pattern
- Managing depletion vs. consistency
- Building sustainable momentum

### Work
- Setting boundaries with urgent requests
- Energy management at end of day
- Handling unstimulating tasks
- Protecting autonomy

### Home
- Opening up to your partner vs. isolation
- Accepting support vs. handling alone
- Staying regulated during family challenges
- Validating emotions vs. quick fixes

## Tech Stack

- **Framework**: Kaboom.js v3000
- **Resolution**: 800x500
- **Sprites**: Custom pixel art (16x24 for adults, 12x18 for children)
- **Hosting**: GitHub Pages

## Local Development

1. Clone this repository
2. Serve the files with a local server:
   ```bash
   # Python 3
   python -m http.server 8000

   # Node.js
   npx http-server

   # PHP
   php -S localhost:8000
   ```
3. Open `http://localhost:8000` in your browser

## Credits

Built with [Kaboom.js](https://kaboomjs.com/) and Claude Code.

## License

This project is open source and available for educational purposes.
