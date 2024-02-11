function changeTheme(element) {
    let classes = document.body.classList;
    newTheme = 'theme-' + element.value;
    for (var i = 0; i < classes.length; i++) {
        if (classes[i].startsWith('theme-')) {
            document.body.classList.remove(classes[i]);
        }
    }
    document.body.classList.add(newTheme);
    // console.log(newTheme);
    refreshCSS();
}

let firstNumber = "0";
let secondNumber = null;
let operation = null;
let numbersList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, '.'];
let numbersMap = numbersList.map(x => { return String(x); })
let operationsList = ['+', '-', 'x', '/'];

function clickButton(element) {
    // Transition
    buttonContent = element.innerHTML;
    let originalBoxShadow = element.style.boxShadow;
    element.style.boxShadow = '0rem 0rem var(--neutral-shadow)';
    element.style.transform = 'translateY(0.25rem)';

    setTimeout(() => {
        element.style.transform = '';
        element.style.boxShadow = originalBoxShadow;
    }, 100);


    // Calculation
    let currentSymbol = element.innerHTML;
    let display = document.querySelector('.display-contents');
    // console.log('current symbol: ' + currentSymbol);
    // console.log(firstNumber,operation,secondNumber);
    if (operation == null) {
        // means we are still collecting digits for num1, or catching operation

        if (numbersMap.includes(currentSymbol)) {
            firstNumber = addDigit(firstNumber, currentSymbol);
        }

        else if (operationsList.includes(currentSymbol)) {
            // end num1 catching phase, store operation
            operation = currentSymbol;
        }

        else if (currentSymbol == 'DEL') {
            // remove digit form num1
            firstNumber = removeDigit(firstNumber);
        }

        else if (currentSymbol == 'RESET') {
            // early reset, make num 1 into zero and initialise the rest for safety
            firstNumber = 0;
            secondNumber = null;
            operation = null;
            display.innerHTML = firstNumber;
            return;
        }

        else if (currentSymbol == '=') {
            // early equals, just display same num1 and reset the other vars
            display.innerHTML = firstNumber;
            secondNumber = null;
            operation = null;
            return;
        }
        display.innerHTML = firstNumber;
    }
    else {
        if (numbersMap.includes(currentSymbol)) {
            // add current symbol to num2
            secondNumber = addDigit(secondNumber, currentSymbol);
        }

        else if (operationsList.includes(currentSymbol)) {
            // either modifying the just-set operation, or concluding statement
            if (secondNumber == null) {
                // modifying just-set operation
                operation = currentSymbol;
            }
            else {
                firstNumber = doOperation(firstNumber, operation, secondNumber);
                display.innerHTML = firstNumber;
                operation = currentSymbol;
                secondNumber = null;
                return;
            }
        }

        else if (currentSymbol == 'DEL') {
            // remove digit form num2
            firstNumber = removeDigit(secondNumber);
        }

        else if (currentSymbol == 'RESET') {
            // reset
            firstNumber = 0;
            secondNumber = null;
            operation = null;
            display.innerHTML = firstNumber;
            return;
        }

        else if (currentSymbol == '=') {
            // either early equals or conclude
            if (secondNumber == null) {
                display.innerHTML = firstNumber;
                secondNumber = null;
                operation = null;
                return;
            }
            else {
                firstNumber = doOperation(firstNumber, operation, secondNumber);
                operation = null;
                secondNumber = null;
                display.innerHTML = firstNumber;
                return;
            }
        }
        display.innerHTML = secondNumber;
    }
}

addDigit = (original, addition) => {
    if ((original == '0') && addition !== '.') {
        original = '';
    }
    if (addition == '.' && original == '0') {
        original = '0';
    }
    if (original == null) {
        original = '';
    }
    let tmp = String(original) + String(addition);
    if (tmp.length > 15) {
        return original;
    }
    return tmp;
}

removeDigit = (original) => {
    if (original == null) {
        // console.log('this shouldnt have existed');
        return '0';
    }
    let tmp = String(original).slice(0, -1);
    if (tmp == '') {
        return '0';
    }
    return tmp;
}

doOperation = (num1, o, num2) => {

    let n1 = parseFloat(num1);
    let n2 = parseFloat(num2);
    // console.log(n1,o,n2);
    let res;
    if (o == '+') {
        res = n1 + n2;
    }
    else if (o == '-') {
        res = n1 - n2;
    }
    else if (o == 'x') {
        res = n1 * n2;
    }
    else {
        res = n1 / n2;
    }

    return roundFloatWithPrecision(roundFloat(res));
}
refreshCSS = () => {
    let links = document.getElementsByTagName('link');
    for (let i = 0; i < links.length; i++) {
        if (links[i].getAttribute('rel') == 'stylesheet') {
            let href = links[i].getAttribute('href')
                .split('?')[0];

            let newHref = href + '?version='
                + new Date().getMilliseconds();

            links[i].setAttribute('href', newHref);
        }
    }
}

function roundFloatWithPrecision(value) {
    const stringValue = value.toString();
    const decimalIndex = stringValue.indexOf('.');
    // console.log(stringValue.length);
    if (decimalIndex !== -1 && stringValue.length > 10) {
        // console.log('shortening...',value,parseFloat(value.toString().substring(0, 10)));
        return parseFloat(value.toString().substring(0, 15));
    }

    return value;
}

function roundFloat(value) {
    const stringValue = value.toString();
    const match = stringValue.match(/(\d+)\.(\d+)\1(\d+)/);
    if (match) {
        return parseFloat(value.toFixed(match[1].length + match[2].length));
    }
    return value;
}

function storePreferences() {
    localStorage.setItem("theme", document.querySelector("input[type='range']").value);
    localStorage.setItem("lastDisplayValue", document.querySelector(".display-contents").innerHTML);
}

window.addEventListener("beforeunload", function() {
    storePreferences();
});

window.onload = function() {
    var storedRangeValue = localStorage.getItem("theme");
    if (storedRangeValue !== null) {
        document.querySelector("input[type='range']").value = storedRangeValue;
        let classes = document.body.classList;
        for (var i = 0; i < classes.length; i++) {
            if (classes[i].startsWith('theme-')) {
                document.body.classList.remove(classes[i]);
            }
        }
        newTheme = 'theme-' + storedRangeValue;
        console.log(newTheme);
        document.body.classList.add(newTheme);
        // console.log(newTheme);
        refreshCSS();
    }
    var storedContent = localStorage.getItem("lastDisplayValue");
    if (storedContent !== null) {
        document.querySelector(".display-contents").innerHTML = storedContent;
        
        firstNumber = storedContent;
    }
}