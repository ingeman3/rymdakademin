import {
  HOME_PLANET_INDEX,
  MISSION_PLANET_INDEXES,
  createPlanetQuestion,
  planetPoint,
} from './solar-system-data.js';
import { createSolarSystemUi } from './solar-system-ui.js';

export function startSolarSystemGame() {
  const state = {
    currentPlanet: HOME_PLANET_INDEX,
    selectedPlanet: null,
    currentQuestion: null,
    completedPlanets: new Set(),
    missionStarted: false,
    locked: false,
    visualStars: 0,
  };

  const ui = createSolarSystemUi({
    onMissionStarted: startMission,
    onPlanetSelected: selectPlanet,
    onAnswer: answer,
  });

  ui.setupPlanets();
  ui.setShipPosition(planetPoint(HOME_PLANET_INDEX), 0);
  render();
  window.setTimeout(showIntroPopup, 320);

  function showIntroPopup() {
    state.locked = true;
    state.selectedPlanet = null;
    ui.showIntro(MISSION_PLANET_INDEXES.length);
    render();
  }

  function startMission() {
    state.missionStarted = true;
    state.locked = false;
    ui.closeMissionPopup(render);
  }

  function selectPlanet(index) {
    if (!state.missionStarted || state.locked || index === state.currentPlanet) {
      return;
    }

    if (!canSelectPlanet(index)) {
      return;
    }

    state.selectedPlanet = index;
    state.locked = true;
    render();
    ui.closeMissionPopup();
    launchToPlanet(index);
  }

  function canSelectPlanet(index) {
    if (index === HOME_PLANET_INDEX) {
      return allMissionsCompleted();
    }

    return !state.completedPlanets.has(index);
  }

  function launchToPlanet(destination) {
    ui.flyToPlanet(destination, () => {
      state.currentPlanet = destination;
      state.selectedPlanet = null;
      ui.pulsePlanet(destination);
      render();

      if (destination === HOME_PLANET_INDEX && allMissionsCompleted()) {
        window.setTimeout(finishGame, 560);
        return;
      }

      window.setTimeout(() => renderPlanetMission(destination), 420);
    });
  }

  function renderPlanetMission(index) {
    state.currentQuestion = createPlanetQuestion(index);
    state.locked = false;
    ui.showPlanetMission(index, state.currentQuestion);
  }

  function answer(choice, button) {
    if (state.locked) {
      return;
    }

    const isCorrect = choice === state.currentQuestion.correct;

    if (!isCorrect) {
      ui.showWrongAnswer(button);
      return;
    }

    state.locked = true;
    button.classList.add('correct');
    ui.showCorrectAnswer();

    const completedPlanet = state.currentPlanet;
    state.completedPlanets.add(completedPlanet);
    ui.pulsePlanet(completedPlanet);
    render();
    ui.animateStarCollection(completedPlanet, state.completedPlanets.size, () => {
      state.visualStars = state.completedPlanets.size;
      ui.closeMissionPopup(() => {
        state.locked = false;
        state.selectedPlanet = null;
        render();
      });
    });
  }

  function finishGame() {
    state.locked = true;
    state.visualStars = state.completedPlanets.size;
    ui.showFinish();
    render();
  }

  function allMissionsCompleted() {
    return MISSION_PLANET_INDEXES.every((index) => state.completedPlanets.has(index));
  }

  function render() {
    ui.renderState({
      ...state,
      allMissionsCompleted: allMissionsCompleted(),
      canSelectPlanet,
    });
  }
}
