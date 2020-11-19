function exportPDF() {
    viz.showExportPDFDialog();
    // $('.tab-dialog')[0].animate({ 'marginLeft': "-=50px" });
}

function exportData() {
    viz.showExportDataDialog();
}

function resetViz() {
    viz.revertAllAsync();
}

function showVizButtons() {
    var sheets = workbook.getActiveSheet();

    var divIndividualButtons = $('#vizButtons');

    // First clear any buttons that may have been added on a previous load
    divIndividualButtons.html("");
    // Show 'standard' controls, common to all vizzes
    divIndividualButtons.append('<button type="button" onclick="resetViz()" class="btn btn-primary col-xs-3"  style="min-width:135px; margin-right: 5px; margin-top: 5px;">Reset Filters</button>');
    divIndividualButtons.append('<button type="button" onclick="exportPDF()" class="btn btn-primary col-xs-3" style="min-width:135px; margin-right: 5px; margin-top: 5px;">Export PDF</button>');
    divIndividualButtons.append('<button type="button" onclick="exportData()" class="btn btn-primary col-xs-3" style="min-width:135px; margin-right: 5px; margin-top: 5px;">Export Data</button>');
    divIndividualButtons.append('<button type="button" onclick="launch_edit()" class="btn btn-primary col-xs-3" style="min-width:135px; margin-right: 5px; margin-top: 5px;">Edit</button>');

    // if (sheets.getSheetType() === "dashboard")
    // {
    //    var dashboard = sheets.getWorksheets(); 
    // // Only show buttons to switch vizzes if there's more than one
    //     if (dashboard.length > 1) {
    //         divIndividualButtons.append('<br> <br>');
    //         for (var sheetIndex = 0; sheetIndex < dashboard.length; sheetIndex++) {
    //             var sheet = dashboard[sheetIndex];
    //             console.log (sheet.getName());
    //             divIndividualButtons.append('<button type="button" onclick="switchToViz(\'' + sheet.getName() + '\')" class="btn btn-primary col-xs-3" style="min-width:135px; margin-right: 5px; margin-top: 5px;">See ' + sheet.getName() + '</button>')
    //         }
    //     }
    // }
}

// function switchToViz(vizName) {
//     console.log (vizName);
//     if (viz) {
//         viz.dispose();
//     }
//     var index = url.lastIndexOf("/");
//     url = url.substring (0, index+1) + vizName
//     viz = new tableau.Viz(placeholderDiv, url, options); 
//     // workbook.activateSheetAsync(vizName).then(function (dashboard) {

//     //     dashboard.changeSizeAsync({
//     //         behavior: tableau.SheetSizeBehavior.AUTOMATIC
//     //     });
//     // });
// }

function resetAllMarks() {
    
    var referrer = viz.getWorkbook().getActiveSheet();

    if (referrer.getSheetType() == "dashboard") {
        // The active sheets is a dashboard, which is made of several sheets
        var sheets = referrer.getWorksheets();

        // Iterate over the sheets until we find the correct one and clear the marks
        for (var sheetIndex = 0; sheetIndex < sheets.length; sheetIndex++) {
            if (sheets[sheetIndex].getName() == nameOfVizToInteract) {
                sheets[sheetIndex].clearSelectedMarksAsync();
            }
        }
    }
    else {
        // This is not a dashboard so just clear the sheet's selection
        referrer.clearSelectedMarksAsync();
    }

    $('#eventBox').hide(800);
    $('#eventPanel').html("");
}

function launch_edit() {

    // Adjust UI: Hide Buttons & navigation menu, increase size for edit mode
    $('#VizToolbar').hide();
    $('body').addClass("sidebar-collapse");
    $(".content-wrapper").css("height","1200px");
    $("#tableauViz").hide();

    // If the URL happens to have a ticket on it, clean it up before loading the edit window
    var url_parts = url.split('/t/');
    url = tableauServer + '/t/' + url_parts[1]; 
    var edit_location = tableauServer + '/en/embed_wrapper.html?src=' + url + '?:embed=y'; 

    edit_iframe = document.createElement('iframe');
    edit_iframe.src = edit_location;

    // This makes it not look like an iframe
    edit_iframe.style.padding = '0px';
    edit_iframe.style.border = 'none';
    edit_iframe.style.margin = '0px';

    // Also set these with the same values in the embed_wrapper.html page
    edit_iframe.style.width = '100%';
    edit_iframe.style.height = '100%';

    $('#editViz').html(edit_iframe);
    $('#editViz').show();
}

function iframe_change(new_url) {
    // console.log("Old URL received in iframe_change: " + url);
    // console.log("New URL received in iframe_change: " + new_url);

    // Destroy the original edit_iframe so you can build another one later if necessary
    $(edit_iframe).remove();

    // Destroy the original Tableau Viz object so you can create new one with URL of the Save(d) As version
    viz.dispose();

    // Reset the global vizURL at this point so that it all works circularly
    // But first remove any embed/authoring attributes from the URL
    var url_parts = new_url.split('?');
    url = url_parts[0].replace('/authoring', '/views');

    // Handle site
    if (url.search('/site/') !== -1) {
        url_parts = url.split('#/site/');
        url = url_parts[0] + "t/" + url_parts[1];
        vizUrlForWebEdit = url;
        console.log("URL updated in iframe_change: " + url);
    }

    // Adjust UI: Show buttons & navigation menu, decrease size post-edit mode
    $('#VizToolbar').show();
    $('body').removeClass("sidebar-collapse");
    $(".content-wrapper").css("height", "");
    $("#tableauViz").show();
    $("#editViz").hide();

    // Create a new Viz object
    viz = null;
    viz = new tableau.Viz(placeholderDiv, url, options);


}

function completeLoad() {
    // Once the workbook & viz have loaded, assign them to global variables
    workbook = viz.getWorkbook();
    activeSheet = workbook.getActiveSheet();
    // Load custom controls based on the vizzes published to the server
    showVizButtons();

}

$(document).ready(initializeViz); 