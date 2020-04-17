import Calculator from "./calc";
import "./index.css";

const displayElement = document.querySelector(".value");
const percentButton = document.querySelector("#percent");

const calc = new Calculator(displayElement, <HTMLButtonElement>percentButton);

const buttons = document.querySelectorAll(".button");

buttons.forEach(function (button) {
  button.addEventListener("click", function (e) {
    const value = this.dataset.value;
    calc.handleInput(value);
  });
});
