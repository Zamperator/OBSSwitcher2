import {SceneBox} from "./SceneBox.js";
import {Utils} from "../utils.js";
import {Template, globalContext, setSaveButtonState, storageKeys} from "../globals.js";

/**
 *
 */
class DragDropHandler {

    /**
     *
     */
    constructor() {
        this.dragItem = null;
        this.dropZone = null;
    }

    init() {

        const self = this;

        this.dropZone = Utils.qs('.dropzone');

        Utils.qsa('.draggable').forEach(el => {
            el.addEventListener("dragstart", function (event) {

                event.dataTransfer.effectAllowed = "move";
                self.dragItem = this;

                el.addEventListener("dragend", function () {
                    self.dragItem = null;
                });
            });
        });

        // Important, or drop will not respond
        this.dropZone.addEventListener('dragover', function (event) {
            event.preventDefault();
        });

        this.dropZone.addEventListener('drop', function () {
            if (self.dragItem) {
                const sceneName = self.dragItem.dataset.scene;

                self.addScene({name: sceneName, is_active: 1}, false);
                self.dragItem = null;
            }
        });
    }

    draw() {
        const self = this;

        globalContext.SWITCH_SCENES = localStorage.getItem(storageKeys.scenes);
        if (!globalContext.SWITCH_SCENES) {
            return;
        }

        globalContext.SWITCH_SCENES = JSON.parse(globalContext.SWITCH_SCENES);

        if (globalContext.SWITCH_SCENES.length) {
            globalContext.SWITCH_SCENES.sort((a, b) => (a.pos < b.pos) ? 1 : -1).forEach(scene => {
                self.addScene(scene, true, false, false);
            });
        }

        SceneBox.setActive();
    }

    rebind() {

        const self = this;

        // Rebind delete buttons
        Utils.qsa('.dropzone .sortable [data-action="delete-switch-scene"]').forEach(element => {
            element.addEventListener("click", function deleteHandler() {
                element.removeEventListener("click", deleteHandler);
                DragDrop.deleteScene(element.dataset.scene);
            });
        });
        Utils.qsa('.dropzone .sortable [name="is_active[]"]').forEach(element => {
            element.addEventListener("change", function activeChange() {
                element.removeEventListener("change", activeChange);
                self.updateData();
            })
        });
        Utils.qsa('.dropzone .sortable [name="timeout[]"]').forEach(element => {
            element.addEventListener("keyup", function timeoutChange() {
                element.removeEventListener("keyup", timeoutChange);
                // const sceneName = el.dataset.scene;
                setSaveButtonState('saveSettings', 'add');
            })
        });
    }

    /**
     *
     */
    updateData() {

        /**
         * @param element
         * @param timeout
         */
        function setActiveState(element, timeout) {
            timeout.dataset.active = element.target.checked;
        }

        (async function () {

            globalContext.SWITCH_SCENES = [];
            let i = 0;

            Utils.qsa('.dropzone .sortable').forEach(el => {

                const sceneName = el.dataset.scene
                    , is_active = Utils.qs(`.sortable[data-scene="${sceneName}"] [name="is_active[]"]`)
                ;

                const oTimeout = Utils.qs(`.sortable[data-scene="${sceneName}"] .timeout`);
                let timeout = oTimeout.value;

                if (timeout < 1) {
                    timeout = 0;
                } else if (timeout > 120) {
                    timeout = 120;
                }

                globalContext.SWITCH_SCENES.push({
                    name: el.dataset.scene,
                    timeout: timeout,
                    is_active: (is_active) ? (is_active.checked ? 1 : 0) : 0,
                    pos: i++
                });

                if (is_active) {

                    is_active.removeEventListener("change", function (e) {
                        setActiveState(e, oTimeout);
                    });
                    is_active.addEventListener("change", function (e) {
                        setActiveState(e, oTimeout);
                    });

                    oTimeout.dataset.active = is_active.checked;
                }

            });

        }()).then(() => {
            localStorage.setItem(storageKeys.scenes, JSON.stringify(globalContext.SWITCH_SCENES));
        });
    }

    /**
     *
     * @param scene
     * @param bInit
     */
    addScene(scene, bInit) {

        let sceneExists = Utils.qs(`.dropzone div[data-scene="${scene.name}"]`);

        if (sceneExists) {
            return;
        }

        const template = new Template('scene-setup');
        template.setMultiple({
            name: scene.name,
            timeout: scene.timeout || 0,
            pos: scene.pos || 0,
            is_active: scene.is_active ? 'checked' : '',
            ttActive: scene.is_active ? 'true' : 'false',
            active: '',
            added_new: (!bInit) ? 'added-new' : '',
            disabled: Utils.qs('[name="auto-switch"]').checked ? 'disabled' : ''
        });

        this.dropZone.innerHTML = template.get() + this.dropZone.innerHTML;

        if (!bInit) {
            this.updateData();
            setTimeout(function () {
                const as = Utils.qs(`[data-scene="${scene.name}"].added-new`);
                if (as) {
                    as.classList.remove("added-new");
                }
            }, 1490);
        }

        // Make dropzone sortable
        this.enableDragSort();
        this.rebind();

        SceneBox.setActive();
    }

    handleSortDrag(item) {

        const selectedItem = item.target,
            list = selectedItem.parentNode,
            x = item.clientX,
            y = item.clientY;

        selectedItem.classList.add('drag-sort-active');
        let swapItem = document.elementFromPoint(x, y) === null ? selectedItem : document.elementFromPoint(x, y);

        if (list === swapItem.parentNode) {
            swapItem = swapItem !== selectedItem.nextSibling ? swapItem : swapItem.nextSibling;
            list.insertBefore(selectedItem, swapItem);
        }
    }

    handleSortDrop(item) {
        item.target.classList.remove('drag-sort-active');
        DragDrop.updateData();
    }

    enableDragSort() {
        const self = this;
        const sortList = Utils.qsa('.sortable');
        if (sortList.length) {
            Array.prototype.map.call(sortList, (item) => {
                item.ondrag = self.handleSortDrag;
                item.ondragend = self.handleSortDrop;
            });
        }
    }

    /**
     * @param sceneName
     */
    deleteScene(sceneName) {
        const scene = Utils.qs(`.dropzone .sortable[data-scene="${sceneName}"]`);
        if (scene) {
            scene.remove();
            this.updateData();
        }
    }
}

const DragDrop = new DragDropHandler();
export {DragDrop};