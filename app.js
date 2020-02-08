//////// Budgety ////////

// BudgetController module is here
const budgetController = ( () => {

	let Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	}

	let Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	}

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
	}

	let calculateTotal = (type) => {
		let total = 0;
		data.allItems[type].forEach( (element) => {
			total += element.value;
		});
	  	data.totals[type] = total;
	}

	return {

		addItem: function(type, des, val) {
			let newItem, id, length;
			length = data.allItems[type].length;
			id = 0;


			if (length > 0){
				id = data.allItems[type][length - 1].id + 1;
			}

			if (type === 'exp')
				newItem = new Expense(id, des, val);
			else if (type === 'inc')
				newItem = new Income(id, des, val);

			data.allItems[type].push(newItem);
			return newItem;

		},

		deleteItem: (type, id) => {

		},

		calculateAmount: () =>  {
			
			// 1. calculate the total income and expenses
				calculateTotal('inc');
				calculateTotal('exp');
			// 2. calculate the total available budget at the instance
				data.budget = data.totals.inc - data.totals.exp;
			// 3. calculate the percentage of income that we spent
				if (data.totals.inc > 0)
			    	data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);

		},
		getBudget: () => {
			return {
				budget: data.budget,
				income: data.totals.inc,
				expense: data.totals.exp,
				percentage: data.percentage
			}
		},
		getdata: () => data
	}


})();




// UIController module is here
const UIController = ( () => {

	let DOMStrings = {
		inputType: '.add__type',
		inputValue: '.add__value',
		inputDescription: '.add__description',
		button: '.add__btn',
		incomeContainer: '.income__list',
		expenseContainer: '.expenses__list',
		budgetValue: '.budget__value',  // top display ko lagi
		income: '.budget__income--value',
		expense: '.budget__expenses--value',
		expensePercentage: '.budget__expenses--percentage',
		container: '.container'
	}

	return {
		getInput: () => {
		return{
			 type: document.querySelector(DOMStrings.inputType).value,// gives either inc or exp
			 value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
			 description: document.querySelector(DOMStrings.inputDescription).value
		}
	  },
	  addListItems: (obj, type) => {
	  	let html, newHtml, element;

	  	if (type === 'inc'){
	  		element = DOMStrings.incomeContainer;
	  		html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
	  	}else if (type === 'exp'){
	  		element = DOMStrings.expenseContainer;
	  		html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
	  	}
	 	
	 	// replacing the above string
	 	newHtml = html.replace('%id%', obj.id);
	 	newHtml = newHtml.replace('%description%',obj.description);
	 	newHtml = newHtml.replace('%value%', obj.value );

		// adding the element to the dom
		document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
			
	  },
	
	  clearFields: () => {
	  	let fields, fieldsArray;
	  	fields = document.querySelectorAll(DOMStrings.inputValue + "," + DOMStrings.inputDescription);
	  	fieldsArray = Array.prototype.slice.call(fields);
	  	fieldsArray.forEach(function(current, index, array) {
			current.value = "";
	  	});
	  },
	  displayBudget: (obj) => {
	  	document.querySelector(DOMStrings.budgetValue).textContent = obj.budget;
	  	document.querySelector(DOMStrings.income).textContent = obj.income;

	  	
	  	document.querySelector(DOMStrings.expense).textContent = '-' + obj.expense;
	  	
	  	if (obj.percentage > 0 ){
	  		document.querySelector(DOMStrings.expensePercentage).textContent = obj.percentage + '%';
	  	}else{
	  		document.querySelector(DOMStrings.expensePercentage).textContent ='---';
	  	}
		
	  },

	  // Exporting thre DOMStrings
	  getDOMStrings: () => DOMStrings,
	}

})(); // ----------------------->>>>>





// module to communicate budgetController and UIConntroller
const controller = ( (budgetCtrl, UICtrl) => {


	let eventListeners = () => {
		let DOMStrings = UIController.getDOMStrings();
		// handeling click
		document.querySelector(DOMStrings.button).addEventListener('click', ctrlAddItem);
		// handeling enter
		document.addEventListener('keypress', e => {
			 if( e.keyCode === 13 || e.which === 13 ){
			 	ctrlAddItem();
			 }
		});
		document.querySelector(DOMStrings.container).addEventListener('click', ctrlDeleteItem);
	}

	let updateBudget = () => {

		// 1. calculate the budget
		budgetController.calculateAmount();

		// 2. return the budget
		let budget = budgetController.getBudget();

		// 3. Display the budget on the user Interface
		UIController.displayBudget(budget);
	}


	const ctrlAddItem = () => {
		// 1. get the filled input data
		let input = UIController.getInput();

		if (input.description != '' && !isNaN(input.value) && input.value > 0 ){

		// 2. add the item to the budget Controller
		let newItem = budgetController.addItem(input.type,input.description, input.value);

		// 3. add the new item to the user Interface
		UIController.addListItems(newItem, input.type);
		
		// 4. clear the fields
		UIController.clearFields();
  
 		// 5. calculate and update the budget
 		updateBudget();

 	  }

	};

	const ctrlDeleteItem = event => {
		let itemID, splitted, type, ID;
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		console.log(itemID);

		if(itemID) {
			splitted = itemID.split('-');
			type = splitted[0];
			ID = splitted[1];

			// 1. Delete the item from the data structure


			// 2. Delete the item from the User Interface

			// 3. Updata and display the new budget to the user 
		}
	};

	return {
		init: () => {
			console.log('application started');
			eventListeners();
			UIController.displayBudget({
				budget: 0,
				income: 0,
				expense: 0,
				percentage: 0
				}
			);
		}
	}
})(budgetController, UIController);




// the one and only function that is to be called
controller.init();

