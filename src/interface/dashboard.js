import { initializeTerminal } from "../core/terminal.js";
import { initializeMatrix } from "../visual/matrix.js";
initializeTerminal();
const canvas = document.querySelector("#ambient-canvas");
if (canvas) initializeMatrix(canvas);
