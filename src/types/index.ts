// Custom Types
export type Modifiers = {
  [key: string]: string;
};

export type Equation = string[];

// Custom Interfaces
export interface InputTypes {
  cancel: boolean;
  backspace: boolean;
  equals: boolean;
  operator: boolean;
  parentheses: boolean;
  number: boolean;
  decimal: boolean;
  invalid: boolean;
}

export enum Status {
  ready = "READY",
  finished = "FINISHED",
  activeNumber = "ACTIVE_NUMBER",
  activeNumberDecimal = "ACTIVE_NUMBER_DECIMAL",
  activeNumberDecimalPlaces = "ACTIVE_NUMBER_DECIMAL_PLACES",
  activeOperator = "ACTIVE_OPERATOR",
  activePercentage = "ACTIVE_PERCENTAGE",
  parenthesesJustOpened = "PARENTHESES_JUST_OPENED",
  parenthesesJustClosed = "PARENTHESES_JUST_CLOSED",
}

export interface State {
  status?: Status;
  parenthesesOpen?: boolean;
  openParenthesesCount?: number;
  displayValue?: string;
}
