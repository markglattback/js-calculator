import { State, Equation, Status } from "./types/index";
import { getInputType, countParentheses, solveEquation } from "./lib/index";

// Calculator Class
export default class Calculator {
  private equation: Equation;
  private state: State;

  public displayElement: Element;
  public percentButton: HTMLButtonElement;

  constructor(display: Element, percentButton: HTMLButtonElement) {
    this.displayElement = display;
    this.percentButton = percentButton;
    this.percentButton.disabled = true;

    this.state = {
      status: Status.ready,
      parenthesesOpen: false,
      openParenthesesCount: 0,
      displayValue: "0",
    };

    this.equation = ["0"];
  }

  set displayValue(displayValue: string[]) {
    function generateDisplayHTML(displayItems: string[]): string {
      return displayItems
        .map(function (elem, index) {
          return `<span class="display-character">${elem}</span>`;
        })
        .join("");
    }

    this.displayElement.innerHTML = generateDisplayHTML(displayValue);
  }

  private setState(state: State) {
    this.state = {
      ...this.state,
      ...state,
    };

    switch (this.state.status) {
      case Status.activeNumber:
      case Status.activeNumberDecimalPlaces:
      case Status.finished:
      case Status.parenthesesJustClosed:
        this.percentButton.disabled = false;
        break;
      default:
        this.percentButton.disabled = true;
        break;
    }
  }

  public handleInput(value: string) {
    const {
      cancel,
      backspace,
      equals,
      decimal,
      number,
      operator,
      parentheses,
      invalid,
    } = getInputType(value);

    if (number) this.handleNumbers(value);
    if (decimal) this.handleDecimals();
    if (operator) this.handleOperator(value);
    if (parentheses) this.handleParentheses();
    if (equals) {
      this.performCalculation(this.equation);
      this.state.status = Status.finished;
    }
    if (cancel) {
      this.equation = ["0"];
      this.setState({
        status: Status.ready,
        parenthesesOpen: false,
        openParenthesesCount: 0,
      });
    }

    this.updateDisplay();
  }

  private handleNumbers(number: string): void {
    const { status } = this.state;

    switch (status) {
      case "READY":
      case "FINISHED":
        this.equation[0] = number;
        this.setState({
          status: Status.activeNumber,
        });
        break;
      case "ACTIVE_NUMBER":
      case "ACTIVE_NUMBER_DECIMAL_PLACES":
        this.equation.push(`${this.equation.pop()}${number}`);
        break;
      case "ACTIVE_NUMBER_DECIMAL":
        this.equation.push(`${this.equation.pop()}${number}`);
        this.setState({
          status: Status.activeNumberDecimalPlaces,
        });
        break;
      case "PARENTHESES_JUST_OPENED":
      case "ACTIVE_OPERATOR":
        this.equation.push(number);
        this.setState({
          status: Status.activeNumber,
        });
        break;
      case "PARENTHESES_JUST_CLOSED":
      case Status.activePercentage:
        this.equation.push("multiply", number);
        this.setState({
          status: Status.activeNumber,
        });
        break;
      default:
        break;
    }
  }

  private handleDecimals() {
    const { status } = this.state;

    switch (status) {
      case "READY":
      case "FINISHED":
        this.equation[0] = "0.";
        this.setState({
          status: Status.activeNumberDecimal,
        });
        break;
      case "ACTIVE_NUMBER":
        let newNumber = `${this.equation.pop()}.`;
        this.equation.push(newNumber);
        this.setState({
          status: Status.activeNumberDecimal,
        });
      default:
        break;
    }
  }

  private handleOperator(operator: string) {
    const { status } = this.state;

    switch (operator) {
      case "percent":
        switch (status) {
          case Status.activeNumber:
          case Status.activeNumberDecimalPlaces:
          case Status.finished:
          case Status.parenthesesJustClosed:
            this.equation.push("percent");
            this.setState({
              status: Status.activePercentage,
            });
          default:
            break;
        }
        break;
      case "plus-minus":
        switch (status) {
          case Status.activeNumber:
          case Status.activeNumberDecimal:
          case Status.activeNumberDecimalPlaces:
          case Status.finished:
            // flip it
            let num = this.equation.pop();
            this.equation.push("(", `-${num}`);

            this.setState({
              parenthesesOpen: true,
              openParenthesesCount: this.state.openParenthesesCount + 1,
            });

            if (status === Status.finished) {
              // set the correct state
              if (
                Number.isInteger(
                  Number(this.equation[this.equation.length - 1])
                )
              ) {
                this.setState({
                  status: Status.activeNumber,
                });
              } else {
                this.setState({
                  status: Status.activeNumberDecimalPlaces,
                });
              }
            }
            break;
          case Status.parenthesesJustClosed:
          case Status.activePercentage:
            // multiply and (-
            this.equation.push("multiply", "(", "-");
            this.setState({
              status: Status.activeOperator,
              parenthesesOpen: true,
              openParenthesesCount: this.state.openParenthesesCount + 1,
            });
            break;
          default:
            // add (-
            this.equation.push("(", "-");
            this.setState({
              status: Status.activeOperator,
              parenthesesOpen: true,
              openParenthesesCount: this.state.openParenthesesCount + 1,
            });
            break;
        }
        break;
      case "square-root":
        // if after another operator, put into brackets and solve e.g x (\/)
        // if after another number, add a multiply in and open brackets e.g num x \/(5)
        switch (status) {
          case "READY":
            this.equation[0] = "square-root";
            this.equation.push("(");
            this.setState({
              status: Status.parenthesesJustOpened,
              parenthesesOpen: true,
              openParenthesesCount: this.state.openParenthesesCount += 1,
            });
            break;
          case "ACTIVE_OPERATOR":
            this.equation.push("square-root", "(");
            this.setState({
              status: Status.parenthesesJustOpened,
              parenthesesOpen: true,
              openParenthesesCount: this.state.openParenthesesCount += 1,
            });
            break;
          case "FINISHED":
          case "ACTIVE_NUMBER":
          case "ACTIVE_NUMBER_DECIMAL_PLACES":
          case Status.activePercentage:
          case "PARENTHESES_JUST_CLOSED":
            this.equation.push("multiply", "square-root", "(");
            this.setState({
              status: Status.parenthesesJustOpened,
              parenthesesOpen: true,
              openParenthesesCount: this.state.openParenthesesCount += 1,
            });
            break;
          case "ACTIVE_NUMBER_DECIMAL":
            // remove the decimal
            let num = this.equation.pop().slice(0, -1);
            this.equation.push(num, "multiply", "square-root", "(");
            this.setState({
              status: Status.parenthesesJustOpened,
              parenthesesOpen: true,
              openParenthesesCount: this.state.openParenthesesCount += 1,
            });
            break;
          case "PARENTHESES_JUST_OPENED":
            this.equation.push("square-root", "(");
            this.setState({
              parenthesesOpen: true,
              openParenthesesCount: this.state.openParenthesesCount += 1,
            });
            break;
          default:
            break;
        }
        break;
      default:
        switch (status) {
          case "ACTIVE_OPERATOR":
            this.equation.pop();
            this.equation.push(operator);
            break;
          case "ACTIVE_NUMBER":
          case "ACTIVE_NUMBER_DECIMAL_PLACES":
          case Status.activePercentage:
          case "PARENTHESES_JUST_CLOSED":
          case "FINISHED":
            this.equation.push(operator);
            this.setState({
              status: Status.activeOperator,
            });
            break;
          case "ACTIVE_NUMBER_DECIMAL":
            // remove the decimal
            let num = this.equation.pop().slice(0, -1);
            this.equation.push(num, operator);
            this.setState({
              status: Status.activeOperator,
            });
            break;
          default:
            break;
        }
        break;
    }
  }

  private handleParentheses() {
    const { status } = this.state;

    switch (status) {
      case "READY":
        this.equation[0] = "(";
        this.setState({
          status: Status.parenthesesJustOpened,
          parenthesesOpen: true,
          openParenthesesCount: this.state.openParenthesesCount += 1,
        });
        break;
      case "ACTIVE_NUMBER":
      case "ACTIVE_NUMBER_DECIMAL_PLACES":
      case Status.activePercentage:
      case "PARENTHESES_JUST_CLOSED":
        if (this.state.parenthesesOpen) {
          this.equation.push(")");
          this.setState({
            status: Status.parenthesesJustClosed,
            openParenthesesCount: this.state.openParenthesesCount -= 1,
          });

          if (!this.state.openParenthesesCount) {
            this.setState({
              parenthesesOpen: false,
            });
          }
        } else {
          // continue equation
          this.equation.push("multiply", "(");
          this.setState({
            status: Status.parenthesesJustOpened,
            parenthesesOpen: true,
            openParenthesesCount: this.state.openParenthesesCount += 1,
          });
        }
        break;
      case "FINISHED":
        // continue equation
        this.equation.push("multiply", "(");
        this.setState({
          status: Status.parenthesesJustOpened,
          parenthesesOpen: true,
          openParenthesesCount: this.state.openParenthesesCount += 1,
        });
        break;
      case "ACTIVE_NUMBER_DECIMAL":
        // remove the decimal
        let num = this.equation.pop().slice(0, -1);
        this.equation.push(num);

        if (this.state.parenthesesOpen) {
          this.equation.push(")");
          this.setState({
            status: Status.parenthesesJustClosed,
            openParenthesesCount: this.state.openParenthesesCount -= 1,
          });

          if (!this.state.openParenthesesCount) {
            this.setState({
              parenthesesOpen: false,
            });
          }
        } else {
          // continue equation
          this.equation.push("multiply", "(");
          this.setState({
            status: Status.parenthesesJustOpened,
            parenthesesOpen: true,
            openParenthesesCount: this.state.openParenthesesCount += 1,
          });
        }

        break;
      case "ACTIVE_OPERATOR":
      case "PARENTHESES_JUST_OPENED":
        this.equation.push("(");
        this.setState({
          status: Status.parenthesesJustOpened,
          parenthesesOpen: true,
          openParenthesesCount: this.state.openParenthesesCount += 1,
        });
      default:
        break;
    }
  }

  private performCalculation(equation: Equation): string {
    const { status } = this.state;

    // remove any unused operators
    if (status === Status.activeOperator) {
      this.equation.pop();
    }

    // remove decimal from last number
    if (status === Status.activeNumberDecimal) {
      let num = this.equation.pop().slice(0, -1);
      this.equation.push(num);
    }

    // close any open brackets
    let openParenthesesCount = countParentheses(this.equation, 0, "(");
    let closedParenthesesCount = countParentheses(this.equation, 0, ")");

    let diff = openParenthesesCount - closedParenthesesCount;

    if (diff > 0) {
      for (let i = 1; i <= diff; i++) {
        this.equation.push(")");
      }
    }

    const result = solveEquation(equation);

    this.displayElement.innerHTML = result[0];

    return result[0];
  }

  private updateDisplay(): void {
    this.displayValue = this.equation.map(function (element) {
      switch (element) {
        case "multiply":
          return "&times;";
        case "divide":
          return "&divide;";
        case "plus":
          return "&plus;";
        case "minus":
          return "&minus;";
        case "square-root":
          return "&radic;";
        case "percent":
          return "&percnt;";
        default:
          return element;
      }
    });
  }
}

// TODO - disable percentage button if not suitable
// TODO - implement +- button and percent buttons
// TODO - fix width when outputting a really long number
// TODO - make PWA
