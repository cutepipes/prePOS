// January 23, 2024 (13 month from 2023)
var CURRENTVERSION = 1.13231;

// Only used on the terminal out screen

var trafficlights = 0;

var OrderNum = 1;
var OrderTime = 0;

var Order = [];	

var MealInfo = [];

var quantity = 1;
var firstTick = true;
var OVERLAY_CAN_BE_HIDDEN = false;
var rows = 0;		// Rows on card
var buttonid = 0;	// Table datum ID
var selected = 0;	// Selected table datum
var CURRENTMENU = "NONE";
var MAXLENGTH = 0;	// Length of numerical input
var currentBill;	// Selected bill table datum
var currentBillPrice;	// And its pricei

// Dialog
let cancelFunction = "return;";

window.onerror = function (event) {
	OVERLAY_CAN_BE_HIDDEN = true;
	hideOverlay();
	document.getElementById("time").innerHTML = event;
	simplePrompt(event);
}
const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD'
});

let oldFrame = new Date;

let frame = async function () {
	await delay(1);
	console.log(1000 / ((thisFrame = new Date) - oldFrame) > 200 ? null : this);
	oldFrame = new Date;
	frame();
}

// Get time
let getTime = () => {
	document.getElementById("quantity").innerHTML = `<b>${quantity}</b>`;
	OrderTime += .333;

	let __addStr = showPrices ? `<b>Show Prices<br><span style="color: chartreuse">ON</span></b>` : `<b>Show Prices<br><span style="color: crimson">OFF</span></b>`;

	document.getElementById("show-prices").innerHTML = __addStr;

	document.getElementById("order-time").innerHTML = Math.round(OrderTime)
	document.getElementById("order-num").innerHTML = `Order ${OrderNum}`
	let d = new Date().toLocaleString('en-US', {
		timeZone: 'Pacific/Auckland'
	});
	if (PKG) {
		document.title = `prePOS ${CURRENTVERSION} – Provision Package: ${PKG}`
		document.getElementById("time").innerHTML = d;
	} else {
		document.title = `prePOS – Missing Provision!`
		document.getElementById("time").innerHTML = "Missing Provision!";
	}
	showMenu(CURRENTMENU);
};

// file-input -> id

async function initialize() {

    let noTime = false;
	// VERSION
	hideOverlay();

	OVERLAY_CAN_BE_HIDDEN = true;

	document.title = `prePOS ${CURRENTVERSION}`;
	document.getElementById("version").innerHTML = `${CURRENTVERSION} &ndash; `;
	if ("serviceWorker" in navigator) {
		navigator.serviceWorker && navigator.serviceWorker.register("./sw.js").catch(function(){});
	}
    
    showMenu("LUNCH");
    
    // Hide overlay if click occurs outside of box
    document.getElementById("overlay").onclick = function (event) {
        if(event.target.id == "overlay") {
            if(OVERLAY_CAN_BE_HIDDEN) {
				hideOverlay();
			}
        }
    };
	newRow(true);
	let __scales = ["60%", "65%", "70%", "75%", "80%", "85%", "90%", "95%", "100%", "105%", "110%"];
	let __funcs = []; __scales.forEach(function (value) {
		__funcs.push(`document.body.style.scale='${value}';`);
	});
	let __f = [__scales.pop(), __funcs.pop()];
	promptBox("Select a scale", __scales, __funcs, __f[0], __f[1]);
}

let selectMenu = () => {
	if(PKG) {
		let __menus = [];
		let __func = [];
		workflows.forEach( function(value) {
			if(!value.hidden) {
				__menus.push(value["name"]);
				__func.push(`showMenu("${value["id"]}")`);
			}
		});

		let cancel = [__menus.pop(), __func.pop()];

		promptBox(null, __menus,
		__func,
      		cancel[0], cancel[1], "Select menu", true);
		return;
	}
	simplePrompt("Transaction could not be completed because a provision was not loaded.")
}

document.onkeydown = function (e) {
	if(OVERLAY_CAN_BE_HIDDEN && document.getElementById("overlay").style.display == "none") {
		simplePrompt("Keyboard input is not supported")
		e.preventDefault();
	}
}

// Selection of things
document.addEventListener("click", (event) => {

	let LAST_CLICKED_ELEMENT = event.target.id;

	if(event.target.className == "slot") {
		selectItem(event.target);
		
	} else if(LAST_CLICKED_ELEMENT.includes("WorkflowOpener-")) {

		let split = LAST_CLICKED_ELEMENT.split("WorkflowOpener-");
		showMenu(split[1]);
	}
	else if(event.target.className == "CATBTN" || event.target.nodeName == "IMG") {
		if(event.target.id.includes("AddSelect-")) {
			let split = event.target.id.split("AddSelect-");
			addSelect(split[1]);
		}
	} else if(event.target.className == "CATBTN outage" || event.target.nodeName == "IMG") {
		if(event.target.id.includes("OutageSelect-")) {
			let split = event.target.id.split("OutageSelect-");
			promptBox("Some constituents in this product are not available, would you like to add it anyway?", ["Add to Order"], [`addSelect(${split[1]})`], null, null, null, true)
		}
	}
});

function i_idtel(i) { // id to element
	return document.getElementById(i);
}

function selectItem(item) {

	if(!item) return; // Go again cause JavaScript
		// Isolate
		if(item.id.includes("bill") || item.id.includes("price")) {
			return;
		} 
	

	if(item.nodeName == "TD") {

		if(!PKG) { simplePrompt("Transaction could not be completed because a provision was not loaded."); return; }


		// Disable selecting on tender screen
		if (document.getElementById("showOnTender").style.display == "block") return;
	
		// Reset the style of the other selected button
		document.getElementById(selected).removeAttribute("style");
		resetBorder(document.getElementById(selected));

		// Style the current button
		item.style.backgroundColor = "yellow";
		selectBorder(item);
		selected = parseInt(item.id);

		// Fulfill missing promos
		try {
			if(Order[parseInt(item.id)]["selection"]["fulfillment"] == -1) {
				requestPromoInput(Order[parseInt(item.id)]["selection"]["whitelist"], 0, parseInt(item.id));
			}
		} catch (e) {
			// If there's no selection then it should be fine
		}

	}
}

// SB buttons begin

// New Row
function newRow(bypass) {

	if(!PKG) { simplePrompt("Transaction could not be completed because a provision was not loaded."); return; }

	if(bypass != true) {
		if (rows > 7 && document.getElementById("TBODY").clientHeight+149 > document.getElementById("itemtable").clientHeight) {
			promptBox("An additional row may exceed the screen boundary. Would you like to still add it?<br><b>Note: Rows cannot be removed</b>", ["Yes"], ["document.getElementById('TBODY').scrollTop = scroll.scrollHeight; newRow(true)"], null, null, null, true);
			return;
		}
	}
	rows = rows + 1;
	tbody = document.getElementById("TBODY");
	tr = document.createElement("tr");
	tr.id = `ROW_${rows}`;
	tbody.appendChild(tr);

	tnewRow = document.getElementById(`ROW_${rows}`);

	a = document.createElement("td");
	b = document.createElement("td");
	c = document.createElement("td");
	d = document.createElement("td");

	let eles = [a, b, c, d];
	for (let i = 0; i < eles.length; i++) {
		eles[i].innerHTML = "&empty;"
		
		eles[i].id = `${buttonid}`;
		eles[i].className = "slot";
		buttonid++;
		tnewRow.appendChild(eles[i]);

		Order.push({
			"item": null,
			"price": null,
			"id": null
		});
		Order.push({
			"item": null,
			"price": null,
			"id": null
		});
	}

	// Create prices
	itemPrice = document.createElement("td");
	modPrice = document.createElement("td");
	modPrice2 = document.createElement("td");
	modPrice3 = document.createElement("td");


	itemPrice.innerHTML = "—"
	modPrice.innerHTML = "—"
	modPrice2.innerHTML = "—"
	modPrice3.innerHTML = "—"


	// Limit height
	itemPrice.style = "height: 15px;"
	modPrice.style = "height: 15px;"
	modPrice2.style = "height: 15px;"
	modPrice3.style = "height: 15px;"


	tr = document.createElement("tr");
	tr.id = `PRICE_ROW_${rows}`;
	tbody.appendChild(tr);

	itemPrice.id = `price${buttonid-4}`;
	modPrice.id = `price${buttonid-3}`;
	modPrice2.id = `price${buttonid-2}`;
	modPrice3.id = `price${buttonid-1}`;

	// Add
	tr.append(itemPrice);
	tr.append(modPrice);
	tr.append(modPrice2);
	tr.append(modPrice3);

	// Auto-select first block

	let sel = document.getElementById(selected);
	if (sel) {
		sel.style.backgroundColor = "white";
		resetBorder(sel);
	}

	selected = (rows * 4)-4;

	document.getElementById(selected).style.backgroundColor = "yellow";
	selectBorder(document.getElementById(selected));

}

// Clear selected item is not listed here

// Finish Order
function showTender() {
	if(!PKG) { simplePrompt("Transaction could not be completed because a provision was not loaded."); return; }

	updateTotal();

	document.getElementById(selected).style.backgroundColor = "white";
	resetBorder(document.getElementById(selected));

	document.getElementById("hideOnTender").style.display = "none"
	document.getElementById("showOnTender").style.display = "block"
	document.getElementById("ct").innerHTML = updateTotal();

	updateRemaining();
	splitBillOnce();
	selectBill(document.getElementById("bill1"));
}

// Insert custom price
async function customPrice() {
	await delay(20);
	let newPrice = parseInt(document.getElementById("numerical-input").innerHTML.replaceAll("–", "-"));
	if (!isNaN(newPrice)) {
		if (newPrice >= 0) {
			addSelect(`Premium, inserted`,newPrice);
		} else {
			addSelect(`Discount, inserted`, newPrice);
		}

	}
	updateTotal();
}

// Reset Order
function resetOrder() {
	document.getElementById("TBODY").innerHTML = "";

	try {
		OrderNum = OrderNum == 99 ? 1 : OrderNum + 1
	
		OrderTime = 0;

		rows = 0;
		buttonid = 0; 

	resetBills();
	Order = [];
	initialize();
	document.getElementById("tn").innerHTML = `Not Set`
	document.getElementById("totalSpan").innerHTML =`$0.00 ($0.00 GST)</span>`;

	

	quantity = 1;
	OVERLAY_CAN_BE_HIDDEN = true;

	selected = 0;	// Selected table datum
	showMenu("LUNCH");

	document.getElementById("sb_codes").style.filter = "";
	document.getElementById("sb_codes").disabled = false;

	updateTotal();
	

	returnOrder();
	} catch(e) {
		simplePrompt("Error in resetting")
		console.log(e);
	}

	document.getElementById("modify-order").removeAttribute("style");
	document.getElementById("dialog-cancel").removeAttribute("style");
	document.getElementById("new-order").style.display="none";
}

// Tender screen functions begin

// Table number
async function tableNumber() {
	await delay(1); // This is also needed to display issuesf
	numericalPrompt("Input table locator", "document.getElementById('tn').innerHTML = \`Dine In &mdash; ${parseInt(document.getElementById('numerical-input').innerHTML)}\`; showTender()", 2);
}

// Single bill
function splitBillOnce() {
	// Select first bill
	selectBill(document.getElementById("bill1"));

	// Hide
	document.getElementById("tender-btn").removeAttribute("style");

	//Show bill and hide others
	document.getElementById("bill1").style.display = "table-cell"

	let total = Number(document.getElementById("ct").innerHTML.replace(/[^0-9\.-]+/g, ""));

	document.getElementById("bill1Price").innerHTML = CURRENCY_FORMATTER.format(total);
	updateRemaining();
}

// Thanks, Stack Overflow!
const delay = (delayInms) => {
	return new Promise(resolve => setTimeout(resolve, delayInms));
  };


async function terminalOut(accepted) {
	if(currentBill) {
		document.getElementById("modify-order").style.display = "none";
		document.getElementById("dialog-cancel").style.display = "none";
		OVERLAY_CAN_BE_HIDDEN = false;
	
		simplePrompt("PRESENT / INSERT<br>OR SWIPE CARD");
		await delay(3000);

		simplePrompt("REMOVE CARD");
		await delay(100);

		simplePrompt("PROCESSING<br>PLEASE WAIT");
		await delay(400);

		simplePrompt("PROCESSING NOW");
		await delay(1000);

		if (accepted) {
			simplePrompt(`ACCEPTED`)

			// Replace tender buttons with new Order button
			document.getElementById("tender-btn").style.display="none";

			document.getElementById("new-order").removeAttribute("style");

			OVERLAY_CAN_BE_HIDDEN = true;
			completeBill();
			document.getElementById("dialog-cancel").removeAttribute("style");
		} else {
			simplePrompt(`DECLINED`);
			currentBill.style.backgroundColor = "red";
			OVERLAY_CAN_BE_HIDDEN = true;

			// Reveal modify Order and cancel button
			document.getElementById("modify-order").removeAttribute("style");
			document.getElementById("dialog-cancel").removeAttribute("style");
		}
	} else {
		simplePrompt("Transaction could not be completed because no bill has been selected")
	}
}

// Complete selected bill
function completeBill() {
	if (currentBill) {
		currentBill.style.backgroundColor = "chartreuse";
		currentBillPrice.innerHTML = "$0.00"
	}
	updateRemaining();
}

// Reset bills
function resetBills() {
	let bill1 = document.getElementById("bill1");

	bill1.style.backgroundColor = "white";

	currentBill = bill1;
	bill1.style.backgroundColor = "yellow";
	splitBillOnce();
}

// Return to menu screen
function returnOrder() {
	document.getElementById(`${selected}`).style.backgroundColor = "yellow";
	selectBorder(document.getElementById(selected)); // Retrieve styling for selected button

	document.getElementById("hideOnTender").style.display = "block"
	document.getElementById("showOnTender").style.display = "none"
}

// Background functions begin

// Add selected items from the menu into the selected product slot
function addSelect(object, price, special, overflow) {

	// First thing is check if the product can actually be made
	if(isInOutage(object, true)) {
		promptBox("Item cannot be added to the Card as one of its Constituents is in Outage");
		return;
	}

	if(isInOutage(object)) {
		promptBox("Item cannot be added to the Card as one of its Constituents is in Outage");
		return;
	}
 
	if(getRelativeCell() == 1) {
		// Might be promo
		try {
			let _i = Order[selected];
			if(_i) {
				if(_i["item"].includes("PROMO") || _i["price"].includes("PROMO")) {
					if(Order[selected]["id"].includes("Offer")) {
						simplePrompt("This item cannot be removed because an Offer code has been applied.")
					} else {
						// Remove promo items
						Order[selected]["promo"]["offset_targets"].forEach(function(index) {
							Order[selected + 1 + index] = {
								"item": null,
								"price": null,
								"id": null,
								"promo": null,
								"target": null,
								"constitution": null,
								"quantity": null
							};
						});
						// Remove current item
						Order[selected] = {
							"item": null,
							"price": null,
							"id": null,
							"promo": null,
							"target": null,
							"constitution": null,
							"quantity": null
						};
						updateTotal();
					}
					return;
				}
			}
		} catch(e) {
			// yeah
		}
	}

	// Age check
	try {
		if (items[object]["minimum_age"]) {
			if(!special) {
				promptBox(`This Item has an age requirement: ${items[object]["minimum_age"]}`, ["Add Anyway"], [`addSelect(${object}, null, true);`], "Cancel", null, null, true);
				return;
			}
		}
	} catch (e) {}

	// Add text-based item
	if (isNaN(object) || object == null) {
		Order[selected] = {
			"item": object,
			"price": price,
			"id": null,
			"target": null,
			"promo": null,
			"quantity": quantity || 1
		};

		// Set promo if valid
		try {
				if(object["promo"]) {
				Order[selected]["promo"] = object["promo"];
			}
		} catch(e) {
			// Nullify promo if error
			Order[selected]["promo"] = null;
		}

	// Add integer-based item
	} else  {
		Order[selected] = {
							"item": items[object]["item"],
							"price": items[object]["price"],
							"id": object,
							"promo": null,
							"target": null,
							"constitution": items[object]["constitution"],
							"quantity": quantity || 1
						};
		
		// Set promo if valid
		try {
			if(items[object]["promo"]) {
				Order[selected]["promo"] = items[object]["promo"];
			}
		} catch(e) {
			// Nullify promo if error
			Order[selected]["promo"] = null;
		}
	}
	// Select next
	selectItem(i_idtel(selected+1), overflow);


	quantity = 1;
	updateTotal();
}

// Resets item lines upon opening a new menu
function clearItemLines() {
	let line1 = document.getElementById("ITEMLINE1");
	let line2 = document.getElementById("ITEMLINE2");
	let line3 = document.getElementById("ITEMLINE3");

	line1.innerHTML = "";
	line2.innerHTML = "";
	line3.innerHTML = "";
}

// Runs pretty much every time something happens to keep the total relevant
function updateTotal() {
	document.getElementById("totalSpan").innerHTML = "Total is out of sync"

	let total = 0;
	for (let i = 0; i < Order.length; i++) {

		let thisSlot = document.getElementById(`${i}`);
		let nextSlot = document.getElementById(`${i+1}`);
			
		let thisPrice = document.getElementById(`price${i}`);
		let nextPrice = document.getElementById(`price${i+1}`);
		
		if(Order[i]["item"] == null) {
			if(thisSlot && thisPrice) {
				thisSlot.innerHTML = "&empty;";
				thisPrice.innerHTML = "&mdash;";
			}
			continue;
		}

		// Set it now so it can be overridden later
		try {
			thisSlot.innerHTML = `${Order[i]["item"]}`;

			// Show quantities over 1
			if(Order[i]["quantity"] > 1) {
				thisSlot.innerHTML = `${Order[i]["item"]} (${Order[i]["quantity"]})`;
			}
		if (!isNaN(Order[i]["price"])) {
			thisPrice.innerHTML = CURRENCY_FORMATTER.format((Order[i]["quantity"] || 1) * Order[i]["price"] / 100)
		} else {
			thisPrice.innerHTML = Order[i]["price"] || "&mdash;";
		}
	} catch (e) {}
		// Free item
		if(Order[i]["item"] == "Free Item") {
			
			if(nextPrice) {	
				let p = parseInt(-1 * Order[i+1]["price"]);

				if (!isNaN(p)) {
					Order[i]["price"] = p;
					thisPrice.innerHTML = CURRENCY_FORMATTER.format(Order[i]["price"] / 100);
					total += p;
				}
			
				// Clear reduction if next item is removed or free	
				if(isNaN(Order[i+1]["price"])) {
					Order[i]["price"] == null;
					thisPrice.innerHTML = "&mdash;"
				}
			}
		}
		
		// Half-priced item
		else if(Order[i]["item"] == "Half-price Item") {

			if(nextPrice) {	
				let p = parseInt(-0.5 * Order[i+1]["price"]);

				if (!isNaN(p)) {
					Order[i]["price"] = p;
					thisPrice.innerHTML = CURRENCY_FORMATTER.format(Order[i]["price"] / 100);
					total += p;
				}
			
				// Clear reduction if next item is removed or free	
				if(nextPrice.innerHTML == "—") { thisPrice.innerHTML="&mdash;"; return };
			}
		}

		// Combos
		else if (Order[i]["item"].includes("PROMO:") || (Order[i]["item"].includes("<br>MEAL") || Order[i]["promo"])) {
			total += Order[i]["price"];

			if( ((i % 4) + 1) != 1) {
				simplePrompt("Promo found in wrong place.<br>Do not put Combos outside ITEM columm")
				return;
			}
		} else {
			if(!isNaN(Order[i]["price"])) {
				total += Order[i]["price"] * Order[i]["quantity"];
			}
		}

		// Promo
		try { // If there is a selection, check if it's fulfilled
			if(Order[i]["selection"]["fulfilled"] == true) {
				if(Order[i]["selection"]["whitelist"].includes(Order[i]["selection"]["fulfillment"])) {
					thisSlot.innerHTML = items[Order[i]["selection"]["fulfillment"]]["item"];
				} else {
					thisSlot.innerHTML = "Bad Item!"
					Order[i]["selection"]["fulfillment"] = -1;
					selectItem(i_idtel(i));
					return;
				}
			} else {
				selectItem(i_idtel(i));
				return;
			}
		} catch (e) { // Else, we can format the slots
			try {
				Order[i]["promo"]["offset_targets"].forEach(function(value, index) {

					try {
						if(Order[i + 1 + index]["selection"]["fulfillment"]["item"]) {
							thisSlot.innerHTML = items[Order[i + index]["selection"]["fulfillment"]]["item"];
						}
					} catch(e) {
						// Add selection
						Order[i + 1 + index] = {
							"item" : `SELECT:<br>${value["name"]}`,
							"price": "PROMO",
							"selection": {
								"fulfilled": false,
								"fulfillment": -1,
								"whitelist": value["whitelist"]
							}
						}
					}
				});
			} catch (e) {
				// Not a promotional item.
			}
		}

	}

	document.getElementById("totalSpan").innerHTML = `${CURRENCY_FORMATTER.format(total / 100)} (${CURRENCY_FORMATTER.format((total / 766.66))} GST)`
	return CURRENCY_FORMATTER.format(total / 100);
}

// Used in the final stages of Ordering
function updateRemaining() {
	let remain = document.getElementById("tr");
	let updateTotal = 0;

	updateTotal += Number(document.getElementById("bill1Price").innerHTML.replace(/[^0-9\.-]+/g, ""));

	remain.innerHTML = CURRENCY_FORMATTER.format(updateTotal);
}

// Bill go clicky-clicky
function selectBill(that) {

	// Skip if complete
	if (that.style.backgroundColor == "chartreuse") return false;

	if (currentBill) {
		if (currentBill.style.backgroundColor == "yellow") {
			currentBill.style.backgroundColor = "white";
		}
	}
	currentBill = that;
	currentBill.style.backgroundColor = "yellow";
	currentBillPrice = document.getElementById(`${currentBill.id}Price`);
}

// These are self-explanatory
function resetBorder(element) {
	element.style.border = ""; // Clear all
	element.style.borderRight = "1px solid lightgray";
	element.style.borderBottom = "1px solid lightgray";
	
	let price = document.getElementById(`price${element.id}`);
	if(price) {
		price.style.border = ""; // Clear all
		price.style.borderRight = "1px solid lightgray";
		price.style.borderBottom = "1px solid lightgray";
		price.style.backgroundColor = "white"
	}
}

function selectBorder(element) {
	element.style.border = "1px dotted lightgray";
	element.style.borderBottom = "1px dashed lightgray";
	let price = document.getElementById(`price${element.id}`);
	if(price) {
		price.style.border = "1px dotted lightgray";
		price.style.borderTop = "1px dashed lightgray";
		price.style.backgroundColor = "yellow"
	}
}

// Returns the relative cell on the bill. Slot 0 returns 1, Slot 3 returns 4; so do Slot 4 and Slot 7.
function getRelativeCell() {
	return((selected % 4) + 1);
}

function i_getName() {
	return document.getElementById(selected).innerHTML;
}

function i_getPrice() {
	return parseInt(100* parseFloat(document.getElementById(`price${selected}`).innerHTML.replaceAll("$", "")));
}

function addTraffic(button) {

	let input = document.getElementById("traffic-input");

	if(trafficlights < 4) {
		input.innerHTML += button.innerHTML;
		trafficlights++;
	}
	// retroactive modification
	if (trafficlights >= 4) {
		document.getElementById("dialog-cancel").disabled=false;
	}
}

function makeCombo(size) {// "Make Meal" button
	if(getRelativeCell() != 1) { // Not in ITEM slot
		return simplePrompt("Selected item must be in ITEM slot for conversion");
	}

	if(i_getName().includes("<br>MEAL") || i_getName().includes("∅") || i_getName().includes("PROMO:")) { // Already a combo
		return simplePrompt("Item is already a Meal, non-existant, or Promo")
	}

	// Upgrade to meal
	if(MealInfo["mealable"].includes(parseInt(Order[selected]["id"]))) {
		Order[selected]["item"] = `${Order[selected]["item"]}<br>MEAL`; 
		Order[selected]["price"] += MealInfo["COMBO_UPGRADE_COST"];
		Order[selected]["id"] = null;
		Order[selected]["promo"] = MealInfo["promo"];
		updateTotal();

		// use i_idtel to convert elem to select
		selectItem(i_idtel(selected - 2));
	} else {
		simplePrompt("Ppkg does not allow Item in Meal")
	}	
}