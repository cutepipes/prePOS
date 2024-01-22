var outage = [];
var showPrices = false;

function isInOutage(item, complexItem ) {
	let _return = false;
	try {
		if(complexItem) {

			outage.forEach (function (value) {
				item["constitution"].forEach(function (value2) {
					if(outage.includes(value2["constituent"])) {
						_return = true;
						return true;
					}
				})
			});
		}
		else {
			outage.forEach (function (value) {
				items[item]["constitution"].forEach(function (value2) {
					if(outage.includes(value2["constituent"])) {
						_return = true;
						return true;
					}
				})
			});
		}
	} catch (e) {
		_return = false;
	}
	return _return;
}

// Menu functionsw
function showMenu(workflow) {
	clearItemLines();

	let lines = [
		document.getElementById("ITEMLINE1"),
		document.getElementById("ITEMLINE2"),
		document.getElementById("ITEMLINE3")
	];

	workflows.forEach(function( value ) {
		if(value["id"] == workflow) {
			setMenuName(workflow);

			value["submenus"].forEach(function(value2, index) {
				createLineButtons(value2, lines[index]);
			});
			return true;
		}
	});
	return false;
}

// Sets the menu name
function setMenuName(name) {
	CURRENTMENU = name;
	document.getElementById("CURRENTMENU").innerHTML = "Current Menu: " + CURRENTMENU;
}

// Executes open opening a menu, creates all the product buttons.
function createLineButtons(PRODUCT_ARRAY, line) {
	PRODUCT_ARRAY.forEach(function( value, index ) {
		// Empty items

		
		try {
			let __display = items[value.id].item;
			let __price = showPrices ? CURRENCY_FORMATTER.format(items[value["id"]]["price"]/100) : -1;


			if (!items[value["id"]]["item"] || value["id"] == -1) {
				line.innerHTML += `<button disabled class="invisible-catbtn CATBTN"></button>`;
				return true;
			}

			let button = document.createElement("button");
			button.className = "CATBTN";
			if(items[value["id"]]["descriptor-key"]) {
				button.disabled = true;
				button.style.fontSize = "110%";
				button.style.backgroundColor = "#300070";
				button.style.borderColor = "#300070";
				button.style.color = "white";
			}
			button.innerHTML = __display;
			let colors = items[value["id"]]["colors"];
			if(colors) {
				button.style.backgroundColor = colors[0];
				button.style.color = colors[1];
			}

			// Check for image
			if (items[value["id"]]["image"]) {
				if(isInOutage(value["id"])) {
					button.innerHTML = `<image id='OutageSelect-${value["id"]}' style="scale:122%; filter: saturate(0);" src="${items[value["id"]]["image"]}"></image>`;
					button.innerHTML += `<span style="filter: saturate(0);" class='catbtn-title'>${__display}</span>`;
				} else {
					button.innerHTML = `<image id='AddSelect-${value["id"]}' style="scale:122%" src="${items[value["id"]]["image"]}"></image>`;
					button.innerHTML += `<span class='catbtn-title'>${__display}</span>`;
				}
			}

			// Check for outage
			try {

				let promoOutage = false;
				let totalItems = 0;
				let totalOutages = 0;

				if(items[value["id"]]["promo"]) {
					items[value["id"]]["promo"]["offset_targets"].forEach(function(whitelist) {
						totalItems = 0;
						totalOutages = 0;
						whitelist["whitelist"].forEach(function(whitelist_item) {
							if(!promoOutage) {
								totalOutages += 1 * isInOutage(whitelist_item);
								totalItems++;

								promoOutage = (totalItems > 0 && totalOutages > 0 && totalItems == totalOutages);;
							}
						});
					});
					
				}

				if(showPrices && items[value["id"]].price && !isInOutage(value["id"])) {
					button.innerHTML += `<span class='catbtn-price'>${__price}</span>`;
				} else if (isInOutage(value["id"]) || promoOutage) {
						button.innerHTML += "<span class='catbtn-overlay'>OUTAGE</span>";
						button.style.overflow="hidden";
						button.classList.add("outage");
						button.style.color ="white";
						button.style.backgroundColor="black";
						button.id = `OutageSelect-${value["id"]}`
						line.appendChild(button);
						return true;
				}
			} catch (e) {};

			if(items[value["id"]].workflow_opener) {
				button.id =`WorkflowOpener-${items[value["id"]].workflow_opener}`
			} else {
				button.id = `AddSelect-${value["id"]}`
			}
			line.appendChild(button);
		} catch (e) {
			if(value.id > -1) { 
				let button = document.createElement("button");
				button.className = "CATBTN";
				button.style.backgroundColor = "red";
				button.innerHTML = `Invalid Item! (${value["id"]})`;
				line.appendChild(button);
			}
		}
	});
}