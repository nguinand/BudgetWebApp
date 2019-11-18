//BUDGET CONTROLLER
var budgetController = (function(){
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100)
        }else{
            this.percentage = -1
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var caclulateTotal = function(type){
            var sum =0;
            data.allItems[type].forEach(function(cur){
                sum+= cur.value;
            });
            data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals:{
            exp:0,
            inc:0
        },
        budget: 0,
        percentage: -1
    };

    

    return {
        addItem: function(type, des, val){
            var newItem, ID;

            if(data.allItems[type].length === 0){
                ID = 0;
            }
            else{
                ID = data.allItems[type][data.allItems[type].length -1].id +1; 
            }

            if (type == 'exp'){
                newItem = new Expense(ID, des, val);
            }
            else if(type == 'inc'){
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);
            return newItem
            
        },

        deleteItem: function(type, id) {
            var ids, index;
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

            // console.log(type);
            // console.log(id);
            // console.log(data);
            // let newDataArr = data.allItems[type].filter(function(val){
            //     return val.id != id;
            // });
            // data.allItems[type] = newDataArr
            // console.log(data);
        },

        calculateBudget: function(){
            // calculate total income and expenses
            caclulateTotal('exp');
            caclulateTotal('inc');
            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            // caclulate the percentage of income that we spent
            if(data.totals.inc> 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
        },
        
        calculatePercentages: function(){
            data.allItems.exp.forEach(element => {
                element.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function(){
            var allPercentages = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPercentages;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function(){
            console.log(data);
            return data;
        }
    }
})();

//UI CONTROLLER
var UIController = (function(){

    var DOMstrings = {
        inputType: '.add__type',
        value: '.add__value',
        description: '.add__description',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    var formatNumber = function(num, type){
        var numSplit,int,dec,
        // + or - before number
        // exactly 2 decimal points
        // comma separating the thousands

        num = Math.abs(num);
        num = num.toFixed(2); //Method of the number prototype. JS converts to objects and we can use these methods.

        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];

        if(int.length >3){
            int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3 , 3); //input is 2310, result => 2,310
        }

        

        return (type === 'exp' ? '-' : '+') + ' ' + int  + '.' +dec;
    };

    var nodeListForEach = function(list, callback){
        for (var i=0; i< list.length; i++){
            callback(list[i], i);
        }
    };

    
    return {
        getinput: function(){
            return {
                description: document.querySelector(DOMstrings.description).value,
                value: parseFloat(document.querySelector(DOMstrings.value).value),
                type: document.querySelector(DOMstrings.inputType).value //will either be inc or exp
            };
        },

        addListItem: function(obj, type){
            var html, newhtml, element;
            // Create HTML string with placeholder text
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div> '
            }
            else if( type === 'exp'){
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            

            // Replace the placeholder text with some actual data.
            newhtml = html.replace('%id%', obj.id);
            newhtml = newhtml.replace('%description%', obj.description);
            newhtml = newhtml.replace('%value%', formatNumber(obj.value, type));
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newhtml);
        },

        deleteListItem: function(id){
            // document.getElementById(id).remove()
            var el = document.getElementById(id);
            el.parentNode.removeChild(el);
        },

        clearFields: function(){
            var fieldsArr, fields;
            fields = document.querySelectorAll(DOMstrings.description + ', ' + DOMstrings.value);

            fieldsArr = Array.prototype.slice.call(fields); //tricks the slice method into think we are returning an array. the fields variable is a list.
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj){
            obj.budget > 0 ? type ='inc' : type ='exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
            

            if(obj.percentage > 0 && obj.budget > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '----';
            }
        },

        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

            /**  Explanation below.
             * We declare an variable that is a function (nodeListForEach) above. That function takes two parameters, a list and another function.
             * We call that function and pass in the list of those percentage label classes array AND a newly created function that accepts two parameters. A current element and an index.
             * Back to our declared function, we loop through the passed list (fields) and call the passed in function (callback). Like said before, it accepts a current element (list[i]) and an index (i).
             */
            // var nodeListForEach = function(list, callback){
            //     for (var i=0; i< list.length; i++){
            //         callback(list[i], i);
            //     }
            // };

            nodeListForEach(fields, function(current, index){
                console.log(fields);
                console.log(percentages[index]);
                // the fields list and the percentages list should behave like a parallel array.
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }
                
            });
        },

        displayMonth: function(){
            var now, year, month, day, months, days;
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            days = ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            day = now.getDay();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function(){
            //returns nodelist
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.description + ',' +
                DOMstrings.value);
            
            nodeListForEach(fields, function(cur){
                console.log(cur);
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputButton).classList.toggle('red');

        },

        getDOMStrings: function(){
            return DOMstrings;
        }
    };
})()

//GLOBAL APP CONTROLLER
var controller =(function(budgetCtrl, UICtrl){

    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputButton).addEventListener('click', function(){
            ctrlAddItem();
        });
    
        document.addEventListener('keypress', function(event){
            if (event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            };
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    var updateBudget = function(){
            // 1. Calculate the budget
            budgetCtrl.calculateBudget();
            // 2. return the budget
            var budget = budgetCtrl.getBudget();
            // 3. Display the budget
            UICtrl.displayBudget(budget);
    };

    var updatePercentages = function(){
        // 1. Calculate Percentages
        budgetCtrl.calculatePercentages();
        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        // 3. Update User interface with new percentages
        UICtrl.displayPercentages(percentages);
        console.log(percentages);
    }

    var ctrlAddItem = function(){
        var input, newItem;
        // 1. Get the field input data
        input = UICtrl.getinput();
        // 2. Add the item to the budget controller
        if(input.description.trim() !== '' && !isNaN(input.value) && input.value > 0){
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. Add the new item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();

        }

    };

    var ctrlDeleteItem = function(event){
        var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        var splitID, type, id;
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);
            

            // 1. Delete item from data structure
            budgetCtrl.deleteItem(type, id);
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            // 3. Update and show the new budget
            updateBudget();
            // 4. Calculate and update percentages
            updatePercentages();
        }
    };

    return{
        init: function(){
            console.log('Application started');
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

controller.init();