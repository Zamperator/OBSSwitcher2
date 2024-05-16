// version: = formatVersion("" + SW_VERSION),
// SW_CONFIG = getSettings(''),
import {Utils} from "./utils.js";
import configData from "../settings.json" with { type: "json" };

const Settings = configData;

Settings.config = Utils.getSettings('');
Settings.versionReadable = Utils.formatVersion(`${Settings.version}`);

export { Settings };