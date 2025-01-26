import { Ticker } from "../pixi.mjs";
const physicsTicker = new Ticker();
physicsTicker.autoStart = true;
physicsTicker.maxFPS = 25; physicsTicker.minFPS = 25;
export default physicsTicker;

