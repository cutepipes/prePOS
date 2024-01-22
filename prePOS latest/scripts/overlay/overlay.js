var ALLOWED_INPUT_KEYS = [];

// Simplified form of promptBox
function simplePrompt(dialogText, dialogTitle) {
	hideOverlay();
	document.getElementById("overlay").removeAttribute("style");


	// Reset title, text and button
	let title = document.getElementById("dialog-title");
	let text = document.getElementById("dialog-text");
	let cancel = document.getElementById("dialog-cancel");
	let buttons = document.getElementById("dialog-buttons");

	document.getElementById("numerical-buttons").style.display="none";

	// Clear
	buttons.innerHTML = "";

	// Reset cancel button
	cancel.innerHTML = "Close";
	cancelFunction = `hideOverlay()` 
	
	// Grab variables
	title.innerHTML = dialogTitle ? dialogTitle : `prePOS dialog title`;
	text.innerHTML = dialogText ? dialogText : "prePOS dialog description";

	

}

function addNumerical(button) {

	let input = document.getElementById("numerical-input");

	if(MAXLENGTH && input.innerHTML.length < MAXLENGTH) {
		input.innerHTML += button.innerHTML;
	}
}

// Numerical prompt

function numericalPrompt(dialogText, dialogFunc, maxLength) {

	ALLOWED_INPUT_KEYS.push(1, 2, 3, 4, 5, 6, 7, 8, 9, 0, "-", "Backspace");

	hideOverlay();

// Show prompt and reset position
document.getElementById("numerical-buttons").removeAttribute("style");

document.getElementById("overlay").removeAttribute("style");

	MAXLENGTH = maxLength;

	// Reset title, text and button
	let title = document.getElementById("dialog-title");
	let text = document.getElementById("dialog-text");
	let cancel = document.getElementById("dialog-cancel");
	let buttons = document.getElementById("dialog-buttons");
	
	// Clear
	buttons.innerHTML = "";
	document.getElementById("numerical-input").innerHTML = "";
	
	// Reset cancel button
	cancel.innerHTML = "Submit";
	cancelFunction = `hideOverlay()` 
	
	// Grab variables
	title.innerHTML = `prePOS numerical prompt (length: ${MAXLENGTH})`;
	text.innerHTML = dialogText ? dialogText : "prePOS dialog description";
	cancelFunction = dialogFunc ? `${dialogFunc}; hideOverlay()` : `hideOverlay()` 

	
}

// Traffic prompt

function trafficPrompt(dialogText) {

	// reset num
	trafficlights = 0;

	hideOverlay();
		// Show prompt and reset position
		document.getElementById("traffic-buttons").removeAttribute("style");

		document.getElementById("overlay").removeAttribute("style");

	// Reset title, text and button
	let title = document.getElementById("dialog-title");
	let text = document.getElementById("dialog-text");
	let cancel = document.getElementById("dialog-cancel");
	let buttons = document.getElementById("dialog-buttons");
	
	OVERLAY_CAN_BE_HIDDEN = false;

	cancel.disabled=true;

	// Clear
	buttons.innerHTML = "";
	document.getElementById("traffic-input").innerHTML = "";
	
	// Reset cancel button
	cancel.innerHTML = "Submit";
	cancelFunction = `OVERLAY_CAN_BE_HIDDEN = true; submitCode()` 
	
	// Grab variables
	title.innerHTML = `Insert offer code (min. and max. length: 4)`;
	text.innerHTML = dialogText ? dialogText : "prePOS dialog description";
}

// Information messages
async function promptBox(dialogText, dialogBts, dialogFunc, cancelText, cancelFunc, dialogTitle, closeAfter) {
	await delay(1);
	hideOverlay();
     
	// Show prompt box and reset position
	document.getElementById("overlay").removeAttribute("style");
	// Reset title, text and button
	let title = document.getElementById("dialog-title");
	let text = document.getElementById("dialog-text");
	let cancel = document.getElementById("dialog-cancel");
	let buttons = document.getElementById("dialog-buttons");

	// Clear
	buttons.innerHTML = "";
	document.getElementById("numerical-input").innerHTML = "";

	document.getElementById("numerical-buttons").style.display="none";

	// Grab basic variables, fallback if not provided
		title.innerHTML = dialogTitle ? dialogTitle : `prePOS dialog title`;
		text.innerHTML = dialogText ? dialogText : "prePOS dialog description";
		cancel.innerHTML = cancelText ? cancelText : "Close";

			// Set cancel function
			cancelFunction = cancelFunc ? `${cancelFunc}; hideOverlay()` : `hideOverlay()` 

		cancel.addEventListener("onclick", function () {
			eval(cancelFunction);
		});

	// Add dialogBts
	if(dialogBts) {
		if(!dialogFunc) {
			simplePrompt(`dialogBts exists, but dialogFunc does not <br>--- Debug ---
										<br>Title: ${title.innerHTML}
										<br>Text: ${text.innerHTML}
										<br>Custom buttons: ${dialogBts}
										<br>Custom functions: ${dialogFunc}
										<br>Cancel button: ${cancel.innerHTML}
										<br>Cancel function: ${cancelFunction}`,"Error");
			return;
		} else {

			// Clear
			buttons.innerHTML = "";

			// Add buttons
			for(let i = 0; i < dialogBts.length; i++) {
				let currentBtn = document.createElement("button");
				currentBtn.id=`dialogBtn_${i}`;
				currentBtn.className = "sb";
				currentBtn.innerHTML = dialogBts[i];
				currentBtn.style.marginLeft = "4px";

				if(i % 4 == 0 && (i > 0)) {
					// Line break that actually works
					if(dialogTitle != "Select menu") {
						let lineBrk = document.createElement("br");
						buttons.appendChild(lineBrk);
					}
				}

				if(dialogFunc[i]) {
					// closeAfter controls the persistence of the menu.
					// It should be set to false if the intent is to open another dialog.
					if(closeAfter) {
						currentBtn.addEventListener("click", function () { eval(dialogFunc[i]); hideOverlay(); });
					} else {
						currentBtn.addEventListener("click", function () { eval(dialogFunc[i]); });
					}
					buttons.appendChild(currentBtn);
				} else {
					simplePrompt(`Null value found at position ${i} in dialogFunc`, "Error");
				}
			}

		}
	}

}

function getNumericalInput() {
	return parseInt(document.getElementById("numerical-input").innerHTML);
}

// Hides overlay for information messages
function hideOverlay() {
	document.getElementById("numerical-buttons").style.display = "none";
	document.getElementById("traffic-buttons").style.display = "none";

	document.getElementById("overlay").style.display = "none";
}

/// ...

// Make the DIV element draggable:
dragElement(document.getElementById("dialog"));

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (document.getElementById(elmnt.id + "header")) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {

    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  async function elementDrag(e) {

    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}