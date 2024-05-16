// Init websocket for obs
/**
 * @function OBSWebSocket
 * @type {OBSWebSocket}
 */
import {checkReadyState, Loader, globalContext, setSaveButtonState, storageKeys} from "./globals.js";
import {Settings} from './settings.js';
import {SceneBox} from "./handler/SceneBox.js";
import {Utils} from "./utils.js";
import {Streaming} from "./handler/Streaming.js";
import {DragDrop} from "./handler/DragDrop.js";
import {Twitch} from "./handler/Twitch.js";

const obs = new OBSWebSocket();

globalContext.obs = obs;

/**
 * @param authError
 */
function showLoadingError(authError) {

    let sError;

    if (authError) {
        sError = `
            Bitte vergewissere dich, dass die Daten in /lib/config.js auch deinen von dir eingetragenen 
            im Plugin <a href="${Settings.obs.pluginUrl}" target="_blank">OBS-Websockets</a> entsprechen.
        `;
    } else {
        sError = `Keine Verbindung zu OBS erkannt.`;
    }

    sError += `
        Bitte starte OBS, prüfe die im Plugin eingetragenen Daten und lade die Seite hier neu. Stelle zudem sicher, 
        dass das Plugin <a href="${Settings.obs.pluginUrl}" target="_blank">OBS-Websockets</a> aktiviert ist.
    `;

    SceneBox.setContent(sError);
    Utils.qs('#scenes').classList.add("error");

    SceneBox.setReady(false);
}

/**
 *
 */
function saveSettings() {

    Loader.show("Speichere Einstellungen...");

    (async function () {

        const broadcaster = Utils.qs('input[name="broadcaster"]'),
            token = Utils.qs('input[name="token"]').value.trim(),
            active = Utils.qs('input[name="active"]')
        ;

        if (broadcaster) {
            const broadCasterId = broadcaster.getAttribute("data-id"),
                broadCasterName = broadcaster.getAttribute("data-name");
            if (broadCasterName && broadCasterId) {
                Settings.config.broadcaster = {
                    id: parseInt(broadCasterId.trim()),
                    name: broadCasterName.trim()
                };
            }
        }
        if (token) {
            Settings.config.token = token;
        }
        Settings.config.active = (!active.disabled && active.checked) ? 1 : 0;

        Utils.qsa('input[name="game[]"], input[name="title[]"]').forEach((e) => {

            const sceneName = e.dataset.scene;

            if (globalContext.OBS_SCENES[sceneName]) {

                const sField = e.name === "game[]" ? 'game' : 'title';

                if (sField === "game") {

                    const game_id = parseInt(e.getAttribute("data-game-id")),
                        game_name = e.getAttribute("data-game-name"),
                        game_real_name = e.value.trim()
                    ;

                    if (game_real_name !== "" && !isNaN(game_id) && game_name !== "" && game_name === game_real_name) {
                        globalContext.OBS_SCENES[sceneName].game_id = e.getAttribute("data-game-id");
                        globalContext.OBS_SCENES[sceneName].game = e.getAttribute("data-game-name");
                    } else {
                        globalContext.OBS_SCENES[sceneName].game_id = '';
                        globalContext.OBS_SCENES[sceneName].game = '';
                    }
                } else {
                    globalContext.OBS_SCENES[sceneName][sField] = e.value.trim();
                }
            }
        });

        DragDrop.updateData();

    }()).then(() => {

        if (Settings.config) {
            localStorage.setItem(storageKeys.config, JSON.stringify(Settings.config));
        }
        if (globalContext.OBS_SCENES) {
            localStorage.setItem(storageKeys.obs, JSON.stringify(globalContext.OBS_SCENES));
        }

        Utils.showInfo("Erfolg", "Einstellungen gespeichert", "success");
        setSaveButtonState('saveSettings', 'remove');

        Loader.hide();

        Streaming.initTimer();
    });
}

/**
 * @returns {boolean}
 */
window.checkTimerStates = async function(){

    const sceneTimeouts = Utils.qsa('input[data-field="scene-timeout"]');

    let isValid = true;

    async function checkTimerState() {
        sceneTimeouts.forEach(element => {
            if (Utils.qs(`input[name="is_active[]"][data-scene="${element.dataset.scene}"]`).checked) {
                if (element.value == 0) {
                    isValid = false;
                }
            }
        });
    }

    await checkTimerState();

    if (!isValid) {
        Utils.showInfo('Fehler', 'Alle aktiven Timer-Felder benötigen einen Zeitwert!', 'error');
    }

    return isValid;
}

/**
 * @param {object} element
 * @returns {boolean}
 */
window.toggleActiveButton = async function(element) {

    const actBox = Utils.qs('input[name="active"]');

    if (!checkReadyState(false) || !checkTimerStates()) {
        actBox.removeAttribute("checked");
        actBox.checked = false;
        Streaming.initTimer();
        return false;
    }

    if (element !== actBox) {
        actBox.checked = !actBox.checked;
    }

    Settings.config.active = actBox.checked;
    localStorage.setItem(storageKeys.config, JSON.stringify(Settings.config));

    if (Settings.config.active) {
        localStorage.setItem(storageKeys.timer, `${Utils.getTimestamp()}`);
    }

    Streaming.initTimer();

    return true;
}


let isLiveCheck;

/**
 * @returns {Promise<void>}
 */
async function init() {

    Loader.show(`Lade ${Settings.name} v${Settings.versionReadable}`);

    await obs.on("ExitStarted", () => {
        SceneBox.setReady(false);
        showLoadingError(true);
        clearInterval(isLiveCheck);
        obs.disconnect();
    });

    await obs.on("AuthenticationFailure", () => {
        showLoadingError(true);
    });

    await obs.on("CurrentProgramSceneChanged", data => {
        if (data.sceneName !== OBS_CURRENT_SCENE) {
            globalContext.OBS_CURRENT_SCENE = data.sceneName;
            SceneBox.update();
        }
    });

    await obs.on("StreamStateChanged", data => {

        if (data.outputState == 'OBS_WEBSOCKET_OUTPUT_STARTED' && data.outputActive) {
            Streaming.state = true;
            Streaming.update();
        }
        if (data.outputState == 'OBS_WEBSOCKET_OUTPUT_STOPPED' && !data.outputActive) {
            Streaming.state = false;
            Streaming.update();

            Settings.config.active = false;
            localStorage.setItem(storageKeys.config, JSON.stringify(Settings.config));

            Utils.qs('input[name="active"]').checked = false;
        }
    });

    await obs.on('Identified', () => {

        SceneBox.setReady(true);

        obs.on('SwitchScenes', (e) => {
            if (e["scene-name"] !== globalContext.OBS_CURRENT_SCENE) {
                globalContext.OBS_CURRENT_SCENE = e['scene-name'];
                SceneBox.update();
            }
        });

        obs.call('GetStreamStatus').then((data) => {
            if (data.outputActive) {
                Streaming.state = true;
                Streaming.update();
            }
        });

        isLiveCheck = setInterval(() => {
            Streaming.refreshStats();
        }, 3000);
        Streaming.refresh();

        globalContext.OBS_CONNECTED = true;

    });

    await obs.on("SceneCreated", () => {
        Streaming.refresh();
    });

    try {
        await obs.connect(`ws://${Settings.obs.host}:${Settings.obs.port}`, Settings.obs.password, {
            rpcVersion: 1
        });
    } catch (error) {
        showLoadingError();
    }

    Utils.qsa('[data-action]').forEach(element => {
        return element.addEventListener(element.dataset.action, () => {
            switch (element.dataset.event) {
                default:
                    break;
                case 'auto-switch':
                    const sortables = Utils.qsa('.item-box.sortable input');
                    sortables.forEach(input => {
                        if (element.checked) {
                            input.setAttribute("disabled", true);
                        } else {
                            input.removeAttribute("disabled");
                        }
                    });
                    break;
                case 'save-settings':
                    saveSettings();
                    break;
                case 'get-broadcaster':
                    if (!Settings.config.token) {
                        Utils.showInfo('Fehler', 'Bitte erst einen Token eingeben.', 'error');
                        return;
                    }
                    let twitchName = prompt('Gib deinen Twitch-Usernamen ein');
                    if (twitchName && twitchName.length > 2) {
                        Twitch.getBroadcaster(twitchName);
                    }
                    break;
                case 'get-token':
                    open(Settings.twitch.tokenRequestUrl, '_blank');
                    break;
                case 'check-ready-state':
                    return toggleActiveButton(element);
                case 'clear-all':
                    if (confirm('Möchtest du alle Einstellungen, inklusive aller Angaben zu Spielen und Titel löschen?')) {
                        localStorage.clear();
                        Utils.showInfo('Erfolg', 'Alle Daten gelöscht', "success");
                        setTimeout(() => {
                            location.reload();
                        }, 3000);
                    }
                    break;
            }
        });
    });

    let sField;
    for (sField in Settings.config) {
        Utils.setConfigField(sField, Settings.config[sField]);
    }

    Utils.qsa('form').forEach(element => {
        element.addEventListener("submit", (e) => {
            e.preventDefault();
            return false;
        });
    });

    Utils.qs('input[name="token"]').addEventListener("change", () => {
        setSaveButtonState('saveSettings', 'add');
    });

    // Include patcher
    /*
    const patchScript = Utils.ce('script', {
        src: `${Settings.patchUrl}?` + Math.random(),
        async: true
    });
    const patchScriptTarget = Utils.qsa("script")[0];
    patchScriptTarget.parentNode.insertBefore(patchScript, patchScriptTarget);
    */
}

init().then(() => {
    setTimeout(Streaming.initTimer, 10);
});

// Replace html info (Title, Copyright, Date)
(function () {
    Utils.replaceElementVars(document, 'title', {tool_name: Settings.name, version: `v${Settings.versionReadable}`});
    Utils.replaceElementVars(Utils.qs('header h3'), 'innerHTML', {
        tool_name: Settings.name,
        version: `v${Settings.versionReadable}`
    });
    Utils.replaceElementVars(Utils.qs("footer .inner"), 'innerHTML', {year: "" + new Date().getFullYear()});

    // Debug
    // document.querySelector('input[name="auto-switch"]').disabled = true;
    // document.querySelector('input[name="auto-timeout"]').disabled = true;

}());

// if ( obs ) obs.disconnect();