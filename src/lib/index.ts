import { InputTypes } from "../types/index";

export function getInputType(value: string): InputTypes {
  let types: InputTypes = {
    cancel: false,
    backspace: false,
    equals: false,
    decimal: false,
    operator: false,
    number: false,
    parentheses: false,
    invalid: false,
  };

  // check for numbers first
  if (!isNaN(Number(value))) return { ...types, number: true };

  // then check everything else
  switch (value) {
    case "decimal":
      return { ...types, decimal: true };
    case "parentheses":
      return { ...types, parentheses: true };
    case "plus":
    case "minus":
    case "plus-minus":
    case "multiply":
    case "divide":
    case "percent":
    case "square-root":
      return { ...types, operator: true };
    case "cancel":
      return { ...types, cancel: true };
    case "delete":
      return { ...types, backspace: true };
    case "equals":
      return { ...types, equals: true };
    default:
      return { ...types, invalid: true };
  }
}

export function plus(value1: string, value2: string): string {
  const num1 = Number(value1);
  const num2 = Number(value2);

  return (num1 + num2).toString();
}

export function minus(value1: string, value2: string): string {
  const num1 = Number(value1);
  const num2 = Number(value2);

  return (num1 - num2).toString();
}

export function multiply(value1: string, value2: string): string {
  const num1 = Number(value1);
  const num2 = Number(value2);

  return (num1 * num2).toString();
}

export function divide(value1: string, value2: string): string {
  const num1 = Number(value1);
  const num2 = Number(value2);

  return (num1 / num2).toString();
}

export function countParentheses(
  array: string[],
  startIndex: number,
  type: string
): number {
  let count = 0;

  for (let i = startIndex; i < array.length; i++) {
    if (array[i] === type) count += 1;
  }

  return count;
}

function solveParentheses(array: string[]): string[] {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === "(") {
      // if part of sqrt equation ignore
      if (array[i - 1] === "square-root") {
        continue;
      }

      // find corresponding parentheses
      let indexOfMatchingParentheses;
      let closingParenthesesRequired = 1;
      let closingParenthesesFound = 0;

      for (let j = i + 1; j < array.length; j++) {
        if (array[j] === "(") {
          closingParenthesesRequired += 1;
        }
        if (array[j] === ")") {
          closingParenthesesFound += 1;
        }
        if (closingParenthesesRequired === closingParenthesesFound) {
          indexOfMatchingParentheses = j;
          break;
        }
      }

      array.splice(
        i,
        indexOfMatchingParentheses + 1 - i,
        ...solveEquation(array.slice(i + 1, indexOfMatchingParentheses))
      );
    }
  }
  return array;
}

function solveExponents(array: string[]): string[] {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === "square-root") {
      array.splice(i, 4, Math.sqrt(Number(array[i + 2])).toString());
    }
  }

  return array;
}

function solvePercentages(array: string[]): string[] {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === "percent") {
      array.splice(i - 1, 2, (Number(array[i - 1]) / 100).toString());
    }
  }

  return array;
}

function solveMultiplication(array: string[]): string[] {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === "multiply") {
      array.splice(i - 1, 3, multiply(array[i - 1], array[i + 1]));
    }
  }

  return array;
}

function solveDivision(array: string[]): string[] {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === "divide") {
      array.splice(i - 1, 3, divide(array[i - 1], array[i + 1]));
    }
  }

  return array;
}

function solveAddition(array: string[]): string[] {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === "plus") {
      array.splice(i - 1, 3, plus(array[i - 1], array[i + 1]));
    }
  }

  return array;
}

function solveSubtraction(array: string[]): string[] {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === "minus") {
      array.splice(i - 1, 3, minus(array[i - 1], array[i + 1]));
    }
  }

  return array;
}

export function solveEquation(array: string[]): string[] {
  array = solveParentheses(array);
  array = solveExponents(array);
  array = solvePercentages(array);
  array = solveMultiplication(array);
  array = solveDivision(array);
  array = solveAddition(array);
  array = solveSubtraction(array);

  return array;
}
