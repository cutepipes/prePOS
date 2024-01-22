document.addEventListener("contextmenu", function(e) {
    e.preventDefault();

    if((e.target.className == "CATBTN" || e.target.nodeName=="IMG")) {
        if(e.target.id.includes("AddSelect-")) {
            showBuild(items[parseInt(e.target.id.split("AddSelect-")[1])]);
        } else if(e.target.id.includes("OutageSelect-")) {
            showBuild(items[parseInt(e.target.id.split("OutageSelect-")[1])]);
        }
    }
})

function showBuild(item) {
    let a = "";
    let title = "";
    let _l = ""

    try {
        a = items[item["selection"]["fulfillment"]]["item"];
    } catch (e) {
        a = item["item"];
    }

    try {
        a = a.replace("PROMO:<br>", "");
    } catch(e) {};

    

    

    // Show build for regular items

        title = `Product Build (${a})`;
	    try {
		    item["constitution"].forEach(function(value) {
			    _l += `${value["quantity"]} of ${constituents[value["constituent"]]["item"]} (${CURRENCY_FORMATTER.format(constituents[value["constituent"]]["price"] * value["quantity"] * 0.01)})<br>`
			
                try {
                    if(Order[selected]["item"] == item["item"] || items[item["selection"]["fulfillment"]]["item"] == item["item"]) {
                        
                        constituents.forEach(function(value2, index) {
                            if (index == value["constituent"]) {
                                if(!outage.includes(index)) {
                                    _l += `<button class="CATBTN" style="height:50px" onclick="addGrill('${selected}', '${value2["item"]}', ${value2["price"]})">Add</button>`
			                        _l += `<button class="CATBTN" style="height:50px" onclick="removeGrill('${selected}', '${value2["item"]}')">Remove</button><br>`
                                } else {
                                    _l += `Constituent is in outage<br>`
                                }
                            }
                        });
                    }
                } catch(e) {}
		    });
            _l += `<h3>${quantity}</h3>`

            

	    } catch(e) {}
        // Show promotion information
    try {
    if(Order[selected]["item"].includes("PROMO:") || item["promo"]) {
        title = `Promotion Build (${a})`;

	    try {
		    item["promo"]["offset_targets"].forEach(function(value, index) {

                    _l += `<h3>Choice ${index}: "${value["name"]}"</h3>`
                    _l += `<ol>`
                    value["whitelist"].forEach(function(value, index) {
                        _l += `<li>${items[value]["item"]} (worth ${CURRENCY_FORMATTER.format(0.01 * items[value]["price"])})</li>`
                    });
                    _l += `</ol>`
		
            });

	    } catch(e) {}
    }
    } catch(e) {};

	simplePrompt(_l, title);
	return;
}

function addGrill(target, constituent, price) {
    Order.some(function (value, index) {
        if(index > selected && !value["item"]) {
            selectItem(i_idtel(index));
            // Empty slot found, we can populate and return to skip.
            if(!document.getElementById(index)) {
                newRow();
                index++;
            }
            console.log(index);
            if(index > 0 && (getRelativeCell(index) < 2)) {
                _oldQ = quantity;
                quantity = 1;
                addSelect("Modify Above");
                quantity = _oldQ;
            }
            
            Order[index] = {
                "item": `Add ${constituent}<br>Slot ${target}`,
                "price": price,
                "quantity": quantity
            }
            updateTotal();
            return true;
        }
    });
}

function removeGrill(target, constituent) {
    Order.some(function (value, index) {
        if(index > selected && !value["item"]) {
            selectItem(i_idtel(index));
            // Empty slot found, we can populate and return to skip.
            if(!document.getElementById(index)) {
                newRow();
                index++;
            }
            console.log(index);
            if(index > 0 && (getRelativeCell(index) < 2)) {
                _oldQ = quantity;
                quantity = 1;
                addSelect("Modify Above");
                quantity = _oldQ;
            }
            
            
            Order[index] = {
                "item": `Sub ${constituent}<br>Slot ${target}`,
                "price": undefined,
                "quantity": quantity
            }
            updateTotal();
            return true;
        }
    });
}

function get_outages()
{
    var result;
    return (result = new RegExp('(?:^|; )' + encodeURIComponent("outage") + '=([^;]*)').exec(document.cookie)) ? (result[1]) : null;
}

function manageOutages() {
    document.cookie=`outage=${JSON.stringify(outage)}`;

    simplePrompt(null, "Add or Remove products from Outage");

    let promptBody = document.getElementById("dialog-text");

    promptBody.innerHTML = "";
    let _table = document.createElement("table");
    _table.id = "ConstituentTable";

    constituents.forEach(function(value, index) {
        let _row = document.createElement("tr");
        let _d1 = document.createElement("td");
        _d1.disabled = true;
        let _d2 = document.createElement("td");
        _d2.disabled = true;
        
        _d1.innerHTML = `<h3>${value["item"]}</h3>`
        if(outage.includes(index)) {
            _d2.innerHTML += `
            <button class="CATBTN" onclick="outage.splice(${outage.indexOf(index)}, 1); manageOutages();">
                Remove from Outage
            </button></td></tr>`
        } else {
            _d2.innerHTML += `
            <button class="sb" onclick="outage.push(${index}); manageOutages();">
                Add to Outage
            </button></td></tr>`
        }
        _row.appendChild(_d1);
        _row.appendChild(_d2)
        _table.appendChild(_row);
    });
    promptBody.appendChild(_table);

    promptBody.innerHTML += "</tbody></table>"
}