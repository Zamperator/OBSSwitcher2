import {Settings} from "../settings.js";
import {Utils} from "../utils.js";
import {Loader, Template, globalContext, storageKeys} from "../globals.js";
import {DragDrop} from "./DragDrop.js";
import {GameBox} from "./GameBox.js";

/**
 *
 */
class SceneBoxHandler {

    /**
     *
     */
    constructor() {
        this.scenesBlock = Utils.qs('#scenes');
        this._lastGameBox = null;
    }

    /**
     * @param {object} data
     */
    set(data) {
        if (data) {
            this.data = data;
            globalContext.OBS_CURRENT_SCENE = data["currentProgramSceneName"];
        }
    }

    /**
     * @param {object} data
     * @param {string} current
     */
    add(data, current) {

        const template = new Template('scene-box');

        template.setMultiple({
            'name': data.name,
            'game_id': parseInt(data.game_id) || "",
            'game': data.game || "",
            'title': data.title || "",
            'active': (data.name === current) ? 'active' : '',
            'game_placeholder': (data.game_id > 0) ? `${data.game} (ID: ${data.game_id})` : 'Optional: Spiel',
            'has_entry': (data.game_id > 0) ? `has-entry` : ''
        });

        this.scenesBlock.innerHTML += template.get();
    }

    /**
     * @param {string} content
     */
    setContent(content) {
        this.scenesBlock.innerHTML = content;
    }

    draw() {

        const self = this;

        let currentData = JSON.parse(localStorage.getItem(storageKeys.obs));

        this.scenesBlock.innerHTML = "";
        this.scenesBlock.classList.remove("error");

        this.data.scenes.forEach(scene => {
            if (currentData && typeof currentData[scene.sceneName] != "undefined") {
                globalContext.OBS_SCENES[scene.sceneName] = currentData[scene.sceneName];
            } else {
                globalContext.OBS_SCENES[scene.sceneName] = {
                    name: scene.sceneName,
                    title: "",
                    game: "",
                    game_id: ""
                };
            }
            this.add(globalContext.OBS_SCENES[scene.sceneName], this.data["currentProgramSceneName"]);
        });

        DragDrop.init();

        Utils.qsa('input[name="title[]"]').forEach(element => {
            element.addEventListener("change", () => {
                Utils.setSaveButtonState('saveSettings', 'add');
            });
        });

        function twitchGameHandler(event) {
            Twitch.getGameList(event);
        }

        Utils.qsa('input[name="game[]"]').forEach((element) => {

            element.removeEventListener("keyup", twitchGameHandler);
            element.addEventListener("keyup", twitchGameHandler);

            element.addEventListener("focus", (e) => {

                if (self._lastGameBox && self._lastGameBox.getAttribute("game-data-id") === "") {
                    self._lastGameBox.value = "";
                }

                GameBox.remove();

                self._lastGameBox = e.target;
            });
        });
    }

    // Set active css class
    setActive() {
        Utils.qsa('.item-box[data-scene]').forEach(element => {
            element.classList[element.dataset.scene === globalContext.OBS_CURRENT_SCENE ? 'add' : 'remove']('active');
        });
    }

    update() {

        // Set active css class
        this.setActive();

        const scene = globalContext.OBS_SCENES[globalContext.OBS_CURRENT_SCENE];

        if (Settings.config.active && (scene.title !== "" || scene.game_id)) {
            Twitch.update(scene.game_id, scene.game, scene.title);
        }
    }

    /**
     * @param {boolean} bState
     */
    setReady(bState) {

        Utils.qsa('.formElements').forEach(element => {
            element.style.display = (bState) ? "block" : 'none';
        });

        this.scenesBlock.classList[bState ? "add" : "remove"]("list-grid");

        Loader.hide();
    }
}

let SceneBox = new SceneBoxHandler();
export { SceneBox };