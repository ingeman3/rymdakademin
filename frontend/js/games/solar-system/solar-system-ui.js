import { easeInOutCubic, lerp, quadraticBezier } from '../../shared/math.js';
import { HOME_PLANET_INDEX, MISSION_PLANET_INDEXES, PLANETS, planetPoint } from './solar-system-data.js';

export function createSolarSystemUi(handlers) {
  const route = document.getElementById('route');
  const ship = document.getElementById('ship');
  const spaceMap = document.querySelector('.space-map');
  const missionOverlay = document.getElementById('missionOverlay');
  const controlPanel = document.querySelector('.control-panel');
  const scoreStatus = document.getElementById('scoreStatus');
  const starDisplay = document.getElementById('starDisplay');
  const missionText = document.getElementById('missionText');
  const popupPlanetIcon = document.getElementById('popupPlanetIcon');
  const planetFactText = document.getElementById('planetFactText');
  const mathPromptText = document.getElementById('mathPromptText');
  const questionText = document.getElementById('questionText');
  const answers = document.getElementById('answers');
  const feedbackText = document.getElementById('feedbackText');
  const speechText = document.getElementById('speechText');
  const starsPanel = document.querySelector('.stars-panel');

  let shipPosition = planetPoint(HOME_PLANET_INDEX);
  let animationFrame = null;
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersReducedMotion = () => reducedMotionQuery.matches;

  function setupPlanets() {
    route.innerHTML = '';

    PLANETS.forEach((planetData, index) => {
      const planet = document.createElement('button');
      const point = planetPoint(index);

      planet.className = `planet planet-${planetData.className}`;
      planet.dataset.index = index;
      planet.type = 'button';
      planet.style.setProperty('--planet-size', `${planetData.size}px`);
      planet.style.left = `${point.x}%`;
      planet.style.top = `${point.y}%`;
      planet.title = planetData.name;

      const ring = document.createElement('span');
      ring.className = 'planet-ring';

      const surface = document.createElement('span');
      surface.className = 'planet-surface';

      const detail = document.createElement('span');
      detail.className = 'planet-detail';

      const number = document.createElement('span');
      number.className = 'planet-number';
      number.textContent = String(index + 1);

      const check = document.createElement('span');
      check.className = 'planet-check';
      check.textContent = '★';

      surface.append(detail, number, check);

      const hereLabel = document.createElement('span');
      hereLabel.className = 'here-label';
      hereLabel.textContent = 'Du är här';

      const name = document.createElement('span');
      name.className = 'planet-name';
      name.textContent = planetData.name;

      planet.append(ring, surface, hereLabel, name);
      planet.addEventListener('click', () => handlers.onPlanetSelected(index));
      route.appendChild(planet);
    });
  }

  function renderState(state) {
    renderStars(state.visualStars);
    markPlanets(state);
  }

  function renderStars(visualStars) {
    starDisplay.textContent = MISSION_PLANET_INDEXES
      .map((_, index) => (index < visualStars ? '★' : '☆'))
      .join(' ');
    scoreStatus.textContent = `${visualStars} / ${MISSION_PLANET_INDEXES.length} uppdrag klara`;
  }

  function markPlanets(state) {
    document.querySelectorAll('.planet').forEach((planet) => {
      const index = Number(planet.dataset.index);
      const isCompleted = state.completedPlanets.has(index);
      const isHomeLocked = index === HOME_PLANET_INDEX && state.missionStarted && !state.allMissionsCompleted;
      const isHomeUnlocked = index === HOME_PLANET_INDEX && state.missionStarted && state.allMissionsCompleted;
      const isSelectable = state.missionStarted
        && !state.locked
        && index !== state.currentPlanet
        && state.canSelectPlanet(index);

      planet.classList.toggle('reached', index === state.currentPlanet || isCompleted);
      planet.classList.toggle('current', index === state.currentPlanet);
      planet.classList.toggle('target', state.selectedPlanet === index);
      planet.classList.toggle('completed', isCompleted);
      planet.classList.toggle('selectable', isSelectable);
      planet.classList.toggle('locked-home', isHomeLocked);
      planet.classList.toggle('unlocked-home', isHomeUnlocked);
      planet.disabled = !isSelectable;

      if (index === HOME_PLANET_INDEX && !state.missionStarted) {
        planet.disabled = true;
      }
    });
  }

  function showIntro(totalStars) {
    setPopupPlanet(HOME_PLANET_INDEX);
    missionText.textContent = 'Uppdrag från Jorden';
    planetFactText.textContent = 'Besök alla andra planeter och lös deras matteuppdrag. När alla stjärnor är samlade får du återvända hem till Jorden.';
    mathPromptText.textContent = 'Solsystemsresan';
    questionText.textContent = `${totalStars} uppdrag väntar`;
    feedbackText.textContent = 'Klicka på startknappen när du är redo, pilot.';
    speechText.textContent = 'Uppdrag från Jorden. Besök alla andra planeter och lös deras matteuppdrag. När alla stjärnor är samlade får du återvända hem till Jorden.';
    controlPanel.classList.remove('success', 'correct-pulse', 'wrong-pulse');
    answers.innerHTML = '';
    answers.appendChild(createActionButton('Starta uppdraget', handlers.onMissionStarted));
    openMissionPopup();
  }

  function showPlanetMission(index, question) {
    const planetData = PLANETS[index];

    setPopupPlanet(index);
    questionText.textContent = `${question.left} ${question.operator} ${question.right} = ?`;
    missionText.textContent = `Landning klar på ${planetData.name}`;
    planetFactText.textContent = planetData.fact;
    mathPromptText.textContent = 'Lös planetens matteuppdrag';
    feedbackText.textContent = 'Svara rätt för att samla en stjärna.';
    speechText.textContent = buildSpeechText(planetData, question);
    answers.innerHTML = '';
    controlPanel.classList.remove('success', 'correct-pulse', 'wrong-pulse');

    question.choices.forEach((choice) => {
      const button = document.createElement('button');
      button.className = 'answer-button';
      button.type = 'button';
      button.textContent = choice;
      button.addEventListener('click', () => handlers.onAnswer(choice, button));
      answers.appendChild(button);
    });

    openMissionPopup();
  }

  function showWrongAnswer(button) {
    button.disabled = true;
    button.classList.add('wrong');
    feedbackText.textContent = 'Nästan, pilot. Prova ett annat svar.';
    restartPanelAnimation('wrong-pulse');
  }

  function showCorrectAnswer() {
    setButtonsDisabled(true);
    feedbackText.textContent = 'Rätt! Stjärnan flyger till samlingen.';
    missionText.textContent = 'Uppdrag slutfört';
    restartPanelAnimation('correct-pulse');
  }

  function showFinish() {
    setButtonsDisabled(true);
    setPopupPlanet(HOME_PLANET_INDEX);
    missionText.textContent = 'Välkommen hem, pilot!';
    planetFactText.textContent = 'Alla planetuppdrag är klara. Du samlade stjärnor från hela solsystemet och återvände till Jorden.';
    mathPromptText.textContent = 'Solsystemsresan är klar';
    questionText.textContent = 'Uppdrag slutfört!';
    answers.innerHTML = '';
    feedbackText.textContent = 'Bra jobbat, pilot!';
    speechText.textContent = 'Välkommen hem, pilot. Alla planetuppdrag är klara.';
    controlPanel.classList.add('success');
    openMissionPopup();
  }

  function createActionButton(label, onClick) {
    const button = document.createElement('button');
    button.className = 'answer-button action-button';
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', onClick);
    return button;
  }

  function flyToPlanet(destination, onArrival) {
    const start = { ...shipPosition };
    const end = planetPoint(destination);

    if (prefersReducedMotion()) {
      shipPosition = end;
      setShipPosition(shipPosition, 0);
      onArrival();
      return;
    }

    const startedAt = performance.now();
    const distance = Math.hypot(end.x - start.x, end.y - start.y);
    const duration = Math.min(1800, 1080 + distance * 18);
    const direction = end.x >= start.x ? 1 : -1;
    const arcHeight = Math.min(24, 10 + distance * 0.34);

    window.cancelAnimationFrame(animationFrame);
    spaceMap.classList.add('flying');

    function step(now) {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = easeInOutCubic(progress);
      const arc = Math.sin(eased * Math.PI) * arcHeight;
      const drift = Math.sin(eased * Math.PI * 2) * 2.2;

      shipPosition = {
        x: lerp(start.x, end.x, eased),
        y: lerp(start.y, end.y, eased) - arc + drift,
      };

      const travelTilt = Math.max(-18, Math.min(18, (end.y - start.y) * 1.25 - arc * 0.16));
      setShipPosition(shipPosition, direction * 3 + travelTilt * Math.cos((eased - 0.5) * Math.PI));

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(step);
        return;
      }

      shipPosition = end;
      setShipPosition(shipPosition, 0);
      spaceMap.classList.remove('flying');
      onArrival();
    }

    animationFrame = window.requestAnimationFrame(step);
  }

  function setShipPosition(point, rotation) {
    ship.style.left = `${point.x}%`;
    ship.style.top = `${point.y}%`;
    ship.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
  }

  function pulsePlanet(index) {
    const planet = document.querySelector(`.planet[data-index="${index}"]`);

    if (!planet) {
      return;
    }

    planet.classList.remove('arrival');
    void planet.offsetWidth;
    planet.classList.add('arrival');
  }

  function animateStarCollection(planetIndex, nextVisualStars, onCollected) {
    const planet = document.querySelector(`.planet[data-index="${planetIndex}"]`);

    if (!planet || !starDisplay || prefersReducedMotion()) {
      renderStars(nextVisualStars);
      pulseStarBar();
      if (onCollected) {
        onCollected();
      }
      return;
    }

    const startRect = planet.getBoundingClientRect();
    const endRect = starDisplay.getBoundingClientRect();
    const start = {
      x: startRect.left + startRect.width / 2,
      y: startRect.top + startRect.height / 2,
    };
    const end = {
      x: endRect.left + endRect.width / 2,
      y: endRect.top + endRect.height / 2,
    };
    const control = {
      x: (start.x + end.x) / 2,
      y: Math.min(start.y, end.y) - 120,
    };
    const star = document.createElement('div');
    const startedAt = performance.now();
    const duration = 920;

    star.className = 'flying-reward-star';
    star.textContent = '★';
    star.style.left = `${start.x}px`;
    star.style.top = `${start.y}px`;
    document.body.appendChild(star);

    function step(now) {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = easeInOutCubic(progress);
      const point = quadraticBezier(start, control, end, eased);
      const scale = 1 + Math.sin(eased * Math.PI) * 0.28;

      star.style.left = `${point.x}px`;
      star.style.top = `${point.y}px`;
      star.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${eased * 180}deg)`;

      if (progress < 1) {
        window.requestAnimationFrame(step);
        return;
      }

      star.remove();
      renderStars(nextVisualStars);
      pulseStarBar();
      if (onCollected) {
        onCollected();
      }
    }

    window.requestAnimationFrame(step);
  }

  function pulseStarBar() {
    starsPanel.classList.remove('collecting');
    void starsPanel.offsetWidth;
    starsPanel.classList.add('collecting');

    window.setTimeout(() => {
      starsPanel.classList.remove('collecting');
    }, 520);
  }

  function setPopupPlanet(index) {
    const planetData = PLANETS[index];
    popupPlanetIcon.className = `popup-planet-icon popup-planet-${planetData.className}`;
  }

  function buildSpeechText(planetData, question) {
    const operatorText = question.operator === '+' ? 'plus' : 'minus';
    return `Landning klar på ${planetData.name}. ${planetData.fact} Lös talet: ${question.left} ${operatorText} ${question.right}.`;
  }

  function openMissionPopup() {
    missionOverlay.classList.remove('closing');
    missionOverlay.classList.add('open');
    missionOverlay.setAttribute('aria-hidden', 'false');
  }

  function closeMissionPopup(onClosed) {
    if (!missionOverlay.classList.contains('open')) {
      if (onClosed) {
        onClosed();
      }
      return;
    }

    missionOverlay.classList.add('closing');

    window.setTimeout(() => {
      missionOverlay.classList.remove('open', 'closing');
      missionOverlay.setAttribute('aria-hidden', 'true');
      controlPanel.classList.remove('correct-pulse', 'wrong-pulse');

      if (onClosed) {
        onClosed();
      }
    }, 230);
  }

  function restartPanelAnimation(className) {
    controlPanel.classList.remove(className);
    void controlPanel.offsetWidth;
    controlPanel.classList.add(className);

    window.setTimeout(() => {
      controlPanel.classList.remove(className);
    }, 440);
  }

  function setButtonsDisabled(disabled) {
    answers.querySelectorAll('button').forEach((button) => {
      button.disabled = disabled;
    });
  }

  return {
    setupPlanets,
    renderState,
    renderStars,
    showIntro,
    showPlanetMission,
    showWrongAnswer,
    showCorrectAnswer,
    showFinish,
    flyToPlanet,
    closeMissionPopup,
    pulsePlanet,
    animateStarCollection,
    setShipPosition,
  };
}
