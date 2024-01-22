// Charity donation
function CHARITY_request() {
	if(!PKG) { simplePrompt("Transaction could not be completed because a provision was not loaded."); return; }


	let _namesLONG = [];
	let _namesSHORT = [];

	charities.forEach(function(value, i) {
		if(i != charities.length-1) {
			_namesSHORT.push(charities[i]["short-name"]);
			_namesLONG.push(`CHARITY_select("${charities[i]["name"]}")`);
		}
	})

	// todo: the above goes belows 
	


	// Get charity
	promptBox("Select a charity", _namesSHORT,
	_namesLONG,
																					`${charities[charities.length-1]["short-name"]}`,
																	`CHARITY_select("${charities[charities.length-1]['name']}")`, null, false);

	if(!PKG) simplePrompt("Transaction could not be completed because a provision was not loaded.")
}
function CHARITY_select(shortName) {
	if(!PKG) { simplePrompt("Transaction could not be completed because a provision was not loaded."); return; }

	Order[selected] = {
		"item": `Charity<br>(${shortName})`,
		"price": null,
		"id": "Charity"
	};

	CHARITY_requestAmount();
	if(!PKG) simplePrompt("Transaction could not be completed because a provision was not loaded.")
}

async function CHARITY_requestAmount(charity) {	
	await delay(1); // 
	updateTotal();
	numericalPrompt("Insert a price to donate", `Order[selected]['price'] = getNumericalInput(); updateTotal()`, 3);
	if(!PKG) simplePrompt("Transaction could not be completed because a provision was not loaded.");
}