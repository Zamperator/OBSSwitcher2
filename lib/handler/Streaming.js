import {Utils} from "../utils.js";
import {Settings} from "../settings.js";
import {SceneBox} from "./SceneBox.js";
import {checkReadyState, globalContext, storageKeys} from "../globals.js";
import {DragDrop} from "./DragDrop.js";

/**
 *
 */
let switchTimerRun = 0;
class StreamingHandler {

    constructor() {
        this._state = false;
        this._stateBox = Utils.qs('#stream-status');
        this._statsBox = Utils.qs('#stream-infos');
    }

    /**
     * @param {string} scene
     */
    static setNextScene(scene) {

    }

    /**
     * TODO: Find a way to get valid next scene
     */
    initTimer() {

        const sceneFields = Utils.qsa('input[data-field="scene-timeout"]');

        if (!Settings.config.active || !checkReadyState(false)) {

            clearInterval(switchTimerRun);

            sceneFields.forEach(element => {
                element.removeAttribute("disabled");
            });

            return;
        }

        sceneFields.forEach(element => {
            element.setAttribute("disabled", true);
        });

        const startTime = Number(localStorage.getItem(storageKeys.timer));

        switchTimerRun = setInterval(function () {

            Utils.qsa(`[data-action="timer"]`).forEach(element => {
                element.innerText = '00:00';
            });

            const timeNow = Utils.getTimestamp();
            const sceneField = Utils.qs(`input[data-field="scene-timeout"][data-active="true"]:first-child`);

            const time = sceneField.value * 60;
            const timeDiff = time - (timeNow - startTime);

            const oTimer = Utils.qs(`[data-action="timer"][data-scene="${sceneField.dataset.scene}"]`);
            oTimer.innerText = Utils.formatTime(timeDiff);

            if(timeDiff <= 0) {
                oTimer.innerText = '00:00';
                StreamingHandler.setNextScene(sceneField.dataset.scene);
            }

        }, 500);
    }

    /**
     * @param {boolean} state
     */
    set state(state) {
        this._state = state;
    }

    /**
     * @returns {boolean}
     */
    get state() {
        return this._state;
    }

    /**
     *
     */
    refresh() {

        globalContext.obs.call('GetSceneList').then(data => {
            if (!globalContext.OBS_SCENES.length) {
                SceneBox.set(data);
                SceneBox.draw();
                DragDrop.draw();
            }
        });

        this.refreshStats();
    }

    /**
     * Update Infos like fps, cpuUsage a.s.o
     */
    refreshStats() {
        globalContext.obs.callBatch([
            {
                requestType: "GetStreamStatus"
            }, {
                requestType: "GetStats"
            }
        ]).then(res => {
            let outData = {
                cpuUsage: 0,
                memoryUsage: 0,
                activeFps: 0,
                outputSkippedFrames: 0,
                numDroppedFrames: 0
            };
            res.forEach(req => {
                if (typeof req.responseData != "undefined") {
                    for (let idx in outData) {
                        if (typeof req.responseData[idx] != "undefined") {
                            outData[idx] = req.responseData[idx];
                        }
                    }
                }
            });
            Streaming.updateInfo(outData);
        });
    }

    /**
     * @param {object} data
     */
    updateInfo(data) {

        if (!this.state) {
            return;
        }

        Utils.qsa('[data-type="stream-info"]').forEach(element => {
            let sField = element.getAttribute("data-field");
            if (typeof data[sField] !== "undefined") {
                if (sField === "outputDuration") {
                    // element.innerText = this.formatTime(data[sField]);
                } else if (sField == 'memoryUsage' || sField == 'cpuUsage' || sField == 'activeFps') {
                    element.innerText = Number(data[sField]).toFixed(1) + ((sField === "cpuUsage") ? '%' : '');
                } else {
                    element.innerText = data[sField];
                }
            }
        });
    }

    /**
     *
     */
    update() {

        this._stateBox.innerText = (this.state) ? 'Online' : 'Offline';

        if (this.state) {
            if (!this._stateBox.classList.contains("online")) {
                this._stateBox.classList.remove('offline');
                this._stateBox.classList.add('online');
            }
            this._statsBox.style.display = "block";
        } else {
            if (!this._stateBox.classList.contains("offline")) {
                this._stateBox.classList.remove('online');
                this._stateBox.classList.add('offline');
            }
            this._statsBox.style.display = "none";
        }

        this.initTimer();
    }
}

const Streaming = new StreamingHandler();
export { Streaming };