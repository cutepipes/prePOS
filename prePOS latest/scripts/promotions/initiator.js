async function submitCode() {
	quantity = 1;
	let string = document.getElementById("traffic-input").innerHTML;

	string = string.replaceAll("🔴", "1");
	string = string.replaceAll("🟠", "2");
	string = string.replaceAll("🟢", "3");
	string = string.replaceAll("⚫", "0");

	simplePrompt("Connecting to Server");

	// Disable hiding lmao
	document.getElementById("dialog-cancel").style.display = "none";
	OVERLAY_CAN_BE_HIDDEN = false;

	let REQUEST_FOR_MAP = new XMLHttpRequest();
	REQUEST_FOR_MAP.open('GET', "https://raw.githubusercontent.com/cutepipes/prePOS/main/offers/map.json");

	REQUEST_FOR_MAP.onerror = function (e) {
		simplePrompt(`Connection failed while getting MAP.<br>${e.target}`)
	}


	REQUEST_FOR_MAP.onload = function() {

	  if (REQUEST_FOR_MAP.status == 200) {
		let codes = JSON.parse(REQUEST_FOR_MAP.responseText);

		let offerFound = false;

		codes["offers"].forEach(function(value) {
			if (value["id"] == parseInt(string)) {
				// Code found
				offerFound = true;
				let REQUEST_FOR_CODE = new XMLHttpRequest();
				REQUEST_FOR_CODE.open('GET', `https://raw.githubusercontent.com/cutepipes/prePOS/main/offers/${value["path"]}`)
				
				REQUEST_FOR_CODE.onerror = function (e) {
					simplePrompt(`Connection failed while getting CODE.<br>${e}`)
				}

				REQUEST_FOR_CODE.onload = function () {
					document.getElementById("dialog-cancel").removeAttribute("style");
					OVERLAY_CAN_BE_HIDDEN = true;

					if (REQUEST_FOR_CODE.status == 200) {
						// Offer .ppkg file in Json
						let OFFER = JSON.parse(REQUEST_FOR_CODE.responseText);

						if(OFFER["promo"]["offset_targets"].length > 3) {
							newRow();
						}

						OFFER["promo"]["offset_targets"].forEach(function() {
							addSelect(null);
						});

						// Parse into Order
						Order[0]["item"] = OFFER["item"];
						Order[0]["quantity"] = 1;
						Order[0]["constitution"] = null;
						Order[0]["price"] = OFFER["price"];
						Order[0]["promo"] = OFFER["promo"];
						Order[0]["id"] = `Offer ${string}`

						selectItem(i_idtel(0));
						document.getElementById("sb_codes").style.filter = "opacity(0)"
						document.getElementById("sb_codes").disabled = true;
						quantity = 1;
						updateTotal();
					} else {
						// Code not found
						simplePrompt("Code could not be redeemed");
					}
				}

				REQUEST_FOR_CODE.send();
				// Stop
				return;
			}
			
		});

		if(!offerFound) {
			// Code not found
			simplePrompt("Code could not be redeemed");
			// Enable hiding
			document.getElementById("dialog-cancel").removeAttribute("style");
			OVERLAY_CAN_BE_HIDDEN = true;
			
		}

	  } else {
		simplePrompt("Code could not be redeemed");
		// Enable hiding
		document.getElementById("dialog-cancel").removeAttribute("style");
		OVERLAY_CAN_BE_HIDDEN = true;
	  }
	}

	REQUEST_FOR_MAP.send();
	await delay(10000);
	try{
		if(OVERLAY_CAN_BE_HIDDEN == false && !Order[0]["id"].includes("Promo")) {
			document.getElementById("dialog-cancel").removeAttribute("style");
			OVERLAY_CAN_BE_HIDDEN = true;
		}
	} catch (e) {
			document.getElementById("dialog-cancel").removeAttribute("style");
			OVERLAY_CAN_BE_HIDDEN = true;
	}
}

async function requestPromoInput(prewhitelist, start, current) {
	OVERLAY_CAN_BE_HIDDEN = false;
	hideOverlay();
	let Main = [];
	let MainFunc = [];
	let cancel = "";

	let whitelist = [];

	prewhitelist.forEach(function( value) {
		if(!isInOutage(value)) {
			whitelist.push(value);
		}
	});

	whitelist.forEach(function(value, index) {
		if(index != (whitelist.length - 1)) {
            if(!isInOutage(value)) {
			    Main.push(items[value]["item"]);
			    MainFunc.push(`
			    			Order[${current}]["selection"]["fulfillment"] = ${value};
			    			Order[${current}]["selection"]["fulfilled"] = true;
			    			Order[${current}]["constitution"] = items[${value}]["constitution"]
                            Order[${current}]["promo"] = items[${value}]["promo"]
			    			updateTotal();
			    			OVERLAY_CAN_BE_HIDDEN = true;
			    			`);
            }
		} else {
			cancel = [items[value]["item"], value];
		}
	});

	let cancelFunc =`
						Order[${current}]["selection"]["fulfillment"] = ${cancel[1]};
						Order[${current}]["selection"]["fulfilled"] = true;
						Order[${current}]["constitution"] = items[${cancel[1]}]["constitution"]
                        Order[${current}]["promo"] = items[${cancel[1]}]["promo"]
						updateTotal();
						OVERLAY_CAN_BE_HIDDEN = true;
						`;
	await delay(10);

	if(whitelist.length == 0) {
        Order[selected] = {
            "item": null,
            "price": null,
            "selection": null,
            "promo": null,
            "constitution": null,
            "id": null
        }
		Order[selected-1] = {
            "item": null,
            "price": null,
            "selection": null,
            "promo": null,
            "constitution": null,
            "id": null
        }
        addSelect(null);
        
        updateTotal();
		promptBox(`Promotion cancelled because all available products are in outage`);
		return;
	} else if(whitelist.length == 1) {
		// auto fill
		eval(cancelFunc);
	} else {
		OVERLAY_CAN_BE_HIDDEN = false;
		promptBox(`Select Item for Slot ${selected}`, Main, MainFunc, cancel[0], cancelFunc, "Suggestions", true);
	}
}