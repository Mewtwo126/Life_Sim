// Import Kaboom
import kaboom from "https://unpkg.com/kaboom@3000/dist/kaboom.mjs";

// Initialize Kaboom
const k = kaboom({
    width: 800,
    height: 500,
    background: [135, 206, 235],  // Sky blue
    scale: 1,
    crisp: true,
});

// ============================================
// GAME CONSTANTS
// ============================================
const MOVE_SPEED = 200;
const SCALE = 3;

// ============================================
// PLAYER STATS
// ============================================
const stats = {
    energy: 100,        // Your tank - depletes with stress, refills with rest/exercise
    regulation: 100,    // Emotional regulation - how close to flooding
    confidence: 100,    // Builds with wins, erodes with slides
    presence: 100,      // How "there" you are for family
    sleep: 100,         // Sleep quality - affects next-day capacity
    physical: 50,       // Gym consistency / fitness momentum (starts mid)
    connection: 75,     // Relationship quality with partner
};

// ============================================
// NPC STATS - How your choices impact them
// ============================================
const npcStats = {
    partner: {
        trust: 80,      // Do they feel included or shut out?
        worry: 30,      // Are they anxious about you? (high = bad)
    },
    child1: {
        regulation: 70, // Children mirror parents
        security: 80,   // Do they feel safe with parent?
    },
    child2: {
        anxiety: 40,    // Their baseline anxiety (high = bad)
        confidence: 70, // Mirrors your patterns
    }
};

// ============================================
// WARNING & GAME OVER THRESHOLDS
// ============================================
const WARNING_THRESHOLD = 25;
const CRITICAL_THRESHOLD = 10;

const gameOverConditions = {
    energy: {
        title: "BURNOUT",
        message: "Your tank hit empty. You pushed too hard without rest.\nYour body forced the stop you wouldn't take.",
        lesson: "Recovery isn't optional — it's the foundation everything else is built on."
    },
    regulation: {
        title: "EMOTIONAL FLOODING",
        message: "Complete dysregulation. The collision you couldn't prevent.\nYou lost control in front of the people who needed you most.",
        lesson: "Catching yourself early is easier than recovering from rock bottom."
    },
    confidence: {
        title: "THE SLIDE WINS",
        message: "The snowball effect took over. Each missed day made the next one harder.\nYou stopped believing you could get back on track.",
        lesson: "Day 2 is the critical intervention point — not week 3."
    },
    presence: {
        title: "ABSENT PARENT",
        message: "You were there physically, but nowhere else.\nYour family stopped expecting you to be present.",
        lesson: "Presence isn't about perfection — it's about consistency."
    },
    sleep: {
        title: "SYSTEM CRASH",
        message: "Sleep debt caught up. Your cognitive load exceeded capacity.\nYour body shut down what your mind wouldn't.",
        lesson: "Sleep is when you rebuild. Skip it long enough, and there's nothing left to rebuild with."
    },
    connection: {
        title: "ISOLATION",
        message: "You pushed away the support system that could have caught you.\n'I don't want to be a burden' became a self-fulfilling prophecy.",
        lesson: "Systematic support removes the emotional weight of asking for help."
    },
    partnerTrust: {
        title: "RELATIONSHIP CRISIS",
        message: "They stopped believing you'd let them in.\nToo many 'I'm fine' responses when you clearly weren't.",
        lesson: "Partners can't help with what they don't know about."
    },
    partnerWorry: {
        title: "PARTNER OVERWHELMED",
        message: "Your partner's worry maxed out. They're carrying anxiety for both of you.\nThe weight you wouldn't share became their burden anyway.",
        lesson: "Sharing the load is lighter than watching someone struggle alone."
    },
    child1Security: {
        title: "CHILD LOST SAFETY",
        message: "Your young child stopped feeling safe with you.\nTheir world is hard enough without an unpredictable parent.",
        lesson: "Children with high needs require regulated parents — your calm is their anchor."
    },
    child2Anxiety: {
        title: "CHILD'S ANXIETY SPIRAL",
        message: "Their anxiety spiked beyond baseline. They're mirroring your dysregulation.\nKids don't do what you say — they do what you do.",
        lesson: "You can't tell them to calm down while you're wound up."
    }
};

// ============================================
// SPRITE GENERATION
// ============================================
function createPixelSprite(width, height, pixels, palette) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const colorIndex = pixels[y][x];
            if (colorIndex !== 0) {
                ctx.fillStyle = palette[colorIndex];
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
    return canvas.toDataURL();
}

// ============================================
// PALETTES
// ============================================
const playerPalette = {
    1: "#2d1b00", 2: "#8b5a2b", 3: "#cd853f",
    4: "#1a5f7a", 5: "#2e8bc0", 6: "#0f3460", 7: "#1a1a2e",
};

const partnerPalette = {
    1: "#1a0a00", 2: "#8b5a2b", 3: "#cd853f",
    4: "#6b2d5c", 5: "#9b4d7c", 6: "#2f2f4f", 7: "#1a1a2e",
    8: "#2d1b00",  // Eyelashes (dark)
    9: "#c46a6a",  // Lips (rosy pink)
};

const child1Palette = {
    1: "#2d1b00", 2: "#8b5a2b", 3: "#cd853f",
    4: "#2d5a7d", 5: "#4a8fbf", 6: "#3d3d5c", 7: "#1a1a2e",
};

const child2Palette = {
    1: "#2d1b00", 2: "#8b5a2b", 3: "#cd853f",
    4: "#7d2d6b", 5: "#bf4a9f", 6: "#3d3d5c", 7: "#1a1a2e",
};

const npcPalette = {
    1: "#4a1c00", 2: "#deb887", 3: "#f5deb3",
    4: "#8b0000", 5: "#cd5c5c", 6: "#2f2f2f", 7: "#1a1a1a",
};

// ============================================
// CHARACTER PIXELS (16x24)
// ============================================
const malePixels = [
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,2,2,2,3,3,2,3,0,0,0,0,0,0],
    [0,0,2,3,2,3,3,3,2,3,3,3,0,0,0,0],
    [0,0,2,3,2,2,3,3,3,2,3,3,3,0,0,0],
    [0,0,2,2,3,3,3,2,2,2,2,2,0,0,0,0],
    [0,0,0,3,3,3,3,3,3,3,3,0,0,0,0,0],
    [0,0,0,0,4,5,5,5,5,4,0,0,0,0,0,0],
    [0,0,0,4,4,5,5,5,5,4,4,0,0,0,0,0],
    [0,0,4,4,4,5,5,5,5,4,4,4,0,0,0,0],
    [0,0,2,2,4,5,5,5,5,4,2,2,0,0,0,0],
    [0,0,2,2,4,4,5,5,4,4,2,2,0,0,0,0],
    [0,0,0,0,4,4,4,4,4,4,0,0,0,0,0,0],
    [0,0,0,0,4,4,0,0,4,4,0,0,0,0,0,0],
    [0,0,0,0,6,6,0,0,6,6,0,0,0,0,0,0],
    [0,0,0,0,6,6,0,0,6,6,0,0,0,0,0,0],
    [0,0,0,0,6,6,0,0,6,6,0,0,0,0,0,0],
    [0,0,0,0,6,6,0,0,6,6,0,0,0,0,0,0],
    [0,0,0,0,6,6,0,0,6,6,0,0,0,0,0,0],
    [0,0,0,0,6,6,0,0,6,6,0,0,0,0,0,0],
    [0,0,0,0,7,7,0,0,7,7,0,0,0,0,0,0],
    [0,0,0,7,7,7,0,0,7,7,7,0,0,0,0,0],
];

// Partner sprite with longer hair and feminine face (16x24)
const partnerPixels = [
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,1,2,2,3,3,3,3,3,2,2,1,0,0,0],
    [0,0,1,2,8,3,3,3,3,8,3,2,1,0,0,0],
    [0,0,1,3,3,3,3,3,3,3,3,3,1,0,0,0],
    [0,0,1,3,3,3,3,2,3,3,3,3,1,0,0,0],
    [0,0,1,3,3,3,9,9,9,3,3,1,1,0,0,0],
    [0,0,1,1,4,5,5,5,5,4,1,1,0,0,0,0],
    [0,0,0,4,4,5,5,5,5,4,4,0,0,0,0,0],
    [0,0,4,4,4,5,5,5,5,4,4,4,0,0,0,0],
    [0,0,2,2,4,5,5,5,5,4,2,2,0,0,0,0],
    [0,0,2,2,4,4,5,5,4,4,2,2,0,0,0,0],
    [0,0,0,0,4,4,4,4,4,4,0,0,0,0,0,0],
    [0,0,0,0,4,4,4,4,4,4,0,0,0,0,0,0],
    [0,0,0,0,4,4,4,4,4,4,0,0,0,0,0,0],
    [0,0,0,0,4,4,4,4,4,4,0,0,0,0,0,0],
    [0,0,0,0,4,4,4,4,4,4,0,0,0,0,0,0],
    [0,0,0,0,4,4,4,4,4,4,0,0,0,0,0,0],
    [0,0,0,0,6,6,0,0,6,6,0,0,0,0,0,0],
    [0,0,0,0,6,6,0,0,6,6,0,0,0,0,0,0],
    [0,0,0,0,7,7,0,0,7,7,0,0,0,0,0,0],
    [0,0,0,7,7,7,0,0,7,7,7,0,0,0,0,0],
];

// Child 1 sprite (12x18)
const child1Pixels = [
    [0,0,0,0,1,1,1,1,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,0,0],
    [0,0,2,2,3,3,3,3,2,2,0,0],
    [0,0,2,3,3,3,3,3,3,2,0,0],
    [0,0,2,2,3,3,3,3,2,2,0,0],
    [0,0,0,3,3,3,3,3,3,0,0,0],
    [0,0,0,4,5,5,5,5,4,0,0,0],
    [0,0,4,4,5,5,5,5,4,4,0,0],
    [0,0,2,4,5,5,5,5,4,2,0,0],
    [0,0,0,4,4,5,5,4,4,0,0,0],
    [0,0,0,4,4,0,0,4,4,0,0,0],
    [0,0,0,6,6,0,0,6,6,0,0,0],
    [0,0,0,6,6,0,0,6,6,0,0,0],
    [0,0,0,6,6,0,0,6,6,0,0,0],
    [0,0,0,6,6,0,0,6,6,0,0,0],
    [0,0,0,7,7,0,0,7,7,0,0,0],
    [0,0,7,7,7,0,0,7,7,7,0,0],
];

// Child 2 sprite (12x18)
const child2Pixels = [
    [0,1,1,0,1,1,1,1,0,1,1,0],
    [0,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,1,1,1,1,0,0],
    [0,0,2,2,3,3,3,3,2,2,0,0],
    [0,0,2,3,3,3,3,3,3,2,0,0],
    [0,0,2,2,3,3,3,3,2,2,0,0],
    [0,0,0,3,3,3,3,3,3,0,0,0],
    [0,0,0,4,5,5,5,5,4,0,0,0],
    [0,0,4,4,5,5,5,5,4,4,0,0],
    [0,0,2,4,5,5,5,5,4,2,0,0],
    [0,0,0,4,4,5,5,4,4,0,0,0],
    [0,0,0,4,4,4,4,4,4,0,0,0],
    [0,0,0,4,4,4,4,4,4,0,0,0],
    [0,0,0,4,4,4,4,4,4,0,0,0],
    [0,0,0,6,6,0,0,6,6,0,0,0],
    [0,0,0,6,6,0,0,6,6,0,0,0],
    [0,0,0,7,7,0,0,7,7,0,0,0],
    [0,0,7,7,7,0,0,7,7,7,0,0],
];

// ============================================
// BUILDING PIXELS
// ============================================
const buildingPalette = {
    1: "#2a2a40",  // Dark outline
    2: "#4a4a6a",  // Wall shadow
    3: "#6a6a8a",  // Wall mid
    4: "#8a8aaa",  // Wall light
    5: "#3d2817",  // Door dark
    6: "#5c3c23",  // Door light
    7: "#87ceeb",  // Window
    8: "#5a9fd4",  // Window shadow
    9: "#ffcc00",  // Sign/light
};

// Gym building (32x40)
const gymPixels = [
    [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,1,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,1,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
    [0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,7,7,8,4,4,4,7,7,8,4,4,4,7,7,8,4,4,4,7,7,8,4,4,3,2,1,0],
    [0,1,2,3,4,7,7,8,4,4,4,7,7,8,4,4,4,7,7,8,4,4,4,7,7,8,4,4,3,2,1,0],
    [0,1,2,3,4,8,8,8,4,4,4,8,8,8,4,4,4,8,8,8,4,4,4,8,8,8,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,7,7,8,4,4,4,7,7,8,4,4,4,7,7,8,4,4,4,7,7,8,4,4,3,2,1,0],
    [0,1,2,3,4,7,7,8,4,4,4,7,7,8,4,4,4,7,7,8,4,4,4,7,7,8,4,4,3,2,1,0],
    [0,1,2,3,4,8,8,8,4,4,4,8,8,8,4,4,4,8,8,8,4,4,4,8,8,8,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,1,5,5,5,5,5,5,1,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,1,5,6,6,6,6,5,1,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,1,5,6,6,6,6,5,1,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,1,5,6,6,6,6,5,1,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,1,5,6,6,6,6,5,1,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,1,5,6,6,6,6,5,1,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,1,5,6,6,6,6,5,1,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,1,5,6,6,6,6,5,1,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,1,5,6,6,6,6,5,1,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0],
    [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// Work building (32x40)
const workPixels = [
    [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,2,3,4,7,7,8,4,4,4,7,7,8,4,4,3,2,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,2,3,4,4,7,7,8,4,4,4,7,7,8,4,4,4,3,2,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,2,3,4,4,4,8,8,8,4,4,4,8,8,8,4,4,4,4,3,2,1,0,0,0,0,0],
    [0,0,0,0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0,0,0,0],
    [0,0,0,1,2,3,4,4,4,7,7,8,4,4,4,4,4,4,7,7,8,4,4,4,4,4,3,2,1,0,0,0],
    [0,0,1,2,3,4,4,4,4,7,7,8,4,4,4,4,4,4,7,7,8,4,4,4,4,4,4,3,2,1,0,0],
    [0,1,2,3,4,4,4,4,4,8,8,8,4,4,4,4,4,4,8,8,8,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,7,7,8,4,4,4,7,7,8,4,4,4,7,7,8,4,4,4,7,7,8,4,4,3,2,1,0],
    [0,1,2,3,4,7,7,8,4,4,4,7,7,8,4,4,4,7,7,8,4,4,4,7,7,8,4,4,3,2,1,0],
    [0,1,2,3,4,8,8,8,4,4,4,8,8,8,4,4,4,8,8,8,4,4,4,8,8,8,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,7,7,8,4,4,4,7,7,8,4,4,4,7,7,8,4,4,4,7,7,8,4,4,3,2,1,0],
    [0,1,2,3,4,7,7,8,4,4,4,7,7,8,4,4,4,7,7,8,4,4,4,7,7,8,4,4,3,2,1,0],
    [0,1,2,3,4,8,8,8,4,4,4,8,8,8,4,4,4,8,8,8,4,4,4,8,8,8,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,7,7,8,4,4,4,7,7,8,4,4,4,7,7,8,4,4,4,7,7,8,4,4,3,2,1,0],
    [0,1,2,3,4,7,7,8,4,4,4,7,7,8,4,4,4,7,7,8,4,4,4,7,7,8,4,4,3,2,1,0],
    [0,1,2,3,4,8,8,8,4,4,4,8,8,8,4,4,4,8,8,8,4,4,4,8,8,8,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,7,7,8,4,4,4,7,7,8,4,4,4,7,7,8,4,4,4,7,7,8,4,4,3,2,1,0],
    [0,1,2,3,4,7,7,8,4,4,4,7,7,8,4,4,4,7,7,8,4,4,4,7,7,8,4,4,3,2,1,0],
    [0,1,2,3,4,8,8,8,4,4,4,8,8,8,4,4,4,8,8,8,4,4,4,8,8,8,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,1,5,5,5,5,5,5,1,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,1,5,6,6,6,6,5,1,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,1,5,6,6,6,6,5,1,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,1,5,6,6,6,6,5,1,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,1,5,6,6,6,6,5,1,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,1,5,6,6,6,6,5,1,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,4,4,4,4,4,4,4,4,1,5,6,6,6,6,5,1,4,4,4,4,4,4,4,4,3,2,1,0],
    [0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0],
    [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// Home building (32x40)
const homePalette = {
    1: "#3d2817",  // Dark wood/outline
    2: "#5c3c23",  // Wood mid
    3: "#7a5533",  // Wood light
    4: "#8b4513",  // Roof dark
    5: "#a0522d",  // Roof light
    6: "#87ceeb",  // Window
    7: "#5a9fd4",  // Window shadow
    8: "#f5f5dc",  // Door
    9: "#daa520",  // Door handle
};

const homePixels = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,5,5,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,4,4,5,5,5,5,4,4,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,4,4,5,5,5,5,5,5,4,4,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,4,4,5,5,5,5,5,5,5,5,4,4,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,4,4,5,5,5,5,5,5,5,5,5,5,4,4,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,4,4,5,5,5,5,5,5,5,5,5,5,5,5,4,4,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,4,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,4,4,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,4,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,4,4,0,0,0,0,0,0],
    [0,0,0,0,0,4,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,4,4,0,0,0,0,0],
    [0,0,0,0,4,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,4,4,0,0,0,0],
    [0,0,0,4,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,4,4,0,0,0],
    [0,0,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,0,0],
    [0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0],
    [0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0],
    [0,0,1,2,3,6,6,7,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,6,6,7,3,3,2,1,0,0],
    [0,0,1,2,3,6,6,7,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,6,6,7,3,3,2,1,0,0],
    [0,0,1,2,3,7,7,7,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,7,7,7,3,3,2,1,0,0],
    [0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0],
    [0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0],
    [0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0],
    [0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0],
    [0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0],
    [0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0],
    [0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0],
    [0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0],
    [0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0],
    [0,0,1,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,1,0,0],
    [0,0,1,2,3,3,3,3,3,3,3,3,1,8,8,8,8,8,8,1,3,3,3,3,3,3,3,3,2,1,0,0],
    [0,0,1,2,3,3,3,3,3,3,3,3,1,8,8,8,8,8,8,1,3,3,3,3,3,3,3,3,2,1,0,0],
    [0,0,1,2,3,3,3,3,3,3,3,3,1,8,8,8,9,8,8,1,3,3,3,3,3,3,3,3,2,1,0,0],
    [0,0,1,2,3,3,3,3,3,3,3,3,1,8,8,8,9,8,8,1,3,3,3,3,3,3,3,3,2,1,0,0],
    [0,0,1,2,3,3,3,3,3,3,3,3,1,8,8,8,8,8,8,1,3,3,3,3,3,3,3,3,2,1,0,0],
    [0,0,1,2,3,3,3,3,3,3,3,3,1,8,8,8,8,8,8,1,3,3,3,3,3,3,3,3,2,1,0,0],
    [0,0,1,2,3,3,3,3,3,3,3,3,1,8,8,8,8,8,8,1,3,3,3,3,3,3,3,3,2,1,0,0],
    [0,0,1,2,3,3,3,3,3,3,3,3,1,8,8,8,8,8,8,1,3,3,3,3,3,3,3,3,2,1,0,0],
    [0,0,1,2,3,3,3,3,3,3,3,3,1,8,8,8,8,8,8,1,3,3,3,3,3,3,3,3,2,1,0,0],
    [0,0,1,2,3,3,3,3,3,3,3,3,1,8,8,8,8,8,8,1,3,3,3,3,3,3,3,3,2,1,0,0],
    [0,0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
];

// ============================================
// LOAD ALL SPRITES
// ============================================
k.loadSprite("player", createPixelSprite(16, 24, malePixels, playerPalette));
k.loadSprite("partner", createPixelSprite(16, 24, partnerPixels, partnerPalette));
k.loadSprite("child1", createPixelSprite(12, 18, child1Pixels, child1Palette));
k.loadSprite("child2", createPixelSprite(12, 18, child2Pixels, child2Palette));
k.loadSprite("npc", createPixelSprite(16, 24, malePixels, npcPalette));
k.loadSprite("gym", createPixelSprite(32, 40, gymPixels, buildingPalette));
k.loadSprite("work", createPixelSprite(32, 40, workPixels, buildingPalette));
k.loadSprite("home", createPixelSprite(32, 40, homePixels, homePalette));

// ============================================
// HELPER FUNCTIONS
// ============================================
function formatPlayerStats() {
    return `Energy: ${stats.energy}  Regulation: ${stats.regulation}  Confidence: ${stats.confidence}  Presence: ${stats.presence}`;
}

function formatPlayerStats2() {
    return `Sleep: ${stats.sleep}  Physical: ${stats.physical}  Connection: ${stats.connection}`;
}

function addStatsDisplay() {
    // Dark background panel for readability
    k.add([
        k.rect(520, 42),
        k.pos(5, 5),
        k.color(20, 20, 35),
        k.opacity(0.85),
        k.fixed(),
        k.z(50),
        "statsDisplay",
    ]);
    k.add([
        k.text(formatPlayerStats(), { size: 12 }),
        k.pos(12, 12),
        k.color(255, 255, 255),
        k.fixed(),
        k.z(51),
        "statsDisplay",
        "statsLine1",
    ]);
    k.add([
        k.text(formatPlayerStats2(), { size: 12 }),
        k.pos(12, 28),
        k.color(255, 255, 255),
        k.fixed(),
        k.z(51),
        "statsDisplay",
        "statsLine2",
    ]);
}

function updateStatsDisplay() {
    const line1 = k.get("statsLine1")[0];
    const line2 = k.get("statsLine2")[0];
    if (line1) line1.text = formatPlayerStats();
    if (line2) line2.text = formatPlayerStats2();
}

// Show NPC stats when interacting
function formatNpcStats(npcType) {
    const s = npcStats[npcType];
    if (npcType === "partner") {
        return `Partner - Trust: ${s.trust}  Worry: ${s.worry}`;
    } else if (npcType === "child1") {
        return `Child 1 - Regulation: ${s.regulation}  Security: ${s.security}`;
    } else if (npcType === "child2") {
        return `Child 2 - Anxiety: ${s.anxiety}  Confidence: ${s.confidence}`;
    }
    return "";
}

function addInstructions(text) {
    k.add([
        k.text(text, { size: 12 }),
        k.pos(k.width() / 2, k.height() - 15),
        k.anchor("center"),
        k.opacity(0.7),
        k.fixed(),
    ]);
}

function addPlayer(x, y) {
    return k.add([
        k.sprite("player"),
        k.pos(x, y),
        k.area(),
        k.body(),
        k.anchor("center"),
        k.scale(SCALE),
        "player",
    ]);
}

function setupMovement(player) {
    k.onKeyDown("left", () => {
        player.move(-MOVE_SPEED, 0);
        player.flipX = true;
    });
    k.onKeyDown("right", () => {
        player.move(MOVE_SPEED, 0);
        player.flipX = false;
    });
    k.onKeyDown("up", () => player.move(0, -MOVE_SPEED));
    k.onKeyDown("down", () => player.move(0, MOVE_SPEED));
}

function showChoiceDialog(title, choices, onSelect, npcType = null) {
    // Calculate dialog height based on content
    const hasNpcStats = npcType && npcStats[npcType];
    const dialogHeight = hasNpcStats ? 240 : 200;

    const dialogBg = k.add([
        k.rect(440, dialogHeight),
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center"),
        k.color(30, 30, 50),
        k.outline(3, k.rgb(100, 100, 140)),
        k.fixed(),
        k.z(100),
        "choiceDialog",
    ]);

    k.add([
        k.text(title, { size: 16 }),
        k.pos(k.width() / 2, k.height() / 2 - (hasNpcStats ? 90 : 70)),
        k.anchor("center"),
        k.fixed(),
        k.z(101),
        "choiceDialog",
    ]);

    // Show NPC stats if applicable
    if (hasNpcStats) {
        k.add([
            k.text(formatNpcStats(npcType), { size: 11 }),
            k.pos(k.width() / 2, k.height() / 2 - 60),
            k.anchor("center"),
            k.color(180, 180, 220),
            k.fixed(),
            k.z(101),
            "choiceDialog",
        ]);
    }

    const buttonStartY = hasNpcStats ? -25 : -15;

    choices.forEach((choice, index) => {
        const yOffset = index * 55;
        const button = k.add([
            k.rect(400, 45),
            k.pos(k.width() / 2, k.height() / 2 + buttonStartY + yOffset),
            k.anchor("center"),
            k.color(50, 50, 80),
            k.outline(2, k.rgb(80, 80, 120)),
            k.area(),
            k.fixed(),
            k.z(101),
            "choiceDialog",
            "choiceButton",
        ]);

        k.add([
            k.text(`[${index + 1}] ${choice.text}`, { size: 14 }),
            k.pos(k.width() / 2, k.height() / 2 + buttonStartY + yOffset),
            k.anchor("center"),
            k.fixed(),
            k.z(102),
            "choiceDialog",
        ]);

        button.onHover(() => button.color = k.rgb(70, 70, 110));
        button.onHoverEnd(() => button.color = k.rgb(50, 50, 80));
        button.onClick(() => {
            k.get("choiceDialog").forEach(obj => k.destroy(obj));
            onSelect(choice, npcType);
        });
    });

    // Keyboard shortcuts
    choices.forEach((choice, index) => {
        k.onKeyPress(`${index + 1}`, () => {
            if (k.get("choiceDialog").length) {
                k.get("choiceDialog").forEach(obj => k.destroy(obj));
                onSelect(choice, npcType);
            }
        });
    });
}

function showFeedback(message, isPositive, npcType = null, effects = null) {
    // Main feedback message
    const feedback = k.add([
        k.text(message, { size: 16 }),
        k.pos(k.width() / 2, k.height() - 70),
        k.anchor("center"),
        k.color(isPositive ? k.rgb(100, 200, 100) : k.rgb(200, 100, 100)),
        k.fixed(),
        k.z(100),
        "feedbackDisplay",
    ]);

    // Show NPC stat changes if applicable
    if (npcType && effects && effects.npc) {
        const npcChanges = [];
        const npc = effects.npc;

        if (npcType === "partner") {
            if (npc.trust) npcChanges.push(`Partner Trust ${npc.trust > 0 ? '+' : ''}${npc.trust}`);
            if (npc.worry) npcChanges.push(`Partner Worry ${npc.worry > 0 ? '+' : ''}${npc.worry}`);
        } else if (npcType === "child1") {
            if (npc.regulation) npcChanges.push(`Child 1 Regulation ${npc.regulation > 0 ? '+' : ''}${npc.regulation}`);
            if (npc.security) npcChanges.push(`Child 1 Security ${npc.security > 0 ? '+' : ''}${npc.security}`);
        } else if (npcType === "child2") {
            if (npc.anxiety) npcChanges.push(`Child 2 Anxiety ${npc.anxiety > 0 ? '+' : ''}${npc.anxiety}`);
            if (npc.confidence) npcChanges.push(`Child 2 Confidence ${npc.confidence > 0 ? '+' : ''}${npc.confidence}`);
        }

        if (npcChanges.length > 0) {
            k.add([
                k.text(npcChanges.join("  |  "), { size: 12 }),
                k.pos(k.width() / 2, k.height() - 45),
                k.anchor("center"),
                k.color(isPositive ? k.rgb(150, 220, 150) : k.rgb(220, 150, 150)),
                k.fixed(),
                k.z(100),
                "feedbackDisplay",
            ]);
        }
    }

    k.wait(3, () => k.get("feedbackDisplay").forEach(obj => k.destroy(obj)));
}

function applyEffects(effects, npcType = null) {
    // Calculate amplifier based on low regulation (when dysregulated, bad choices hit harder)
    const regulationAmplifier = stats.regulation < 30 ? 1.5 : (stats.regulation < 50 ? 1.25 : 1);

    // Apply player stat effects
    if (effects.energy) stats.energy = Math.max(0, Math.min(100, stats.energy + effects.energy));
    if (effects.regulation) stats.regulation = Math.max(0, Math.min(100, stats.regulation + effects.regulation));
    if (effects.confidence) stats.confidence = Math.max(0, Math.min(100, stats.confidence + effects.confidence));
    if (effects.presence) stats.presence = Math.max(0, Math.min(100, stats.presence + effects.presence));
    if (effects.sleep) stats.sleep = Math.max(0, Math.min(100, stats.sleep + effects.sleep));
    if (effects.physical) stats.physical = Math.max(0, Math.min(100, stats.physical + effects.physical));
    if (effects.connection) stats.connection = Math.max(0, Math.min(100, stats.connection + effects.connection));

    // Apply NPC stat effects (with amplification for negative effects when dysregulated)
    if (effects.npc && npcType && npcStats[npcType]) {
        const npc = npcStats[npcType];
        Object.keys(effects.npc).forEach(stat => {
            if (npc[stat] !== undefined) {
                let change = effects.npc[stat];
                // Amplify negative effects when regulation is low
                if (change < 0) {
                    change = Math.round(change * regulationAmplifier);
                }
                npc[stat] = Math.max(0, Math.min(100, npc[stat] + change));
            }
        });
    }

    updateStatsDisplay();

    // Check for warnings and game over after a short delay
    k.wait(0.5, () => {
        checkWarnings();
        k.wait(0.3, () => {
            checkGameOver();
        });
    });
}

// ============================================
// WARNING SYSTEM
// ============================================
function checkWarnings() {
    const warnings = [];

    // Player stat warnings
    if (stats.energy <= WARNING_THRESHOLD && stats.energy > CRITICAL_THRESHOLD) {
        warnings.push("Energy critically low — you need rest or you'll crash.");
    }
    if (stats.regulation <= WARNING_THRESHOLD && stats.regulation > CRITICAL_THRESHOLD) {
        warnings.push("Regulation failing — you're close to flooding.");
    }
    if (stats.confidence <= WARNING_THRESHOLD && stats.confidence > CRITICAL_THRESHOLD) {
        warnings.push("Confidence eroding — the slide is taking hold.");
    }
    if (stats.presence <= WARNING_THRESHOLD && stats.presence > CRITICAL_THRESHOLD) {
        warnings.push("Presence fading — your family is noticing.");
    }
    if (stats.sleep <= WARNING_THRESHOLD && stats.sleep > CRITICAL_THRESHOLD) {
        warnings.push("Sleep debt mounting — cognitive capacity shrinking.");
    }
    if (stats.connection <= WARNING_THRESHOLD && stats.connection > CRITICAL_THRESHOLD) {
        warnings.push("Connection weakening — you're isolating.");
    }

    // NPC stat warnings
    if (npcStats.partner.trust <= WARNING_THRESHOLD && npcStats.partner.trust > CRITICAL_THRESHOLD) {
        warnings.push("Partner's trust is shaky — they're feeling shut out.");
    }
    if (npcStats.partner.worry >= 75 && npcStats.partner.worry < 90) {
        warnings.push("Partner's worry is high — they're carrying your weight.");
    }
    if (npcStats.child1.security <= WARNING_THRESHOLD && npcStats.child1.security > CRITICAL_THRESHOLD) {
        warnings.push("Child 1's sense of safety is dropping.");
    }
    if (npcStats.child2.anxiety >= 75 && npcStats.child2.anxiety < 90) {
        warnings.push("Child 2's anxiety is spiking.");
    }

    if (warnings.length > 0) {
        showWarning(warnings[0]); // Show most urgent warning
    }
}

function showWarning(message) {
    // Check if warning already displayed
    if (k.get("warningDisplay").length > 0) return;

    const warningBg = k.add([
        k.rect(k.width() - 40, 50),
        k.pos(k.width() / 2, 70),
        k.anchor("center"),
        k.color(80, 20, 20),
        k.opacity(0.9),
        k.outline(2, k.rgb(200, 50, 50)),
        k.fixed(),
        k.z(90),
        "warningDisplay",
    ]);

    const warningText = k.add([
        k.text("⚠ " + message, { size: 13 }),
        k.pos(k.width() / 2, 70),
        k.anchor("center"),
        k.color(255, 200, 200),
        k.fixed(),
        k.z(91),
        "warningDisplay",
    ]);

    // Fade out after 3 seconds
    k.wait(3.5, () => {
        k.get("warningDisplay").forEach(obj => k.destroy(obj));
    });
}

// ============================================
// GAME OVER SYSTEM
// ============================================
function checkGameOver() {
    // Player stats hitting zero
    if (stats.energy <= CRITICAL_THRESHOLD) {
        triggerGameOver("energy");
        return;
    }
    if (stats.regulation <= CRITICAL_THRESHOLD) {
        triggerGameOver("regulation");
        return;
    }
    if (stats.confidence <= CRITICAL_THRESHOLD) {
        triggerGameOver("confidence");
        return;
    }
    if (stats.presence <= CRITICAL_THRESHOLD) {
        triggerGameOver("presence");
        return;
    }
    if (stats.sleep <= CRITICAL_THRESHOLD) {
        triggerGameOver("sleep");
        return;
    }
    if (stats.connection <= CRITICAL_THRESHOLD) {
        triggerGameOver("connection");
        return;
    }

    // NPC critical states
    if (npcStats.partner.trust <= CRITICAL_THRESHOLD) {
        triggerGameOver("partnerTrust");
        return;
    }
    if (npcStats.partner.worry >= 95) {
        triggerGameOver("partnerWorry");
        return;
    }
    if (npcStats.child1.security <= CRITICAL_THRESHOLD) {
        triggerGameOver("child1Security");
        return;
    }
    if (npcStats.child2.anxiety >= 95) {
        triggerGameOver("child2Anxiety");
        return;
    }
}

function triggerGameOver(reason) {
    k.go("gameOver", { reason: reason });
}

function resetAllStats() {
    // Reset player stats
    stats.energy = 100;
    stats.regulation = 100;
    stats.confidence = 100;
    stats.presence = 100;
    stats.sleep = 100;
    stats.physical = 50;
    stats.connection = 75;

    // Reset NPC stats
    npcStats.partner.trust = 80;
    npcStats.partner.worry = 30;
    npcStats.child1.regulation = 70;
    npcStats.child1.security = 80;
    npcStats.child2.anxiety = 40;
    npcStats.child2.confidence = 70;
}

// ============================================
// HUB WORLD SCENE
// ============================================
k.scene("hub", () => {
    // Ground
    k.add([
        k.rect(k.width(), 150),
        k.pos(0, k.height() - 150),
        k.color(34, 139, 34),
        k.fixed(),
    ]);

    // Path
    k.add([
        k.rect(k.width(), 30),
        k.pos(0, k.height() - 100),
        k.color(139, 119, 101),
        k.fixed(),
    ]);

    // Buildings
    const gymBuilding = k.add([
        k.sprite("gym"),
        k.pos(130, k.height() - 220),
        k.anchor("center"),
        k.scale(3),
        k.area(),
        "building",
        { name: "gym", label: "GYM" },
    ]);

    const workBuilding = k.add([
        k.sprite("work"),
        k.pos(400, k.height() - 220),
        k.anchor("center"),
        k.scale(3),
        k.area(),
        "building",
        { name: "work", label: "WORK" },
    ]);

    const homeBuilding = k.add([
        k.sprite("home"),
        k.pos(670, k.height() - 220),
        k.anchor("center"),
        k.scale(3),
        k.area(),
        "building",
        { name: "home", label: "HOME" },
    ]);

    // Building labels
    [gymBuilding, workBuilding, homeBuilding].forEach(b => {
        k.add([
            k.text(b.label, { size: 16 }),
            k.pos(b.pos.x, b.pos.y - 75),
            k.anchor("center"),
            k.color(255, 255, 255),
        ]);
    });

    // Player
    const player = addPlayer(k.width() / 2, k.height() - 85);
    setupMovement(player);

    // Interaction prompt
    const prompt = k.add([
        k.text("", { size: 14 }),
        k.pos(0, 0),
        k.anchor("center"),
        k.opacity(0),
        k.fixed(),
    ]);

    let nearBuilding = null;

    player.onCollide("building", (b) => {
        nearBuilding = b;
        prompt.text = `Press SPACE to enter ${b.label}`;
        prompt.pos = k.vec2(k.width() / 2, k.height() - 130);
        prompt.opacity = 1;
    });

    player.onCollideEnd("building", () => {
        nearBuilding = null;
        prompt.opacity = 0;
    });

    k.onKeyPress("space", () => {
        if (nearBuilding) {
            k.go(nearBuilding.name);
        }
    });

    // Keep player in bounds (allow walking up to buildings)
    player.onUpdate(() => {
        if (player.pos.y > k.height() - 60) player.pos.y = k.height() - 60;
        if (player.pos.y < 120) player.pos.y = 120;
        if (player.pos.x < 50) player.pos.x = 50;
        if (player.pos.x > k.width() - 50) player.pos.x = k.width() - 50;
    });

    addStatsDisplay();
    addInstructions("Arrow keys to move | SPACE to enter buildings");
});

// ============================================
// GYM SCENE
// ============================================
k.scene("gym", () => {
    // Floor
    k.add([
        k.rect(k.width(), k.height()),
        k.pos(0, 0),
        k.color(60, 60, 80),
    ]);

    // Gym floor mat area
    k.add([
        k.rect(k.width() - 100, k.height() - 150),
        k.pos(50, 100),
        k.color(80, 80, 100),
    ]);

    // Equipment representations (simple rectangles for now)
    // Treadmill
    k.add([
        k.rect(60, 100),
        k.pos(100, 150),
        k.color(40, 40, 60),
        k.outline(2, k.rgb(100, 100, 120)),
    ]);
    k.add([
        k.text("TREADMILL", { size: 10 }),
        k.pos(130, 200),
        k.anchor("center"),
    ]);

    // Weights
    k.add([
        k.rect(80, 60),
        k.pos(250, 170),
        k.color(50, 50, 70),
        k.outline(2, k.rgb(100, 100, 120)),
    ]);
    k.add([
        k.text("WEIGHTS", { size: 10 }),
        k.pos(290, 200),
        k.anchor("center"),
    ]);

    // Bench
    k.add([
        k.rect(100, 40),
        k.pos(400, 180),
        k.color(60, 40, 30),
        k.outline(2, k.rgb(100, 80, 60)),
    ]);
    k.add([
        k.text("BENCH", { size: 10 }),
        k.pos(450, 200),
        k.anchor("center"),
    ]);

    // Trainer NPC
    const trainer = k.add([
        k.sprite("npc"),
        k.pos(600, 350),
        k.area(),
        k.body({ isStatic: true }),
        k.anchor("center"),
        k.scale(SCALE),
        "npc",
        {
            name: "Trainer",
            scenarios: [
                {
                    title: "Morning Workout",
                    choices: [
                        { text: "Full workout - let's go!", effect: { energy: -15, confidence: 20, regulation: 15, physical: 15, sleep: 10 } },
                        { text: "Just 10 minutes today", effect: { energy: -5, confidence: 5, regulation: 5, physical: 5, sleep: 5 } },
                    ]
                },
                {
                    title: "Day 2 of Skipping",
                    choices: [
                        { text: "Break the slide - show up", effect: { energy: -10, confidence: 25, regulation: 20, physical: 10 } },
                        { text: "Tomorrow for sure...", effect: { energy: 0, confidence: -15, regulation: -10, physical: -10 } },
                    ]
                },
                {
                    title: "Feeling Depleted But It's Gym Day",
                    choices: [
                        { text: "Light session - something beats nothing", effect: { energy: -5, confidence: 15, regulation: 10, physical: 8 } },
                        { text: "Rest day - you'll hit it hard tomorrow", effect: { energy: 10, confidence: -5, regulation: 0, physical: -5 } },
                    ]
                },
                {
                    title: "Week 2 Momentum Building",
                    choices: [
                        { text: "Stay consistent - trust the process", effect: { energy: -10, confidence: 20, regulation: 15, physical: 15, sleep: 10 } },
                        { text: "Push harder - make up for lost time", effect: { energy: -25, confidence: 10, regulation: -5, physical: 10, sleep: -10 } },
                    ]
                },
            ]
        }
    ]);

    k.add([
        k.text("TRAINER", { size: 12 }),
        k.pos(600, 300),
        k.anchor("center"),
    ]);

    const player = addPlayer(400, 400);
    setupMovement(player);

    // Make NPC face the player
    k.onUpdate(() => {
        if (player.pos.x < trainer.pos.x) {
            trainer.flipX = true;
        } else {
            trainer.flipX = false;
        }
    });

    let nearNpc = null;

    player.onCollide("npc", (npc) => {
        nearNpc = npc;
    });

    player.onCollideEnd("npc", () => {
        nearNpc = null;
    });

    k.onKeyPress("space", () => {
        if (nearNpc && !k.get("choiceDialog").length) {
            const scenario = nearNpc.scenarios[Math.floor(Math.random() * nearNpc.scenarios.length)];
            showChoiceDialog(scenario.title, scenario.choices, (choice) => {
                applyEffects(choice.effect);
                const positive = (choice.effect.confidence + choice.effect.regulation) > 0;
                showFeedback(positive ? "Good choice. Building momentum." : "The slide continues...", positive);
            });
        }
    });

    k.onKeyPress("escape", () => k.go("hub"));

    addStatsDisplay();
    addInstructions("Arrow keys to move | SPACE to interact | ESC to leave");
});

// ============================================
// WORK SCENE
// ============================================
k.scene("work", () => {
    // Office floor
    k.add([
        k.rect(k.width(), k.height()),
        k.pos(0, 0),
        k.color(240, 235, 220),
    ]);

    // Desks with computers
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
            const x = 120 + col * 220;
            const y = 150 + row * 150;

            // Desk
            k.add([
                k.rect(120, 60),
                k.pos(x, y),
                k.color(139, 90, 43),
                k.outline(2, k.rgb(100, 60, 30)),
            ]);

            // Monitor
            k.add([
                k.rect(50, 35),
                k.pos(x + 35, y - 30),
                k.color(30, 30, 40),
                k.outline(2, k.rgb(60, 60, 80)),
            ]);
        }
    }

    // Coworker NPC
    const coworker = k.add([
        k.sprite("npc"),
        k.pos(200, 380),
        k.area(),
        k.body({ isStatic: true }),
        k.anchor("center"),
        k.scale(SCALE),
        "npc",
        {
            name: "Coworker",
            scenarios: [
                {
                    title: "Urgent Meeting Request",
                    choices: [
                        { text: "Set boundaries - protect your time", effect: { energy: -5, confidence: 10, regulation: 5, presence: 5 } },
                        { text: "Accept everything - don't rock the boat", effect: { energy: -20, confidence: -5, regulation: -10, presence: -10 } },
                    ]
                },
                {
                    title: "End of Draining Day",
                    choices: [
                        { text: "Leave on time - you need recovery", effect: { energy: 10, confidence: 5, regulation: 10, presence: 15, sleep: 15 } },
                        { text: "Stay late - prove your worth", effect: { energy: -25, confidence: 0, regulation: -15, presence: -20, sleep: -20 } },
                    ]
                },
                {
                    title: "Intellectually Unstimulating Task",
                    choices: [
                        { text: "Do it efficiently, move on", effect: { energy: -10, confidence: 5, regulation: 0 } },
                        { text: "Procrastinate - find something interesting", effect: { energy: -5, confidence: -10, regulation: -5, sleep: -5 } },
                    ]
                },
                {
                    title: "Autonomy Challenged (Micromanagement)",
                    choices: [
                        { text: "Pick your battles - let this one go", effect: { energy: -10, confidence: -5, regulation: -10 } },
                        { text: "Push back professionally - protect your autonomy", effect: { energy: -15, confidence: 15, regulation: 5 } },
                    ]
                },
            ]
        }
    ]);

    k.add([
        k.text("COWORKER", { size: 12 }),
        k.pos(200, 330),
        k.anchor("center"),
        k.color(0, 0, 0),
    ]);

    const player = addPlayer(600, 400);
    setupMovement(player);

    // Make NPC face the player
    k.onUpdate(() => {
        if (player.pos.x < coworker.pos.x) {
            coworker.flipX = true;
        } else {
            coworker.flipX = false;
        }
    });

    let nearNpc = null;

    player.onCollide("npc", (npc) => {
        nearNpc = npc;
    });

    player.onCollideEnd("npc", () => {
        nearNpc = null;
    });

    k.onKeyPress("space", () => {
        if (nearNpc && !k.get("choiceDialog").length) {
            const scenario = nearNpc.scenarios[Math.floor(Math.random() * nearNpc.scenarios.length)];
            showChoiceDialog(scenario.title, scenario.choices, (choice) => {
                applyEffects(choice.effect);
                const positive = (choice.effect.confidence + choice.effect.regulation) > 0;
                showFeedback(positive ? "Protecting your energy." : "Tank depleting...", positive);
            });
        }
    });

    k.onKeyPress("escape", () => k.go("hub"));

    addStatsDisplay();
    addInstructions("Arrow keys to move | SPACE to interact | ESC to leave");
});

// ============================================
// HOME SCENE
// ============================================
k.scene("home", () => {
    // Living room walls
    k.add([
        k.rect(k.width(), k.height()),
        k.pos(0, 0),
        k.color(255, 248, 235),
    ]);

    // Hardwood floor
    k.add([
        k.rect(k.width(), 200),
        k.pos(0, k.height() - 200),
        k.color(160, 110, 60),
    ]);

    // Floor path/rug - guides player to family area
    k.add([
        k.rect(500, 80),
        k.pos(150, k.height() - 140),
        k.color(120, 80, 80),
        k.outline(2, k.rgb(100, 60, 60)),
    ]);

    // Rug pattern (center stripe)
    k.add([
        k.rect(460, 20),
        k.pos(170, k.height() - 110),
        k.color(140, 100, 100),
    ]);

    // Couch
    k.add([
        k.rect(180, 60),
        k.pos(30, k.height() - 250),
        k.color(100, 80, 120),
        k.outline(3, k.rgb(70, 50, 90)),
    ]);
    k.add([
        k.text("COUCH", { size: 10 }),
        k.pos(120, k.height() - 220),
        k.anchor("center"),
        k.color(50, 50, 50),
    ]);

    // TV
    k.add([
        k.rect(100, 70),
        k.pos(350, k.height() - 320),
        k.color(20, 20, 30),
        k.outline(3, k.rgb(50, 50, 60)),
    ]);

    // Partner NPC
    const partner = k.add([
        k.sprite("partner"),
        k.pos(320, k.height() - 100),
        k.area(),
        k.body({ isStatic: true }),
        k.anchor("center"),
        k.scale(SCALE),
        "npc",
        {
            name: "Partner",
            npcType: "partner",
            scenarios: [
                {
                    title: "Partner Check-in",
                    choices: [
                        {
                            text: "Open up - share how you're feeling",
                            effect: { energy: 5, confidence: 10, regulation: 20, connection: 15,
                                npc: { trust: 15, worry: -20 } }
                        },
                        {
                            text: "Say you're fine - don't be a burden",
                            effect: { energy: -5, confidence: -5, regulation: -10, connection: -10,
                                npc: { trust: -10, worry: 15 } }
                        },
                    ]
                },
                {
                    title: "Partner Offers Help",
                    choices: [
                        {
                            text: "Accept support - you need it",
                            effect: { energy: 15, confidence: 5, regulation: 15, connection: 20,
                                npc: { trust: 20, worry: -15 } }
                        },
                        {
                            text: "Decline - handle it yourself",
                            effect: { energy: -10, confidence: 0, regulation: -5, connection: -15,
                                npc: { trust: -15, worry: 20 } }
                        },
                    ]
                },
            ]
        }
    ]);

    k.add([
        k.text("PARTNER", { size: 12 }),
        k.pos(320, k.height() - 160),
        k.anchor("center"),
        k.color(50, 50, 50),
    ]);

    // Child 1
    const child1 = k.add([
        k.sprite("child1"),
        k.pos(480, k.height() - 100),
        k.area(),
        k.body({ isStatic: true }),
        k.anchor("center"),
        k.scale(SCALE),
        "npc",
        {
            name: "Child 1",
            npcType: "child1",
            scenarios: [
                {
                    title: "Moment of Overwhelm",
                    choices: [
                        {
                            text: "Stay calm - meet them where they are",
                            effect: { energy: -15, confidence: 10, regulation: 5, presence: 15,
                                npc: { regulation: 20, security: 15 } }
                        },
                        {
                            text: "Get frustrated - you're depleted too",
                            effect: { energy: -5, confidence: -15, regulation: -25, presence: -20,
                                npc: { regulation: -25, security: -20 } }
                        },
                    ]
                },
                {
                    title: "Wants Your Attention (You're Deep in Thought)",
                    choices: [
                        {
                            text: "Pause and engage - they need you now",
                            effect: { energy: -10, confidence: 10, regulation: 0, presence: 20,
                                npc: { regulation: 15, security: 20 } }
                        },
                        {
                            text: "Just a minute... (keep doing your thing)",
                            effect: { energy: 0, confidence: -5, regulation: -10, presence: -15,
                                npc: { regulation: -10, security: -15 } }
                        },
                    ]
                },
            ]
        }
    ]);

    // Child 2
    const child2 = k.add([
        k.sprite("child2"),
        k.pos(580, k.height() - 100),
        k.area(),
        k.body({ isStatic: true }),
        k.anchor("center"),
        k.scale(SCALE),
        "npc",
        {
            name: "Child 2",
            npcType: "child2",
            scenarios: [
                {
                    title: "Anxious About School",
                    choices: [
                        {
                            text: "Patient listening - validate their feelings",
                            effect: { energy: -10, confidence: 15, regulation: 10, presence: 15,
                                npc: { anxiety: -20, confidence: 20 } }
                        },
                        {
                            text: "Quick fix - 'you'll be fine'",
                            effect: { energy: -5, confidence: -10, regulation: -15, presence: -10,
                                npc: { anxiety: 15, confidence: -15 } }
                        },
                    ]
                },
                {
                    title: "Won't Eat Dinner (Food Concerns)",
                    choices: [
                        {
                            text: "No pressure - offer alternatives calmly",
                            effect: { energy: -10, confidence: 10, regulation: 5, presence: 10,
                                npc: { anxiety: -15, confidence: 15 } }
                        },
                        {
                            text: "You need to eat something (push it)",
                            effect: { energy: -5, confidence: -5, regulation: -20, presence: -15,
                                npc: { anxiety: 25, confidence: -20 } }
                        },
                    ]
                },
            ]
        }
    ]);

    k.add([
        k.text("CHILDREN", { size: 12 }),
        k.pos(530, k.height() - 160),
        k.anchor("center"),
        k.color(50, 50, 50),
    ]);

    // Player starts on the left side of the rug
    const player = addPlayer(200, k.height() - 100);
    setupMovement(player);

    // Make NPCs face the player
    const allNpcs = [partner, child1, child2];
    k.onUpdate(() => {
        allNpcs.forEach(npc => {
            if (player.pos.x < npc.pos.x) {
                npc.flipX = true;
            } else {
                npc.flipX = false;
            }
        });
    });

    let nearNpc = null;

    player.onCollide("npc", (npc) => {
        nearNpc = npc;
    });

    player.onCollideEnd("npc", () => {
        nearNpc = null;
    });

    k.onKeyPress("space", () => {
        if (nearNpc && !k.get("choiceDialog").length) {
            const scenario = nearNpc.scenarios[Math.floor(Math.random() * nearNpc.scenarios.length)];
            const npcType = nearNpc.npcType;
            showChoiceDialog(`${nearNpc.name}: ${scenario.title}`, scenario.choices, (choice, nType) => {
                applyEffects(choice.effect, nType);
                const positive = (choice.effect.confidence + choice.effect.regulation) > 0;
                showFeedback(
                    positive ? "Staying present." : "Collision triggered...",
                    positive,
                    nType,
                    choice.effect
                );
            }, npcType);
        }
    });

    k.onKeyPress("escape", () => k.go("hub"));

    // Keep player in bounds (allow movement around the room)
    player.onUpdate(() => {
        if (player.pos.y > k.height() - 60) player.pos.y = k.height() - 60;
        if (player.pos.y < 150) player.pos.y = 150;
        if (player.pos.x < 50) player.pos.x = 50;
        if (player.pos.x > k.width() - 50) player.pos.x = k.width() - 50;
    });

    addStatsDisplay();
    addInstructions("Arrow keys to move | SPACE to interact | ESC to leave");
});

// ============================================
// GAME OVER SCENE
// ============================================
k.scene("gameOver", ({ reason }) => {
    const condition = gameOverConditions[reason];

    // Dark background
    k.add([
        k.rect(k.width(), k.height()),
        k.pos(0, 0),
        k.color(15, 15, 25),
    ]);

    // Red vignette effect
    k.add([
        k.rect(k.width(), k.height()),
        k.pos(0, 0),
        k.color(60, 10, 10),
        k.opacity(0.3),
    ]);

    // Title
    k.add([
        k.text(condition.title, { size: 36 }),
        k.pos(k.width() / 2, 80),
        k.anchor("center"),
        k.color(200, 50, 50),
    ]);

    // Message
    const lines = condition.message.split('\n');
    lines.forEach((line, i) => {
        k.add([
            k.text(line, { size: 16 }),
            k.pos(k.width() / 2, 160 + i * 28),
            k.anchor("center"),
            k.color(200, 200, 200),
        ]);
    });

    // Lesson box
    k.add([
        k.rect(k.width() - 80, 70),
        k.pos(k.width() / 2, 290),
        k.anchor("center"),
        k.color(30, 50, 40),
        k.outline(2, k.rgb(80, 150, 100)),
    ]);

    k.add([
        k.text("LESSON:", { size: 12 }),
        k.pos(k.width() / 2, 265),
        k.anchor("center"),
        k.color(100, 180, 120),
    ]);

    k.add([
        k.text(condition.lesson, { size: 14 }),
        k.pos(k.width() / 2, 295),
        k.anchor("center"),
        k.color(180, 220, 190),
    ]);

    // Final stats display
    k.add([
        k.text("Final Stats:", { size: 12 }),
        k.pos(k.width() / 2, 360),
        k.anchor("center"),
        k.color(120, 120, 140),
    ]);

    k.add([
        k.text(`Energy: ${stats.energy}  Regulation: ${stats.regulation}  Confidence: ${stats.confidence}  Presence: ${stats.presence}`, { size: 11 }),
        k.pos(k.width() / 2, 380),
        k.anchor("center"),
        k.color(100, 100, 120),
    ]);

    k.add([
        k.text(`Partner Trust: ${npcStats.partner.trust}  Child 1 Security: ${npcStats.child1.security}  Child 2 Anxiety: ${npcStats.child2.anxiety}`, { size: 11 }),
        k.pos(k.width() / 2, 398),
        k.anchor("center"),
        k.color(100, 100, 120),
    ]);

    // Restart button
    const restartBtn = k.add([
        k.rect(200, 50),
        k.pos(k.width() / 2, 455),
        k.anchor("center"),
        k.color(50, 80, 50),
        k.outline(2, k.rgb(100, 150, 100)),
        k.area(),
    ]);

    k.add([
        k.text("TRY AGAIN", { size: 18 }),
        k.pos(k.width() / 2, 455),
        k.anchor("center"),
        k.color(180, 220, 180),
    ]);

    restartBtn.onHover(() => restartBtn.color = k.rgb(70, 110, 70));
    restartBtn.onHoverEnd(() => restartBtn.color = k.rgb(50, 80, 50));

    restartBtn.onClick(() => {
        resetAllStats();
        k.go("hub");
    });

    k.onKeyPress("space", () => {
        resetAllStats();
        k.go("hub");
    });

    k.add([
        k.text("Press SPACE or click to restart", { size: 11 }),
        k.pos(k.width() / 2, k.height() - 20),
        k.anchor("center"),
        k.color(80, 80, 100),
    ]);
});

// ============================================
// START GAME
// ============================================
k.go("hub");
