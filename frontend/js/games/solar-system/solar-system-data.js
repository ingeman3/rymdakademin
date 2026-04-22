import { randomInt, shuffle } from '../../shared/math.js';

export const PLANETS = [
  {
    name: 'Merkurius',
    className: 'mercury',
    size: 78,
    fact: 'Merkurius är närmast solen. Den är liten och kan bli väldigt varm.',
    questionMode: 'addition',
  },
  {
    name: 'Venus',
    className: 'venus',
    size: 92,
    fact: 'Venus lyser starkt på himlen. Den har tjocka moln runt sig.',
    questionMode: 'addition',
  },
  {
    name: 'Jorden',
    className: 'earth',
    size: 104,
    fact: 'Jorden är vår hemplanet. Här börjar och slutar uppdraget.',
    questionMode: 'mixed',
  },
  {
    name: 'Mars',
    className: 'mars',
    size: 88,
    fact: 'Mars kallas den röda planeten. Där finns höga berg och kalla öknar.',
    questionMode: 'mixed',
  },
  {
    name: 'Jupiter',
    className: 'jupiter',
    size: 146,
    fact: 'Jupiter är störst av alla planeter. Den har stora stormar och många månar.',
    questionMode: 'mixed',
  },
  {
    name: 'Saturnus',
    className: 'saturn',
    size: 130,
    fact: 'Saturnus har stora ringar av is och sten. Ringarna syns som ett ljust band.',
    questionMode: 'mixed',
  },
  {
    name: 'Uranus',
    className: 'uranus',
    size: 108,
    fact: 'Uranus är en kall blågrön planet. Den snurrar nästan på sidan.',
    questionMode: 'subtraction',
  },
  {
    name: 'Neptunus',
    className: 'neptune',
    size: 112,
    fact: 'Neptunus är längst bort av dessa planeter. Där blåser mycket starka vindar.',
    questionMode: 'subtraction',
  },
];

export const HOME_PLANET_INDEX = PLANETS.findIndex((planet) => planet.name === 'Jorden');
export const LAST_PLANET_INDEX = PLANETS.length - 1;
export const MISSION_PLANET_INDEXES = PLANETS
  .map((_, index) => index)
  .filter((index) => index !== HOME_PLANET_INDEX);

export function planetPoint(index) {
  return {
    x: 12.5 + index * (80 / LAST_PLANET_INDEX),
    y: 50 + Math.sin(index * 0.92) * 7,
  };
}

export function createPlanetQuestion(index) {
  return createMathQuestion(PLANETS[index].questionMode);
}

function createMathQuestion(mode = 'mixed') {
  const operation = mode === 'mixed'
    ? (Math.random() > 0.5 ? 'addition' : 'subtraction')
    : mode;

  if (operation === 'subtraction') {
    const left = randomInt(0, 10);
    const right = randomInt(0, left);
    return buildQuestion(left, right, left - right, '-');
  }

  const left = randomInt(0, 10);
  const right = randomInt(0, 10 - left);
  return buildQuestion(left, right, left + right, '+');
}

function buildQuestion(left, right, correct, operator) {
  const choices = new Set([correct]);

  while (choices.size < 3) {
    choices.add(Math.max(0, Math.min(10, correct + randomInt(-3, 3))));
  }

  return {
    left,
    right,
    correct,
    operator,
    choices: shuffle([...choices]),
  };
}
