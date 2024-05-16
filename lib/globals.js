import {Settings} from "./settings.js";
import {Utils} from "./utils.js";
import {Streaming} from "./handler/Streaming.js";

export const globalContext = {
    obs: null,
    SWITCH_SCENES: [],
    OBS_CONNECTED: false,
    OBS_SCENES: {},
    OBS_CURRENT_SCENE: "",
    TW_GAMES: {},
    TW_GAMES_SEARCHING: null
}

export const storageKeys = {
    scenes: 'switcherScenes',
    config: 'switcherConfig',
    obs: 'switcherOBSData',
    timer: 'switcherTimerStart',
}

/**
 * @type {{hide(): void, change(string): void, show(string): void, setText(string): void}}
 */
export const Loader = {
    /**
     * @param {string} text
     */
    show(text) {
        this.change('block');
        if (text) {
            this.setText(text);
        }
    },
    hide() {
        this.change('none');
        this.setText("");
    },
    /**
     * @param {string} text
     */
    setText(text) {
        Utils.qs('.loader.loader-text').dataset.text = `${text}`;
    },
    /**
     * @param {string} state (block|none)
     */
    change(state) {
        Utils.qsa('.loader').forEach(element => {
            element.style.display = state;
        });
    }
}


/**
 * @param {boolean} bIgnoreLive
 * @returns {boolean}
 */
export function checkReadyState(bIgnoreLive) {

    if (!Settings.config.token) {
        Utils.showInfo('Fehler', 'Du benötigst einen Token. Klicke dazu auf "Token ermitteln" und kopiere anschließen "access_token=<strong>Diesen Wert</strong>&scope" aus der URL.', 'error');
        return false;
    }

    if (!Settings.config.broadcaster || !Settings.config.broadcaster.id) {
        Utils.showInfo('Fehler', 'Du musst deinen Twitch-Account als Broadcaster angeben, bevor die Funktion aktiv wird.', 'error');
        return false;
    }

    if (!bIgnoreLive && !Streaming.state) {
        Utils.showInfo('Fehler', 'Dein Stream ist momentan nicht live.', 'error');
        return false;
    }

    return true;
}

/**
 * @param {string} buttonId
 * @param {string} state (add|remove)
 */
export function setSaveButtonState(buttonId, state) {
    const button = Utils.qs(`#${buttonId}`);
    if (button) {
        button.classList[state]('updated');
    }
}


export class Template {

    /**
     * @param {string} container
     */
    constructor(container) {

        this.template = Utils.qs(`template#${container}`);

        if (!this.template) {
            Utils.showInfo("Fehler", `Template "${container}" nicht gefunden.`, 'error');
            console.error(`Template "${container}" not found.`);
            return;
        }

        this.parsed = false;
        this.placeholder = {};
        this.content = this.template.innerHTML;
    }

    /**
     * @param {string} field
     * @param {string} value
     * @returns {Template}
     */
    set(field, value) {
        this.placeholder[field] = value;
        return this;
    }

    /**
     * @param {object} values
     * @returns {Template}
     */
    setMultiple(values) {
        for (let field in values) {
            this.set(field, values[field]);
        }
    }

    /**
     *
     */
    parse() {
        if (!this.parsed && Object.keys(this.placeholder).length) {
            Utils.replaceElementVars(this, 'content', this.placeholder);
            this.parsed = true;
        }
    }

    /**
     * @returns {string}
     */
    get() {
        this.parse();
        return this.content;
    }

}