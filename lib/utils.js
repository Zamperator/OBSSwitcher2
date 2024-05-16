/**
 * @param {string} version
 * @returns {string}
 */
export class Utilities {

    constructor() {
        this.currentInfo = null;
    }

    formatVersion(version) {
        let vers = [], i;
        vers.push(version[0]);
        vers.push(version[1]);
        vers.push(version[2]);
        for (i = 3; i < version.length; i++) {
            if (version[i] > 0) {
                vers.push(version[i]);
            }
        }
        return vers.join(".");
    }

    /**
     * @param field
     * @returns {string|*}
     */
    getSettings(field) {
        let data = localStorage.getItem('switcherConfig');
        if (!data) {
            return (field) ? '' : {};
        }
        data = JSON.parse(data);

        return (field && data[field]) ? data[field] : data;
    }

    /**
     * @param selector
     * @returns {*}
     */
    qs(selector) {
        return document.querySelector(selector);
    }

    /**
     * @param selector
     * @returns {NodeListOf<*>}
     */
    qsa(selector) {
        return document.querySelectorAll(selector);
    }

    /**
     * @param tag
     * @param params
     * @returns {*}
     */
    ce(tag, params) {
        const el = document.createElement(tag);
        if (Object.keys(params).length) {
            let idx, dName, cName, oName;
            for (idx in params) {
                if (idx === "data") {
                    for (dName in params[idx]) {
                        el.dataset[dName] = params[idx][dName];
                    }
                } else if (idx === "css") {
                    for (cName in params[idx]) {
                        el.style[cName] = params[idx][cName];
                    }
                } else {
                    if (typeof params[idx] === "object") {
                        for (oName in params[idx]) {
                            el.style[oName] = params[idx][oName];
                        }
                    } else {
                        el[idx] = params[idx];
                    }
                }
            }
        }
        return el;
    }

    /**
     * @param {string} field
     * @param {int|string|array|object} value
     */
    setConfigField(field, value) {

        const input = this.qs(`[name="${field}"]`);

        if (!input) {
            return;
        }

        if (input.type === "checkbox") {
            input.checked = (value === 1 || value === true);
        } else if (input.name === "broadcaster") {
            if (value["id"]) {
                input.setAttribute("data-id", value["id"]);
                input.setAttribute("data-name", value["name"]);
                input.setAttribute("placeholder", `${value["id"]} (${value["name"]})`);
                input.classList.add("has-entry");
            } else {
                input.classList.remove("has-entry");
            }
        } else {
            input.value = value;
        }
    }

    /**
     *
     * @param element
     * @param section
     * @param vars
     */
    replaceElementVars(element, section, vars) {
        if (element && typeof vars == "object" && Object.keys(vars).length) {
            let field;
            for (field in vars) {
                const regExp = new RegExp(`{{[^{}]*${field}[^}]*}}`, 'g');
                element[section] = element[section].replace(regExp, vars[field]);
            }
        }
    }

    /**
     * @param {string} title
     * @param {string} message
     * @param {string} type (error, info, success)
     */
    showInfo(title, message, type) {

        if (this.currentInfo instanceof Notify) {
            this.currentInfo.close();
        }
        /**
         * @var Notify
         */
        this.currentInfo = new Notify({
            status: type || 'success',
            title: title || 'Titel',
            text: message || '-',
            effect: 'fade',
            speed: 300,
            customClass: null,
            customIcon: null,
            showIcon: true,
            showCloseButton: true,
            autoclose: true,
            autotimeout: 3000,
            gap: 20,
            distance: 20,
            type: 1,
            position: 'right top'
        });
    }

    /**
     * @param {number} diff
     * @returns {string}
     */
    formatTime(diff) {

        let min = Math.floor(diff / 60);
        let sec = Math.floor(diff % 60);


        min = (min < 10) ? `0${min}` : min;
        sec = (sec < 10) ? `0${sec}` : sec;

        return `${min}:${sec}`;
    }

    /**
     * @returns {number}
     */
    getTimestamp() {
        return Math.ceil(new Date().getTime() / 1000);
    }
}

const Utils = new Utilities();
export {Utils};