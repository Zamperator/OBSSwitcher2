import {Utils} from "../utils.js";
import {globalContext, setSaveButtonState} from "../globals.js";

/**
 *
 */
class GameBoxHandler {

    constructor() {
        this._boxID = 'game-preview';
    }

    /**
     * @returns {string}
     */
    get boxID() {
        return this._boxID;
    }

    /**
     * @returns {Element}
     */
    getBox() {
        return Utils.qs(`#${this.boxID}`);
    }

    /**
     * @param name
     * @returns {string}
     */
    prepareGameName(name) {
        return encodeURIComponent(name).replace(/'/g, "\\\'");
    }

    /**
     * @param {string} scene
     * @param {string} name
     * @param {string|int} id
     */
    add(scene, name, id) {

        console.log(scene, name, id)

        const box = Utils.qs(`[name="game[]"][data-scene="${scene}"]`);

        if (box) {
            name = decodeURIComponent(name);
            box.setAttribute("data-game-id", id);
            box.setAttribute("data-game-name", name);
            box.setAttribute("placeholder", `${name} (ID: ${id})`);
            box.setAttribute("title", `${name} (ID: ${id})`);
            box.value = name;
            box.classList.add("has-entry");

            setSaveButtonState('saveSettings', 'add');
        }

        this.remove();
    }

    remove() {
        const box = this.getBox();
        if (box) {
            globalContext.TW_GAMES_SEARCHING = null;
            box.remove();
        }
    }

    /**
     * @param {Element} el
     * @param {object} data
     */
    show(el, data) {

        const box = document.createElement("ul"),
            dataScene = el.getAttribute('data-scene');

        box.id = "game-preview";

        data.forEach(game => {
            box.innerHTML += `
                <li style="--bg-image: url(${game["box_art_url"]})">
                    <a href="javascript:" onclick="GameBox.add('${dataScene}', '${GameBox.prepareGameName(game.name)}', ${game.id})">
                        ${game.name}
                    </a>
                </li>
            `;
        });

        qs(`[data-type="game-box"][data-scene="${dataScene}"]`).appendChild(box);
    }
}

const GameBox = new GameBoxHandler();
export {GameBox};