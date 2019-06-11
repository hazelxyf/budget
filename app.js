//BUDGET CONTROLLER
var budgetController = (() => {

    //a data model for expenses and incomes, description and value and ID
    //create a function constructor
    let Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    //create a prototype method for calculting ind % for each expense obj
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round(this.value / totalIncome * 100);
        } else {
            this.percentage = -1;
        }
    };

    //get the above result in another method
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    let Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    /*
    //where we will store the expense/income objects
    let allExpenses = [];
    let allIncomes = [];
    let totalExpenses = 0;
    //instead of having many strings like the above, create one big structure for everything as object
    */

    //private function for internal calculation
    let calculateTotal = (type) => {
        let sum  =  data.allItems[type].reduce((sum, cur) => {
            return sum + cur.value;
        }, 0);
        data.totals[type] = sum;
    };

    

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    

    //create a public method here that allows other modules to add a new item into our data structure
    return {
        addItem: function(type, des, val) {
            let newItem, ID;

            //create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }


            //create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //push new itme into our data structure
            data.allItems[type].push(newItem);

            //return the new element
            return newItem;
        },

        deleteItem: function(type, id) {
            let ids, index;

            //create an array with the IDs
            ids = data.allItems[type].map(current => {
                return current.id;
            });

            //use indexOf to find the index of the ID
            index = ids.indexOf(id);

            //use splice to delete the number of element(1) starting from index
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },


        //create a public method for calculating budget
        calculateBudget: function() {
            //calculate total income and expenses
            //private function for internal calculation
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1; 
            }
            
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(cur => {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
            let allPerc = data.allItems.exp.map(cur => {
                return cur.percentage;
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function() {
            console.log(data);
        }
    }
})();



//UI CONTROLLER
var UIController = (() => {

    const DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    let formatNumber = function(num, type) {
        let numSplit, int, dec;
        //overwrites the num variable
        num = Math.abs(num);

        //always display in 2dp
        num = num.toFixed(2); //toFixed converts the num to a string

        numSplit = num.split('.');
        int = numSplit[0];
        
        if (int.length > 3) {
            let numberOfCommas = Math.floor((int.length - 1) / 3);
        
            for (let i = 0; i < numberOfCommas; i++) { 
                let position = 3 + 3 * i + i;
                int = int.slice(0, -position) + ',' + int.slice(-position);     
            }
        };

        dec = numSplit[1];

        return (type === 'exp' ? sign = '-' : sign = '+') + '$' + int + '.' + dec;
    };

    //when we pass the nodeList here, each element will go through the callback function
    let nodeListForEach = function(list, callback) {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };


    //a function we want controller to use so it has to be a public function
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, //will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };

        },

        //the new object created under newItem will be passed as obj here to be displayed
        addListItem: function(obj, type) {
            let html, newHtml, element;

            //1. create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;

                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">%percentage%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }
            
            //2. replace the placeholder (%id% etc) text with actual data from the obj
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //3. insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },


        //delete item
        deleteListItem: function(selectorID) {
            let el = document.getElementById(selectorID)

            el.parentNode.removeChild(el);
        },

        //clear the UI input
        clearFields: function() {
            let fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(field => {
                field.value = "";
            });

            fieldsArr[0].focus();
        },

        //getBudget Object will be passed as obj here to be displayed
        displayBudget: function(obj) {
            let type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "---";
            }
        },

        //this method will receive the percentage array we got from getPercentages
        displayPercentages: function(percentage) {
            //use queryselectorall because we don't know how many expenses there will be and we don't want to just select the first one
            let fields = document.querySelectorAll(DOMstrings.expensesPercLabel); //this will return a nodeList

            // //when we pass the nodeList here, each element will go through the callback function
            // let nodeListForEach = function(list, callback) {
            //     for (let i = 0; i < list.length; i++) {
            //         callback(list[i], i);
            //     }
            // };
            //this method has been moved into UIController so that other objects can use this method too

            nodeListForEach(fields, (current, index) => {
                if (percentage[index] > 0) {
                    current.textContent = percentage[index] + '%';
                } else {
                    current.textContent = '-';
                }
                
            });
        },

        displayMonth: function() {
            let now, year, month, months;
            
            now = new Date();
            year = now.getFullYear();

            months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
            month = months[now.getMonth()];

            document.querySelector(DOMstrings.dateLabel).textContent = month + ' ' + year;
        },

        //change the border of input fields to red if input is expense
        changedType: function() {

            let fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

                nodeListForEach(fields, cur => {
                    cur.classList.toggle('red-focus');
                });

                document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        
        //create a function so that controller module can have access to the DOMstrings object here
        getDOMstrings: function() {
            return DOMstrings;
        }
    };
})();



//GLOBAL APP CONTROLLER
var controller = ((budgetCtrl, UICtrl) => {

    //a function where all our events listener will be placed
    let setupEventListeners = () => {
        let DOM = UICtrl.getDOMstrings();

        //set up event handler for the input button
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keydown', event => {
            //console.log(event);
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        //event delegation
        //we will place the delete event handler in container clearfix class which contains both income and expense classes
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem); 

        //when the type field is selected, the border colour of the fields will change
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    let updateBudget = () => {
        //5. calculate the budget
        budgetCtrl.calculateBudget();

        //5a. return the budget
        let budget = budgetCtrl.getBudget();

        //6. display the budget on the UI
        UICtrl.displayBudget(budget);
    };


    let updatePercentages = () => {
        //1. calculate percentages
        budgetCtrl.calculatePercentages();

        //2. read percentages from the budget controller
        let percentages = budgetCtrl.getPercentages();

        //3. update the UI with the new percentages
        UICtrl.displayPercentages(percentages);

    };

    //a function that gets called when we want to add new item
    let ctrlAddItem = () => {
        let input, newItem;

        //1. get the filed input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && (input.value > 0)) {
            //2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            //4. clear the fields
            UICtrl.clearFields();
            
            //5. calculate the budget and 6. display the budget on the UI
            updateBudget();

            //6. calculate and update percentages
            updatePercentages();
        }
    };

    //event here is the target element
    let ctrlDeleteItem = event => {
        let itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            //get the type and ID from the parent of the target element(itemID)
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            //2. delete the item from the UI
            UICtrl.deleteListItem(itemID);

            //3. update and show the new budget
            updateBudget();

            //4. calculate and update percentages
            updatePercentages();
        }
    };

    //to call the setupEventListeners function, we create a public initialisation function
    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController);


//to call the init function so that the event listeners, setupEventListeners, will be set up
controller.init();