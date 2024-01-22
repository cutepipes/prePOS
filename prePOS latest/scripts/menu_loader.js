var menus;
var PKG;
var charities;
var constituents;
var workflows;

async function getProvision() {

    // Clear menus
    document.getElementById("ITEMLINE1").innerHTML = null;
    document.getElementById("ITEMLINE2").innerHTML = null;
    document.getElementById("ITEMLINE3").innerHTML = null;
    
    // Reset values and styles
    OVERLAY_CAN_BE_HIDDEN = false;
    document.getElementById("TBODY").innerHTML = null;
    menus = null;
    document.getElementById("dialog-cancel").style="font-weight: bold;background-color: chartreuse";

    PKG = null;
    document.getElementById("hideOnTender").style.display = "none";

    await delay(1);
    // File opener
    promptBox("<input accept='.ppkg' type='file' id='file-input'></input>", null, null, "Load<br>File", "parseMenu()", "Awaiting provision (.ppkg)", false);

    JSON.parse(get_outages()).forEach(function( value ) {
        outage.push(value);
    });
}

async function parseMenu() {
    var file = document.getElementById("file-input").files[0];
    if (!file) {
        await delay(1);
        simplePrompt("Please select a valid provision file and try again", "Bad provision file!")
        await delay(300);
        getProvision();
        return;
    }

  	var reader = new FileReader();
  	reader.onload = function(e) {
 	   var contents = e.target.result;
        PKG=JSON.parse(contents)['provision'];

        let d = new Date();
        if (PKG > (d.getMonth() * 30.436875 * 86400) + ((d.getDate() - 1) * 86400) + (d.getHours() * 3600) + (d.getMinutes() * 60) + d.getSeconds()) {
            simplePrompt("Ppkg, see võlu");
        }

        items = JSON.parse(contents)['package'];
        workflows = JSON.parse(contents)['menus'];
        charities = JSON.parse(contents)['charities'];
        constituents = JSON.parse(contents)['constituents'];
        MealInfo = JSON.parse(contents)['meal_info']

        initialize();
        setInterval(getTime, 333);
        OVERLAY_CAN_BE_HIDDEN = true;
        document.getElementById("dialog-cancel").removeAttribute("style");
  	};
  	reader.readAsText(file);

    // Show menu
    document.getElementById("hideOnTender").removeAttribute("style");
}