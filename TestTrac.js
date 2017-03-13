


$(document).ready(function () {

    $("#test").select2({
        minimumInputLength: 2,
        tags: [],
        ajax: {
            url: "/utility/GetCollectionSiteClientList",
            dataType: 'json',
            type: "GET",
            quietMillis: 50,
            data: function (term) {
                return {
                    term: term
                };
            },
            results: function (data) {
                return {
                    results: $.map(data, function (item) {
                        return {
                            text: item.ClientName,
                            id: item.ClientId
                        }
                    })
                };
            }
        }
    });

    // regex for testtrac comfirmation number /\b(\w{1,2})([A-Za-z]{1,2})(\d{1,5})\b/.test("E3AA22891")

    // Global var namespace
    $.ttGlobalVars = {};

    InitializePixelAdminLayoutDefaults();

    // Init default JQuery AJAX options
    //jQuery.ajaxSetup({
    //    beforeSend: function (xhr) {
    //        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    //        return xhr;
    //    }
    //});

    // Init default search criteria
    var searchCriteria = {
        "LastNDays": 30,
        "CollectionStatus": "Collection Pending",
        "Criteria": {
            "OrderConfNum": "",
            "DonorId": "",
            "DonorLast": "",
            "DonorPhone": ""
        }
    };

    // ECCF Order List Datatable Configuration
    $.ttGlobalVars.dataTableColOptionsOL = [
        null, null, null, null, null, null, null, null,
        { "bSortable": false } // Disable sorting on Option column
    ]
    BuildECCFListDataTable(searchCriteria, false, $('#jq-ECCF-OrderList'), $.ttGlobalVars.dataTableColOptionsOL, 'order', $('#dtContainerOL'), true);
    attachDTUpdateEventHandler($('#jq-ECCF-OrderList'), $.ttGlobalVars.dataTableColOptionsOL, $('#dtContainerOL'), 'order');

    // ECCF Collection List Datatable Configuration
    $.ttGlobalVars.dataTableColOptionsCL = [
        null, null, null, null, null, null, null, null, null
    ]
    BuildECCFListDataTable(searchCriteria, false, $('#jq-ECCF-CollectionList'), $.ttGlobalVars.dataTableColOptionsCL, 'collection', $('#dtContainerCL'), true);
    attachDTUpdateEventHandler($('#jq-ECCF-CollectionList'), $.ttGlobalVars.dataTableColOptionsCL, $('#dtContainerCL'), 'collection');
    attachDTSearchEventHandler($('#jq-ECCF-CollectionList'), $.ttGlobalVars.dataTableColOptionsCL, $('#dtContainerCL'), 'collection');

    // Create event handlers for delete confirmation modal
    attachDeleteOptionEventHandler();
    attachDeleteConfirmationEventHandler();

    // Form Functionality 
    setFocusOnFirstFormInput();
    setInputMasks();
    setDateTimePickers();
    setGeneralControlEvents();
    ECCFDateTimeAddCheckMark();
    CheckBoxForTime();
    ExpirationTimeZoneClick();

    // ECCFOrder Create 
    disableEnableWizStep2DDLists();
    disableEnableWizStep2Radios();
    attachLabEventHandler();
    attachClientMainAccEventHandler();
    attachClientSubAccEventHandler();
    attachLabAccNumEventHandler();
    TestCodeEventHandler();

    //Massage Events
    DisplayPageInitialMessage();

    //Event Count Display Function
    EventCountDisplayFunction();


    AddAntiForgeryToken = function (data) {
        data.__RequestVerificationToken = $('#__AjaxAntiForgeryForm input[name=__RequestVerificationToken]').val();
        return data;
    };

    // IE8 console fix
    if (!window.console) console = { log: function () { } };

    // change icon on collapse of the accordion
    $('#accordion').on('show.bs.collapse', function () {
        $(this).find('.icon-plus.icon-1').each(function () {
            $(this).removeClass('icon-plus icon-1').addClass('icon-minus icon-1');
            //$(this).addClass('icon-minus icon-1');
        });
    });

    $('#accordion').on('hide.bs.collapse', function () {
        $(this).find('.icon-minus.icon-1').each(function () {
            $(this).removeClass('icon-minus icon-1').addClass('icon-plus icon-1');
            //$(this).addClass('icon-plus icon-1');
        });
    });

    //Init ToolTips
    initToolTips();

    //EMail Java
    ContactUsEMail();
    OrderConfirmationEmail();

    //model default
    $('#emailModal').modal({ show: false })
    $('#cancelModal').modal({ show: false })

    //email click
    ECCFOrderEmail();

    //edit click
    ECCFOrderEdit();

    //ECCF Collection Cancel click
    ECCFCollectionCancel();
    CancelCollection()

    //ECCF Collection Begin click
    ECCFCollectionBegin();

    //InitiateCustomClientValidate();

});


// Disable all select elements that do not have any items on step 2 of the ECCFOrder create order page
function disableEnableWizStep2DDLists() {
    disableDropDownList($('#fmcontainer2'));
};


function disableEnableWizStep2Radios() {
    var $maRadio = $('input:radio[value=mainaccount]');
    var $saRadio = $('input:radio[value=subaccount]');

    // Only disable radios if there are no items listed in select list
    if (typeof $('#MainAccount').val() !== "undefined") {
        if ($('#MainAccount').val().length > 0) {
            $maRadio.prop("disabled", false);
        }
        else {
            $maRadio.prop("disabled", true);
        }
    }

    if (typeof $('#SubAccount').val() !== "undefined") {
        if ($('#SubAccount').val().length > 0) {
            $saRadio.prop("disabled", false);
        }
        else {
            $saRadio.prop("disabled", true);
        }
    }
}

// Disable all select elements that do not have any items
function disableDropDownList(containerElement) {
    containerElement.find('select:not(:has(option[value!=""]))').attr('disabled', true);
}

// Check/Set the "account" radio button for the specified value/account type
function toggleAccountRadio(radioValueCheck, radioValueUnCheck) {

    var $radios = $('input:radio[name=account]');

    if (radioValueCheck == '' && radioValueUnCheck == '') {
        $radios.prop('checked', false)
    }
    else {

        if (radioValueUnCheck != '') {
            $radios.filter('[value=' + radioValueUnCheck + ']').prop('checked', false);
        }

        if (radioValueCheck != '') {
            $radios.filter('[value=' + radioValueCheck + ']').prop('checked', true);
        }
    }
}

// Disable/enable select2 element and display/hide loading gif for that element
function displayBadgeLoader(elementLoadingFor, loader, badge, show) {
    if (show) {
        elementLoadingFor.prop("disabled", show);
        elementLoadingFor.select2('val', '');
        badge.hide();
        loader.show();
    }
    else {
        elementLoadingFor.prop("disabled", !show);
        loader.hide();
    }
}

function updateAllStep2BadgeCounts() {
    updateBadgeCounts($('#MainAccount'), $('#ma-badge'), true, false);
    updateBadgeCounts($('#SubAccount'), $('#sa-badge'), true, false);
    updateBadgeCounts($('#LabAccNum'), $('#la-badge'), true, false);
    updateBadgeCounts($('#TestCode'), $('#tc-badge'), true, false);
}

// Update the badge count and disable/enable the associated element depending on the badge count value
function updateBadgeCounts(element, badge, ajax, hide) {

    var count
    if (hide == true) {
        count = 0
    }
    else {
        count = element.find('option').size() - 1;
    }

    if (count > 0) {
        element.prop("disabled", false);
        badge.text(count);
        badge.removeClass("badge-grey");
        badge.addClass("badge-green");
        badge.fadeIn("500");
    }
    else {
        element.prop("disabled", true);
        badge.text(count);
        badge.addClass("badge-grey");
        badge.removeClass("badge-green");
        if (ajax) {
            badge.hide();
        }
        else {
            badge.fadeIn("500");
        }
    }
}

// Reset create order step 2 element to its initial state
function resetWizStep2Element(element, elementBadge) {
    element.select2('val', '');
    element.prop("disabled", true);
    elementBadge.hide();
}

// Get list of client main-accounts that have the specified lab registered to them
function attachLabEventHandler() {

    var container = $('#fmcontainer2');

    // Reset appropriate controls when Lab selection is cleared by the user
    $('#Lab').on('select2-removed', function (e) {
        clearCollectionsite();
        resetWizStep2Element($('#MainAccount'), $('#ma-badge'));
        resetWizStep2Element($('#SubAccount'), $('#sa-badge'));
        resetWizStep2Element($('#LabAccNum'), $('#la-badge'));
        resetWizStep2Element($('#TestCode'), $('#tc-badge'));
        // Blank value will clear all account radio elements
        toggleAccountRadio('', '');
        disableEnableWizStep2Radios();
        HideTestTypeSiteAvailablityWarning();
    });

    container.on('change', '#Lab', function () {
        clearCollectionsite(); // Clear selected collection site if needed
        resetWizStep2Element($('#MainAccount'), $('#ma-badge'));
        resetWizStep2Element($('#SubAccount'), $('#sa-badge'));
        resetWizStep2Element($('#LabAccNum'), $('#la-badge'));
        resetWizStep2Element($('#TestCode'), $('#tc-badge'));
        // Blank value will clear all account radio elements
        toggleAccountRadio('', '');
        disableEnableWizStep2Radios();
        HideTestTypeSiteAvailablityWarning();

        var lab = container.find('#Lab');
        var mainAccount = container.find('#MainAccount');
        var subAccount = container.find("#SubAccount");
        var labAccNum = container.find("#LabAccNum");
        var testCode = container.find("#TestCode");

        // Do not proceed if lab id is blank
        if (lab.val() == '') {
            // Update badge count so user can get easy confirmation of how many items there are in the drop down list
            updateBadgeCounts(mainAccount, $('#ma-badge'), true, true);
            return;
        }

        // Remove all option values from select elements
        mainAccount.find('option[value!=""]').remove();
        subAccount.find('option[value!=""]').remove();
        labAccNum.find('option[value!=""]').remove();
        testCode.find('option[value!=""]').remove();

        // Disable select elements that have no option values
        disableEnableWizStep2DDLists();

        // Hide loading icon
        displayBadgeLoader(mainAccount, $('#ma-loader'), $('#ma-badge'), true);

        // AJAX call
        $.getJSON($(lab).attr("data-tt-action"), { ClientId: "", LabId: lab.val(), SubAccount: false })
            .done(function (data) {
                $(data).each(function () {
                    $("<option value=" + this.ClientId + ">" + this.ClientName + "</option>").appendTo(mainAccount);
                });
                // Hide loading icon
                displayBadgeLoader(mainAccount, $('#ma-loader'), $('#ma-badge'), false);

                // Update badge count so user can get easy confirmation of how many items there are in the drop down list
                updateBadgeCounts(mainAccount, $('#ma-badge'), false, false);
                disableEnableWizStep2Radios();
            })
            .fail(function (jqxhr, textStatus, error) {
                displayBadgeLoader(mainAccount, $('#ma-loader'), $('#ma-badge'), false);
                if (jqxhr.status = 403) {
                    SessionTimeoutRedirector();
                }
                else if (jqxhr.status != 200) {
                    ttGrowl('An Error Has Occurred', 'Error processing request: ' + jqxhr.status + ' ' + textStatus, 'error');
                }
            });
    });
}

// Get list of client sub-accounts from the specified main account
function attachClientMainAccEventHandler() {

    var container = $('#fmcontainer2');

    $('#MainAccount').on('select2-removed', function (e) {
        resetWizStep2Element($('#SubAccount'), $('#sa-badge'));
        resetWizStep2Element($('#LabAccNum'), $('#la-badge'));
        resetWizStep2Element($('#TestCode'), $('#tc-badge'));
        disableEnableWizStep2Radios();
        // Clear sub account radio
        toggleAccountRadio('', 'subaccount');
        HideTestTypeSiteAvailablityWarning();
    });

    container.on('change', '#MainAccount, input:radio[value=mainaccount]', function () {

        var lab = container.find('#Lab');
        var mainAccount = container.find('#MainAccount');
        var subAccount = container.find("#SubAccount");
        var labAccNum = container.find("#LabAccNum");
        var testCode = container.find("#TestCode");

        HideTestTypeSiteAvailablityWarning();

        // Do not proceed if lab id is blank
        if (mainAccount.val() == '') {
            // Update badge count so user can get easy confirmation of how many items there are in the drop down list
            updateBadgeCounts(subAccount, $('#sa-badge'), true, true);
            return;
        }

        // Auto select main account radio button when user selects an item from the list     
        // Do not auto select if item length is 0
        if (mainAccount.length > 0) {
            if (!mainAccount.val().length == 0) {
                toggleAccountRadio('mainaccount', 'subaccount');
            }
                // Clear main account radio 
            else {
                toggleAccountRadio('', 'mainaccount');
            }
        }

        // do not remove sub-account selection if user clicked the radio button
        if (!$(this).is('input:radio[value=mainaccount]')) {
            subAccount.find('option[value!=""]').remove();
        }
        labAccNum.find('option[value!=""]').remove();
        testCode.find('option[value!=""]').remove();
        resetWizStep2Element($('#TestCode'), $('#tc-badge'));

        // do not display sub-account loader if user clicked the radio button
        if (!$(this).is('input:radio[value=mainaccount]')) {
            // Show loading icon for sub account drop down list
            displayBadgeLoader(subAccount, $('#sa-loader'), $('#sa-badge'), true);
        }
        // Show loading icon for lab account number drop down list
        displayBadgeLoader(labAccNum, $('#la-loader'), $('#la-badge'), true);

        // do not get new sub-account list if user clicked the radio button
        if (!$(this).is('input:radio[value=mainaccount]')) {
            // Get sub-accounts registered to main-account
            $.getJSON($(this).attr("data-tt-action"), { ClientId: mainAccount.val(), LabId: lab.val(), SubAccount: true })
            .done(function (data) {
                $(data).each(function () {
                    $("<option value=" + this.ClientId + ">" + this.ClientName + "</option>").appendTo(subAccount);
                });
                // Hide loading icon
                displayBadgeLoader(subAccount, $('#sa-loader'), $('#sa-badge'), false);

                // Update badge count so user can get easy confirmation of how many items there are in the drop down list
                updateBadgeCounts(subAccount, $('#sa-badge'), false, false);
                disableEnableWizStep2Radios();
            })
            .fail(function (jqxhr, textStatus, error) {
                // Hide loading icon
                displayBadgeLoader(labAccNum, $('#sa-loader'), $('#sa-badge'), false);
                if (jqxhr.status = 403) {
                    SessionTimeoutRedirector();
                }
                else if (jqxhr.status != 200) {
                    ttGrowl('An Error Has Occurred', 'Error processing request: ' + jqxhr.status + ' ' + textStatus, 'error');
                }
            });
        }

        // Get all account numbers registered to main-account
        $.getJSON($(this).attr("data-tt-action-secondary"), { ClientId: mainAccount.val(), LabId: lab.val() })
        .done(function (data) {
            $(data).each(function () {
                $("<option value=" + this.SAPAccountNumber + ">" + this.AccountDescription + "</option>").appendTo(labAccNum);
            });

            // Hide loading icon
            displayBadgeLoader(labAccNum, $('#la-loader'), $('#la-badge'), false);

            // Update badge count so user can get easy confirmation of how many items there are in the drop down list
            updateBadgeCounts(labAccNum, $('#la-badge'), false, false);
            disableEnableWizStep2Radios();
        })
        .fail(function (jqxhr, textStatus, error) {
            // Hide loading icon
            displayBadgeLoader(labAccNum, $('#la-loader'), $('#la-badge'), false);
            if (jqxhr.status = 403) {
                SessionTimeoutRedirector();
            }
            else if (jqxhr.status != 200) {
                ttGrowl('An Error Has Occurred', 'Error processing request: ' + jqxhr.status + ' ' + textStatus, 'error');
            }
        });
    });
}

// Get list of client lab account numbers registered the specified sub-account
function attachClientSubAccEventHandler() {

    var container = $('#fmcontainer2');

    $('#SubAccount').on('select2-removed', function (e) {
        resetWizStep2Element($('#LabAccNum'), $('#la-badge'));
        resetWizStep2Element($('#TestCode'), $('#tc-badge'));
        disableEnableWizStep2Radios();
        HideTestTypeSiteAvailablityWarning();
    });

    container.on('change', '#SubAccount, input:radio[value=subaccount]', function () {

        var lab = container.find("#Lab");
        var mainAccount = container.find("#MainAccount");
        var subAccount = container.find("#SubAccount");
        var labAccNum = container.find("#LabAccNum");
        var testCode = container.find("#TestCode");

        HideTestTypeSiteAvailablityWarning();

        // Do not proceed if lab id is blank
        if (subAccount.val() == '') {
            // Update badge count so user can get easy confirmation of how many items there are in the drop down list
            updateBadgeCounts(labAccNum, $('#la-badge'), true, true);
            return;
        }

        // Auto select sub account radio button when user selects an item from the list     
        // Do not auto select if item length is 0
        if (subAccount.length > 0) {
            if (!subAccount.val().length == 0) {
                toggleAccountRadio('subaccount', 'mainaccount');
            }
                // Clear sub account radio and switch selection to main account radio
            else {
                $('input:radio[value=mainaccount]').click();
                //toggleAccountRadio('mainaccount', 'subaccount');
            }
        }

        labAccNum.find('option[value!=""]').remove();
        testCode.find('option[value!=""]').remove();
        resetWizStep2Element($('#TestCode'), $('#tc-badge'));

        displayBadgeLoader(labAccNum, $('#la-loader'), $('#la-badge'), true);

        // Get all account numbers registered to sub-account
        $.getJSON($(this).attr("data-tt-action-secondary"), { ClientId: subAccount.val(), LabId: lab.val() })
        .done(function (data) {
            $(data).each(function () {
                $("<option value=" + this.SAPAccountNumber + ">" + this.AccountDescription + "</option>").appendTo(labAccNum);
            });

            // Hide loading icon
            displayBadgeLoader(labAccNum, $('#la-loader'), $('#la-badge'), false);

            // Update badge count so user can get easy confirmation of how many items there are in the drop down list
            updateBadgeCounts(labAccNum, $('#la-badge'), false, false);
            disableEnableWizStep2Radios();
        })
        .fail(function (jqxhr, textStatus, error) {
            // Hide loading icon
            displayBadgeLoader(labAccNum, $('#la-loader'), $('#la-badge'), false);
            if (jqxhr.status = 403) {
                SessionTimeoutRedirector();
            }
            else if (jqxhr.status != 200) {
                ttGrowl('An Error Has Occurred', 'Error processing request: ' + jqxhr.status + ' ' + textStatus, 'error');
            }
        });
    });
}

function TestCodeEventHandler()
{
    var container = $('#fmcontainer2');
    container.on('change', '#TestCode', function () {
        if ($("#s2id_TestCode").text().indexOf("HRS") > -1) { $("#HRS-alert").removeClass("nodisplay"); }
        else { $("#HRS-alert").addClass("nodisplay"); }
        if ($("#s2id_TestCode").text().indexOf("DOT") > -1) { $("#DOT-alert").removeClass("nodisplay"); }
        else { $("#DOT-alert").addClass("nodisplay"); }
    });
}

// Get list of test codes when user selects lab account number
function attachLabAccNumEventHandler() {

    var container = $('#fmcontainer2');

    $('#LabAccNum').on('select2-removed', function (e) {
        resetWizStep2Element($('#TestCode'), $('#tc-badge'));
        HideTestTypeSiteAvailablityWarning();
    });

    container.on('change', '#LabAccNum', function () {

        var testCode = container.find("#TestCode");
        var lab = container.find("#Lab");
        var labAccNum = container.find("#LabAccNum");

        var Location = $("#LabAccNum option[value='" + labAccNum.val() + "']").text().replace((labAccNum.val() + " - "), "");

        HideTestTypeSiteAvailablityWarning();

        if (Location == $("#s2id_MainAccount .select2-chosen").text() || Location == $("#s2id_SubAccount .select2-chosen").text()) {
            Location = "N/A";
        }

       // if ($("#s2id_TestCode").text().indexOf("HRS") > -1) { alert("here"); }

        $("#AccountClientName").val(Location);

        // Do not proceed if lab id is blank
        if (labAccNum.val() == '') {
            // Update badge count so user can get easy confirmation of how many items there are in the drop down list
            updateBadgeCounts(testCode, $('#tc-badge'), true, true);
            return;
        }

        testCode.find('option[value!=""]').remove();

        displayBadgeLoader(testCode, $('#tc-loader'), $('#tc-badge'), true);

        $.getJSON($(this).attr("data-tt-action"), { AccountNumber: labAccNum.val(), LabId: lab.val() })
            .done(function (data) {
                $(data).each(function () {
                    $("<option value=" + this.TestCode + ">" + this.TestCode + " - " + this.TestCodeDescription + " (" + this.BodySpecimen + ")" + "</option>").appendTo(testCode);
                });

                // Hide loading icon
                displayBadgeLoader(testCode, $('#tc-loader'), $('#tc-badge'), false);

                // Update badge count so user can get easy confirmation of how many items there are in the drop down list
                updateBadgeCounts(testCode, $('#tc-badge'), false, false);
            })
        .fail(function (jqxhr, textStatus, error) {
            // Hide loading icon
            displayBadgeLoader(testCode, $('#tc-loader'), $('#tc-badge'), false);
            if (jqxhr.status = 403) {
                SessionTimeoutRedirector();
            }
            else if (jqxhr.status != 200) {
                ttGrowl('An Error Has Occurred', 'Error processing request: ' + jqxhr.status + ' ' + textStatus, 'error');
            }
        });
    });
}

// Reinitialzie JQuery Unobtrusive Validation for forms that are dynamically reloaded via AJAX
function reinitializeJQOValidation() {
    var $form = $("form");

    $form.unbind();
    $form.data("validator", null);

    $.validator.unobtrusive.parse(document);
    // Re add validation with changes
    $form.validate($form.data("unobtrusiveValidation").options);
    addValidationClasses(false);
}

function disableButton(buttonId) {
    $button = $(buttonId);
    $button.prop('disabled', true);
}

function enableButton(buttonId) {
    $button = $(buttonId);
    $button.prop('disabled', false);
}

function autoScrollElement(container, scrollTo) {
    container.animate({
        scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
    });
}


function setInputMasks() {

    $.mask.definitions['T'] = '[AM,PM,am,pm]';
    // First digit of Month
    $.mask.definitions['M'] = '[0-1]';
    // First digit of Day
    $.mask.definitions['D'] = '[0-3]';
    // First digit of Year
    $.mask.definitions['Y'] = '[1-2]';
    // First digit of Hour
    $.mask.definitions['H'] = '[0-1]';
    // First digit of Minute
    $.mask.definitions['m'] = '[0-5]';

    $("#DayTimePhone").mask("(999) 999-9999", { placeholder: " " });
    $("#EveningPhone").mask("(999) 999-9999", { placeholder: " " });
    $("#CellPhone").mask("(999) 999-9999", { placeholder: " " });
    $("#HomePhone").mask("(999) 999-9999", { placeholder: " " });
    $("#DateOfBirth").mask("M9/D9/Y999", { placeholder: " " });
    $("#ConfirmationShipDate").mask("M9/D9/Y999", { placeholder: " " });
    $("#CollectionDate").mask("M9/D9/Y999", { placeholder: " " });
    $("#OrderExpirationDate").mask("M9/D9/Y999", { placeholder: " " }); // Order Expiration Date
    $("#OrderExpirationTime").mask("?99:m9 TT", { placeholder: " ", autoclear: false }); // Order Expiration Time

}

function ttGrowl(title, message, type) {
    switch (type) {
        case 'success':
        case 'notice':
            $.growl.notice({ title: title, message: message, size: "large" });
            break;
        case 'warning':
            $.growl.warning({ title: title, message: message, size: "large" });
            break;
        case 'error':
            $.growl.error({ title: title, message: message, size: "large" });
            break;
        default:
            $.growl({ title: title, message: message, size: "large" });
    }
};

// Attach an event to the delete button in the Delete Order modal window
function attachDeleteConfirmationEventHandler() {
    $('#BodyRender').on("click", '#btnDeleteOrder', function () {
        var deleteConfirmId;
        deleteConfirmId = $('#deleteModal').attr('data-tt-deleteid');
        //var DeleteButton = $("#jq-ECCF-OrderList_wrapper").find("[data-tt-id='" + deleteConfirmId + "']");
        var DeleteButton = $("#jq-ECCF-OrderList").find("[data-tt-id='" + deleteConfirmId + "']");

        if (VerifyConfirmationNumber(deleteConfirmId)) {
            $("#btnDeleteOrder").button('loading');
            if ($('#deleteOrder').attr('data-page-type') == "Details") {
                $("#deleteOrder").button('loading');
            }
            DeleteButton.button('loading');
            DissableECCFOrderButtons(true);
            $('#btnDeleteOrder').addClass('disabled');
            $('#deleteModal').modal('hide'); // Hide modal form
            $('#btnDeleteOrder').removeClass('disabled');
            $.ajax({
                type: "POST",
                cache: false,
                url: $('#btnDeleteOrder').attr('data-tt-target'),
                data: AddAntiForgeryToken({ orderConfirmationNum: deleteConfirmId }),
                dataType: "html",
                //success: function (data, textStatus, jqXHR) { ttGrowl('Delete Successfull', "Order #: " + deleteConfirmId + " has been Deleted successfully.", 'success'); },
                error: function (jqXHR, textStatus, errorThrown) {
                    DissableECCFOrderButtons(false);
                    if (jqXHR.status == 400) {
                        $("button#btnDeleteOrder").button('reset');
                        if ($('#deleteOrder').attr('data-page-type') == "Details") {
                            $("#deleteOrder").button('reset');
                        }
                        DeleteButton.button('reset');
                        ttGrowl('Unable To Delete Order', jqXHR.responseText, 'error');
                    }
                    else { ttGrowl('An Error Has Occurred', 'Error processing delete .request: ' + jqXHR.status + ' ' + jqXHR.statusText, 'error'); }
                },
                statusCode: {
                    403: function () {
                        $("#btnDeleteOrder").button('reset');
                        if ($('#deleteOrder').attr('data-page-type') == "Details") {
                            $("#deleteOrder").button('reset');
                        }
                        DeleteButton.button('reset');
                        SessionTimeoutRedirector();
                    }


                }
            })
            .done(function (data) {

                $("#btnDeleteOrder").button('reset');
                if ($('#deleteOrder').attr('data-page-type') == "Details") {
                    $("#deleteOrder").button('reset');
                }
                // Hide row with slow fade out effect
                $('tr[id="' + deleteConfirmId + '"]').fadeOut("slow", function () {
                    var Table = $.ttGlobalVars.dTable.dataTable({ "bRetrieve": true })
                    var PageNumber = (Table.fnPagingInfo().iPage + 1);
                    if ((Table.fnPagingInfo().iTotalPages == PageNumber) &&
                        (Table.fnPagingInfo().iTotal == (((PageNumber - 1) * Table.fnPagingInfo().iLength) + 1))) {
                        PageNumber = PageNumber - 1;
                    }
                    Table.fnDeleteRow($(this), function () { Table.fnPageChange(PageNumber - 1); }, false);
                });
                // Redirect user if they are on the Details page
                if ($("#deleteOrder").attr("data-tt-page-action") == "Details") {
                    //$("#DeleteOrderDetailsLoadingImage").show();
                    setTimeout(("location.href = '/ECCFOrder?OrderConfirmation=" + deleteConfirmId + "&e=" + "1" + "';"), 1)
                }
                else {
                    // $("#DeleteOrderDetailsLoadingImage").Hide();
                    ttGrowl('Delete Successfull', "Order #: " + deleteConfirmId + " has been Deleted successfully.", 'success');
                }
            });
        }
    });
};
//disable or enable ECCFOrder Buttons
function DissableECCFOrderButtons(Disable) {
    if (Disable) {
        $('#deleteOrder').addClass('disabled');
        $('#btnECCFOrderEdit').addClass('disabled');
        $('#btnECCFOrderPrint').addClass('disabled');
        $('#btnECCFOrderEmail').addClass('disabled');
    }
    else {
        $('#deleteOrder').removeClass('disabled');
        $('#btnECCFOrderEdit').removeClass('disabled');
        $('#btnECCFOrderPrint').removeClass('disabled');
        $('#btnECCFOrderEmail').removeClass('disabled');
    }
}

// Attach an event to the order/row delete option on the datatable to send the order confirmation #
// to the modal window
function attachDeleteOptionEventHandler() {
    $('#BodyRender').on("click", "#deleteOrder", function () {
        if (VerifyConfirmationNumber($("#deleteOrder").attr('data-tt-id'))) {
            var deleteConfirmId;
            deleteConfirmId = $(this).attr('data-tt-id');
            $(this).parent().children("#DeleteOrderLoadingImage").show()
            $('#deleteModalBody').empty();
            if ($('#deleteOrder').attr('data-page-type') == "Details") {
                $("#deleteOrder").button('loading');
            }
            $.ajax({
                type: "POST",
                cache: false,
                url: $('#deleteModalBody').attr('data-tt-target'),
                data: AddAntiForgeryToken({ orderConfirmationNum: deleteConfirmId }),
                dataType: "html",
                //success: function(data, textStatus, jqXHR) { alert('Success. Status is: ' + textStatus) },
                error: function (jqXHR, textStatus, errorThrown) {
                    $(this).parent().children("#DeleteOrderLoadingImage").hide()
                    if (jqXHR.status == 400) {
                        $("button#btnDeleteOrder").button('reset');
                        if ($('#deleteOrder').attr('data-page-type') == "Details") {
                            $("#deleteOrder").button('reset');
                        }
                        ttGrowl('Unable To Delete Order', jqXHR.responseText, 'error');
                    }
                    else { ttGrowl('An Error Has Occurred', 'Error processing delete request: ' + jqXHR.status + ' ' + jqXHR.statusText, 'error'); }
                },
                statusCode: {
                    403: function () {
                        $(this).parent().children("#DeleteOrderLoadingImage").hide()
                        SessionTimeoutRedirector();
                        if ($('#deleteOrder').attr('data-page-type') == "Details") {
                            $("#deleteOrder").button('reset');
                        }
                    }
                }
            })
            .done(function (data) {
                $(this).parent().children("#DeleteOrderLoadingImage").hide
                // Add new html from ajax post response
                $('#deleteModalBody').append(data);
                $('#deleteModal').attr('data-tt-deleteid', deleteConfirmId);
                $('#deleteModal').modal('show');
                if ($('#deleteOrder').attr('data-page-type') == "Details") {
                    $("#deleteOrder").button('reset');
                }
            });
        }
    });

};

function GetSearchCriteriaAndBuildDataTable(dtElement, dtColumnOptArray, dtContainer, listType) {

    if (listType == "order") {
        var searchCriteria = {
            "LastNDays": $.ttGlobalVars.lastSelection,
            "CollectionStatus": "",
            "Criteria": {
                "OrderConfNum": "",
                "DonorId": "",
                "DonorLast": "",
                "DonorPhone": "",
                "CompanyName": "",
            }
        }
    }
    else if (listType == "collection") {
        var searchCriteria = {
            "LastNDays": $('#coll-list-search').val().trim().length > 0 ? $.ttGlobalVars.lastSelection : 30,
            //"CollectionStatus": $('#coll-list-search').val().trim().length > 0 ? $('input[name=collection-status]:checked').val() : "",
            "CollectionStatus": $('input[name=collection-status]:checked').val(),
            "Criteria": {
                "OrderConfNum": $("#criteria-select option:selected").text() == "Order Confirmation #" ? $('#coll-list-search').val() : "",
                "DonorId": $("#criteria-select option:selected").text() == "Donor Id" ? $('#coll-list-search').val() : "",
                "DonorLast": $("#criteria-select option:selected").text() == "Donor Lastname" ? $('#coll-list-search').val() : "",
                "DonorPhone": $("#criteria-select option:selected").text() == "Donor Phone" ? $('#coll-list-search').val() : "",
                "CompanyName": $("#criteria-select option:selected").text() == "Company Name" ? $('#coll-list-search').val() : "",
            }
        }
    }

    // Response will be html that will be used to build the datatable
    BuildECCFListDataTable(searchCriteria, true, dtElement, dtColumnOptArray, listType, dtContainer, false);

}

// Submit ajax request to server when user selects a number of last days to view in the View dropdown
// on the datatable header
function attachDTUpdateEventHandler(dtElement, dtColumnOptArray, dtContainer, listType) {
    dtContainer.on("change", "#eccfViewList", function () {
        // Save last select value
        $.ttGlobalVars.lastSelection = $(this).val();

        GetSearchCriteriaAndBuildDataTable(dtElement, dtColumnOptArray, dtContainer, listType);
    });
};

// Submit ajax request to server when user searches for a criteria on the collection/order list page
function attachDTSearchEventHandler(dtElement, dtColumnOptArray, dtContainer, listType) {


    // Search Button Mouse Click
    $("#BodyRender").on("click", "#coll-list-search-btn", function () {
        HideListShowLoading(dtElement);
        ChangeButtonLoadState($("#coll-list-search-btn"), true);
        GetSearchCriteriaAndBuildDataTable(dtElement, dtColumnOptArray, dtContainer, listType);

    });

    // Enter Key Press
    $("#CollListIndex").keypress(function (e) {
        if (e.which == 13) {
            //alert("here")
            HideListShowLoading(dtElement);
            ChangeButtonLoadState($("#coll-list-search-btn"), true);
            GetSearchCriteriaAndBuildDataTable(dtElement, dtColumnOptArray, dtContainer, listType);
        }
    });

    //// Enter Key Press
    //$("#FormStep1").keypress(function (e) {  
    //    if (e.which == 13) {
    //        alert("beep2");
    //        $('#Step1').click();
    //    }
    //});
};

function HideListShowLoading(dtElement) {
    $(dtElement.selector + '_wrapper').hide();
    $('#ListCreateOrder').hide();
    $("#ListLoadingBottom").show();
}

function BuildECCFListDataTable(searchCriteria, ajaxRequestData, dtElement, dtColumnOptArray, listType, dtContainer, applyDefaultFilter) {

    // Check if attribute exists before attempting ajax call
    if (dtElement.is("[data-tt-target]")) {
        if (ajaxRequestData) {
            $.ajax({
                type: "POST",
                cache: false,
                url: dtElement.attr('data-tt-target'),
                data: {
                    lastNDays: searchCriteria.LastNDays,
                    OrderConfirmationNumber: searchCriteria.Criteria.OrderConfNum,
                    CollectionStatus: searchCriteria.CollectionStatus == "Pending" ? "Collection Pending" : searchCriteria.CollectionStatus,
                    EmployeeId: searchCriteria.Criteria.DonorId,
                    EmployeeLastName: searchCriteria.Criteria.DonorLast,
                    EmployeePhone: searchCriteria.Criteria.DonorPhone,
                    EmployerCompanyName: searchCriteria.Criteria.CompanyName
                },
                dataType: "html",
                statusCode: {
                    403: function () {
                        SessionTimeoutRedirector();
                    }
                }
            })
            .done(function (data) {
                // Grab filter string to display after table redraw
                var filter = $("div.dataTables_filter label input").val();

                destroyDataTable(dtElement);
                // Add new html to container div from ajax post response            
                dtContainer.append(data);

                initDataTable(dtElement, dtColumnOptArray, listType, dtContainer);
                styleDataTable(dtElement);

                // Apply filter
                $.ttGlobalVars.dTable.fnFilter(filter);
                $("div.dataTables_filter label input").val(filter)

                // Select last selected item in dropdown
                $('#eccfViewList').val($.ttGlobalVars.lastSelection);

                // Re-init tooltips
                $('[data-controlType="tooltip"]').tooltip();
                ChangeButtonLoadState($("#coll-list-search-btn"), false);
            });
        }
        else {
            initDataTable(dtElement, dtColumnOptArray, listType, dtContainer);
            styleDataTable(dtElement);

            //alert(dtElement.attr("data-tt-filter"));

            // Apply default filter condition
            if (applyDefaultFilter) {
                $.ttGlobalVars.dTable.fnFilter($("div.dataTables_filter label input").val(dtElement.attr('data-tt-filter')).val())
            }

            // Select last selected item in dropdown
            $('#eccfViewList').val($.ttGlobalVars.lastSelection);
            // Re-init tooltips
            $('[data-controlType="tooltip"]').tooltip();
            //$("#loadingImg-display-dt").hide();
        }
    }
};

// Initialize datatable and set default values
function initDataTable(dtElement, dtColumnOptArray, listType, dtContainer) {
    // Enables data sorting in jquery datatable (asc)
    jQuery.fn.dataTableExt.oSort['us_date-asc'] = function (a, b) {
        var x = new Date(a),
            y = new Date(b);
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    };

    // Enables data sorting in jquery datatable (desc)
    jQuery.fn.dataTableExt.oSort['us_date-desc'] = function (a, b) {
        var x = new Date(a),
            y = new Date(b);
        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
    };

    // Init OrderList Datatable
    $.ttGlobalVars.dTable = $(dtElement.selector).dataTable({
        "bProcessing": true,
        "aoColumns": dtColumnOptArray,
        /* Disable initial sort */
        "aaSorting": [],
        "oLanguage": {
            "sInfo": 'Showing _START_ to _END_ of _TOTAL_ ' + listType + '(s)',
            "sInfoEmpty": "No available " + listType + "s to display",
            "sEmptyTable": dtElement.selector == "#jq-ECCF-CollectionList" ? 'Enter in criteria and click "Search" to find results' : ""
        },
        "fnPreDrawCallback": function () {
            //alert("Pre Draw");
        },
        "fnDrawCallback": function () {
            initToolTips();
        },
        "fnInitComplete": function () {
            $(dtElement.selector + '_wrapper').parent().fadeIn(500);
            $("#ListCreateOrder").show();
            $("#ListLoading").hide();
            $("#ListLoadingBottom").hide();
            $("#ListTopBlock").show();
        },
    });


    // Store information about the the current datatable's pagination values
    $.fn.dataTableExt.oApi.fnPagingInfo = function (oSettings) {
        return {
            "iStart": oSettings._iDisplayStart,
            "iEnd": oSettings.fnDisplayEnd(),
            "iLength": oSettings._iDisplayLength,
            "iTotal": oSettings.fnRecordsTotal(),
            "iFilteredTotal": oSettings.fnRecordsDisplay(),
            "iPage": Math.ceil(oSettings._iDisplayStart / oSettings._iDisplayLength),
            "iTotalPages": Math.ceil(oSettings.fnRecordsDisplay() / oSettings._iDisplayLength)
        };
    }
};
// Add drop down list to allow user to get new ECCF list by last 'N' days
function styleDataTable(dtElement) {
    var viewHtml = '<div class="eccfList-View"><span>View: </span>';

    viewHtml += '<select class="form-control input-sm" id="eccfViewList">'
    viewHtml += '<option value="30" selected="selected">Recent Activity</option>'
    viewHtml += '<option value="60">Last 60 Days</option>'
    viewHtml += '<option value="90">Last 90 Days</option>'
    viewHtml += '<option value="-1">All</option>'
    viewHtml += '</select>'
    viewHtml += '</div>';

    // Append drop down list hmtl datatable header
    $(dtElement.selector + '_wrapper .table-caption').append(viewHtml);
    // Add filter option to datatable header
    $(dtElement.selector + '_wrapper .dataTables_filter input').attr('placeholder', 'Filter...');
    $('.DT-per-page').after('<span class="DT-search-icon fa fa-filter"></span>');

    // Remove duplicate search spans
    var found = {};
    $('.DT-search-icon').each(function () {
        var txt = $(this).text();
        if (found[txt])
            $(this).remove();//Tooltip
        else
            found[txt] = true;
    });
};

// Removes datatable from page and shows Loading gif
function destroyDataTable(dtElement) {
    $(dtElement.selector + '_wrapper').parent().fadeIn(500);
    $(dtElement.selector + '_wrapper').parent().remove();
    $(dtElement.selector).dataTable().fnDestroy();
    $("#ListCreateOrder").hide();
    $("#ListLoading").show();
    $("#ListTopBlock").hide();
};

function initToolTips() {
    //Init ToolTips
    $('[data-controltype="tooltip"]').tooltip();
}

function ChangeButtonLoadState(buttonSelector, isLoading) {
    var btn = $(buttonSelector);
    if (isLoading) {
        btn.button('loading')
    }
    else {
        setTimeout(function () {
            btn.button('reset');
        }, 200)
    }
};

function setDateTimePickers() {
    // Expiration Date
    $('#dtpExpirationD').datetimepicker({
        pickTime: false,
        showToday: false,
        minDate: moment().add('days', 1).format('MM/DD/YYYY'),
        defaultDate: moment().add('days', 2).format('MM/DD/YYYY')
    });

    // Expiration Time
    $('#dtpExpirationT').datetimepicker({
        icons: {
            time: "fa fa-clock-o",
            date: "fa fa-calendar",
            up: "fa fa-arrow-up",
            down: "fa fa-arrow-down"
        },
        pickDate: false,
        pickTime: true,
        pick12HourFormat: true,
        format: 'hh:mm A',
        defaultDate: moment().format('MM/DD/YYYY, hh:mm A')
    });

    // Date of Birth Date/Time
    $('#dobdatetimepicker').datetimepicker({
        pickTime: false,
        showToday: false,
        viewMode: 'years',
        //defaultDate: moment().add('years', -18).format('MM/DD/YYYY'),
        maxDate: moment().add('days', -1).format('MM/DD/YYYY'),
        useCurrent: false
    });

    // Confirmation Ship Date
    $('#dtpShipD').datetimepicker({
        pickTime: false,
        showToday: false,
        minDate: moment().add('days', 0).format('MM/DD/YYYY'),
        defaultDate: moment().add('days', 0).format('MM/DD/YYYY')
    });
}

function setGeneralControlEvents() {

    $('#criteria-select').selectpicker({
        style: 'btn-red'
    });

    $('#criteria-select').change(function () {
        $('#coll-list-search').focus().select();
    });

    $('#coll-list-search').focus();

    $('#coll-list-search').scannerDetection(function (data) {
        //$('#coll-list-search').val(data); // clear text box and input data scanned from barcode
        //$("#coll-list-search-btn").trigger("click");
        onComplete: {
            if (data.length = 16 && data.substr(data.length - 1) == "0") {
                $('#coll-list-search').val(data.slice(0, -1));
            }
            else {
                $('#coll-list-search').val(data);

            }
            $("#coll-list-search-btn").trigger("click");
        }
    });

    // Set DOB from Bootstrap Date/Time Picker and Display DOB age notice if necessary
    $("#dobdatetimepicker").on("dp.change", function (e) {
        var dtpDate = new Date(e.date);
        var mDate = moment(dtpDate);

        //$('#DateOfBirth').val(mDate.format('L'));

        if (LessThan18(mDate, moment())) {
            $("#dob_alert").show();
        }
        else {
            $("#dob_alert").hide();
        }

        // Re-validate field to remove any validation errors
        $("#DateOfBirth").valid();
    });

    $('#dtpExpirationT').on("dp.change", function (e) {
        //alert($('#OrderExpirationTime').val());
        //alert($('#OrderExpirationTime').val().length);
    });

    $('#DateOfBirth').focusout(function () {

        if (LessThan18($('#DateOfBirth').val(), moment())) {
            $("#dob_alert").show();
        }
        else {
            $("#dob_alert").hide();
        }
    });
}

function LessThan18(dateOfBirth, currentDate) {
    if (currentDate.diff(dateOfBirth, 'years') < 18) {
        return true;
    }
}

function SessionTimeoutRedirector() {
    PixelAdmin.plugins.alerts.add("<strong>Login Expired!</strong> Your login has timed out. Redirecting to login page...", {
        type: 'danger',
        namespace: 'pa_page_alerts_dark',
        classes: 'alert-dark'
    })
    setTimeout("location.href = '" + window.location.pathname + "';", 3000);
}

function DisplayPageInitialMessage() {

    var MessageType = "";
    var MessageTitle;
    var Message;

    switch ($("#EditValue").val()) {
        case "1":
            MessageType = "success"
            MessageTitle = '<i class="fa fa-pencil"></i>&nbsp;Edit Successful!'
            Message = $("#EditMessage").val()
            break;
    }
    switch ($("#DeleteValue").val()) {
        case "1":
            MessageType = "success"
            MessageTitle = '<i class="fa fa-trash-o"></i>&nbsp;Delete Successful!'
            Message = $("#DeleteMessage").val()
            break;
    }
    switch ($("#CancelValue").val()) {
        case "1":
            MessageType = "success"
            MessageTitle = '<i class="fa fa-trash-o"></i>&nbsp;Cancellation Successful!'
            Message = $("#CancelMessage").val()
            break;
    }
    switch ($("#CompleteValue").val()) {
        case "1":
            MessageType = "success"
            MessageTitle = '<i class="fa fa-trash-o"></i>&nbsp;Submission Successful!'
            Message = $("#CompleteMessage").val()
            break;
    }

    if (MessageType != "") {
        window.addEventListener("load", function () {
            ttGrowl(MessageTitle, Message, MessageType);
            PixelAdmin.plugins.alerts.add(("<strong>" + MessageTitle + "</strong> " + Message), {
                type: MessageType,
                namespace: 'pa_page_alerts_dark',
                classes: 'alert-dark',
                auto_close: 3
            })

        });
    }
}

function InitializePixelAdminLayoutDefaults() {
    // Expand root main menu nodes by default
    $('body').find('.mm-dropdown').each(function () {
        $(this).addClass("open");
    });
}

function EventCountDisplayFunction() {
    if (IsThereEvents()) {
        $("#EventCountDisplay").text('');
    }
    else {
        $("#EventCountDisplay").text($('#EventTableBody tr').length)
    };
}
function IsThereEvents() { return $('#EventTableBody tr').length < 1; }



function OrderConfirmationEmail() {
    $("#BodyRender").on("click", "#SendOrderConfirmation", function () {

        if (VerifyConfirmationNumber($('#btnECCFOrderEmail').attr('data-tt-confirmnum'))) {
            $("#emailModal").modal('show');
            if ($('#OrderConfirmationEmailField').hasClass("has-error") == true) { alert("You entered the email wrong"); return; }
            if ($('#EmailTarget').val() == "") { alert("Please fill in the E-mail field"); return; }
            $.ajax({
                type: "POST",
                url: $('#commentform').attr('data-tt-target'),
                data: $('#commentform').serialize(),
                dataType: 'html',
                async: false,
                error: function (jqXHR, textStatus, errorThrown) {
                    if (jqXHR.status == 403) {
                        SessionTimeoutRedirector();
                    }

                    else {
                        ttGrowl('An Error Has Occurred', 'Error during Order Confirmation Email', 'error');
                    }
                },
                success: function (data) {

                    $("#emailModal").modal('hide');
                    ttGrowl('Sent', 'Your E-mail has been sent', 'notice');
                    //alert("send");
                    //$("#ContactUsPanel").fadeOut(500);
                    //$("#ContactUsSucessMessage").fadeIn(500);
                    //ttGrowl('The Message Was succesfully Sent.', 'Message received. We will be contacting you shortly. Thank you.', 'notice');
                }
            });
        }
    });
}

function ContactUsEMail() {
    if (!$('html').hasClass('ie8')) {
        $('#Message').summernote({
            height: 200,
            tabsize: 2
        });
    }

    $(".note-view").hide();
    $(".note-help").hide();
    $(".note-insert").hide();
    $(".note-table").hide();

    $("#SendContactUsEmail").click(function () {
        if ($('#EmailOfContactUsForm').hasClass("has-error") == true) { alert("You entered the email wrong"); return; }
        if ($('#EmailOfSender').val() == "") { alert("Please fill in the E-mail field"); return; }
        $('#Message').val(htmlEncode($('#Message').code()));
        $.ajax({
            type: "POST",
            url: $('#contactusform').attr('data-tt-target'),
            data: $('#contactusform').serialize(),
            dataType: 'html',
            async: false,
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status == 403) {
                    SessionTimeoutRedirector();
                }
                else {
                    ttGrowl('An Error Has Occurred', 'Error processing create order step: ' + jqXHR.status + ' ' + jqXHR.statusText, 'error');
                }
            },
            success: function (data) {

                $("#ContactUsPanel").fadeOut(500);
                $("#ContactUsSucessMessage").fadeIn(500);
                ttGrowl('The Message Was succesfully Sent.', 'Message received. We will be contacting you shortly. Thank you.', 'notice');
            }
        });
    });
}
function htmlEncode(value) {
    //create a in-memory div, set it's inner text(which jQuery automatically encodes)
    //then grab the encoded contents back out.  The div never exists on the page.
    return $('<div/>').text(value).html();
}

//function attachDeleteOptionEventHandler() {
//    $('#BodyRender').on("click", "#deleteOrder", function () {
//        if (VerifyConfirmationNumber($(this).attr('data-tt-id'))) {
//            var deleteConfirmId;
//            deleteConfirmId = $(this).attr('data-tt-id');

//            $('#deleteModalBody').empty();

//            $.ajax({
//                type: "POST",
//                cache: false,
//                url: $('#deleteModalBody').attr('data-tt-target'),
//                data: AddAntiForgeryToken({ orderConfirmationNum: deleteConfirmId }),
//                dataType: "html",
//                //success: function(data, textStatus, jqXHR) { alert('Success. Status is: ' + textStatus) },
//                error: function (jqXHR, textStatus, errorThrown) { ttGrowl('An Error Has Occurred', 'Error processing delete request: ' + jqXHR.status + ' ' + jqXHR.statusText, 'error'); },
//                statusCode: {
//                    403: function () {
//                        SessionTimeoutRedirector();
//                    }
//                }
//            })
//            .done(function (data) {
//                // Add new html from ajax post response
//                $('#deleteModalBody').append(data);
//                $('#deleteModal').attr('data-tt-deleteid', deleteConfirmId);
//                $('#deleteModal').modal('show');
//            });
//        }
//        else { alert("already deleted"); }
//    });

//};

$("#btnECCFOrderPrint").click(function () {
    if (VerifyConfirmationNumber($('#btnECCFOrderPrint').attr('data-tt-confirmnum'))) {
        window.open($('#btnECCFOrderPrint').attr('data-tt-target'));
    }
});

$("#btnECCFCollectionPrint").click(function () {
    if (VerifyConfirmationNumber($('#btnECCFCollectionPrint').attr('data-tt-confirmnum'))) {
        window.open($('#btnECCFCollectionPrint').attr('data-tt-target'));
    }
});


function VerifyConfirmationNumber(orderConfirmationNumber) {
    result = false;
    var Path;
    if ($("#AppRoot").attr("data-tt-root") == '/')
        Path = '/Utility/VerifyConfirmNumber';
    else
        Path = $("#AppRoot").attr("data-tt-root") + '/Utility/VerifyConfirmNumber';
    $.ajax({
        type: "POST",
        url: Path,
        data: { orderConfirmationNum: orderConfirmationNumber },
        dataType: 'JSON',
        async: false,
        error: function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.status == 403) {
                SessionTimeoutRedirector();
            }
            else {
                ttGrowl('An Error Has Occurred', 'There was an error proccessing your request', 'error');
            }
        },
        success: function (data) {
            if (!data.success) {
                ttGrowl('Unable to process your request.', 'Current object could not be found.', 'error');
            }
            result = data.success;
        }
    });
    return result;
}

function VerifyCollectibleStatus(orderConfirmationNumber) {
    result = false;
    var Path;
    if ($("#AppRoot").attr("data-tt-root") == '/')
        Path = '/Utility/VerifyEditableStatus';
    else
        Path = $("#AppRoot").attr("data-tt-root") + '/Utility/VerifyEditableStatus';
    $.ajax({
        type: "POST",
        url: Path,
        data: { orderConfirmationNum: orderConfirmationNumber },
        dataType: 'JSON',
        async: false,
        error: function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.status == 403) {
                SessionTimeoutRedirector();
            }
            else {
                ttGrowl('An Error Has Occurred', 'There was an error proccessing your request', 'error');
            }
        },
        success: function (data) {
            if (!data.success) {
                ttGrowl('Unable to Proceed with Collection.', 'Status of current order does not meet the collection requirements.', 'error');
            }
            result = data.success;
        }
    });
    return result;
}

function ECCFOrderEmail() {
    $("#btnECCFOrderEmail").click(function () {
        if (VerifyConfirmationNumber($('#btnECCFOrderEmail').attr('data-tt-confirmnum'))) {
            $("#emailModal").modal('show');
        }
    });
}

function ECCFOrderEdit() {
    $("#btnECCFOrderEdit").click(function () {
        $("#btnECCFOrderEdit").button('loading');
        if (VerifyConfirmationNumber($('#btnECCFOrderEmail').attr('data-tt-confirmnum'))) {
            // loading spinier works lag free in (ie, and crome)
            var ua = window.navigator.userAgent;
            var msie = ua.indexOf("MSIE ");
            if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
                //alert("ie");
                window.location.href = $('#btnECCFOrderEdit').attr('data-tt-target');
            }
            else {
                var url = $('#btnECCFOrderEdit').attr('data-tt-target'); // loading spinier works lag free in (firefox, and crome)
                //load & setup loading animation
                //then generate and submit form with a slight delay 
                setTimeout(function () {
                    var new_form;
                    new_form = document.createElement('form');
                    new_form.method = 'GET';
                    new_form.action = url;
                    document.body.appendChild(new_form);
                    new_form.submit();
                }, 0);
            }
        }
        else {
            $("#btnECCFOrderEdit").button('reset');
        }
    });
}

function ECCFCollectionCancel() {
    $("#btnECCFCollectionCancel").click(function () {
        if (VerifyConfirmationNumber($('#btnECCFCollectionCancel').attr('data-tt-confirmnum'))) {
            $("#cancelModal").modal('show');
        }
    });
}

function CancelCollection() {
    $("#btnCancelCollection").click(function () {
        //  if (VerifyConfirmationNumber($('#btnCancelCollection').attr('data-tt-confirmnum'))) {
        $("#btnECCFCollectionCancel").button('loading');
        $("#btnCancelCollection").button('loading');
        if ($("#collCancel option:selected").val() == "") {
            alert("Please select a cancellation reason.")
            $("#btnECCFCollectionCancel").button('reset');
            $("#btnCancelCollection").button('reset');
        }
        else {
            if (VerifyConfirmationNumber($('#btnECCFCollectionCancel').attr('data-tt-confirmnum'))) {
                ChangeStatus($('#btnECCFCollectionCancel').attr('data-tt-confirmnum'), $("#collCancel option:selected").val(), $("#Comment").val());
            }
        }

    });
}

function ChangeStatus(TestTracConfirmationNumber, Status, Comment)
{
    result = false;
    var Path;
    if ($("#AppRoot").attr("data-tt-root") == '/')
        Path = '/Utility/UpdateOrderStatus';
    else
        Path = $("#AppRoot").attr("data-tt-root") + '/Utility/UpdateOrderStatus';
    $.ajax({
        type: "POST",
        url: Path,
        data: { TestTracConfirmationNumber: TestTracConfirmationNumber, Status:Status, Comment: Comment },
        dataType: 'JSON',
        async: false,
        error: function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.status == 403) {
                SessionTimeoutRedirector();
            }
            else {
                alert("jqXHR : " + jqXHR.status + "   textStatus: " + textStatus + "     errorThrown: " + errorThrown);
                ttGrowl('An Error Has Occurred', 'There was an error proccessing your request to cancel the collection.', 'error');

                $("#btnECCFCollectionCancel").button('reset');
                $("#btnCancelCollection").button('reset');
            }
        },
        success: function (data) {
            if (!data.success) {
                ttGrowl('Unable to Proceed with canceling the Collection.', 'There was an error proccessing your request to cancel the collection.', 'error');
            }
            else {
                switch (Status) {
                    case 'Order Canceled':
                        setTimeout(window.location.href = "/ECCFCollection?Filter=ORDER CANCELED&id=" + $("#editOrderNum").attr("data-tt-ordernum") + '&e=1', 6000);
                        break;
                    case 'Refusal':
                        setTimeout(window.location.href = "/ECCFCollection?Filter=REFUSAL&id=" + $("#editOrderNum").attr("data-tt-ordernum") + '&e=1', 6000);
                        break;
                    case 'Unable To Void':
                        setTimeout(window.location.href = "/ECCFCollection?Filter=UNABLE TO VOID&id=" + $("#editOrderNum").attr("data-tt-ordernum") + '&e=1', 6000);
                        break;
                    default:
                        setTimeout(window.location.href = "/ECCFCollection", 6000);
                        break;
                }
                //ttGrowl('canceled the Collection.', ('The collection is now marked as: ' + Status), 'success');
            }
            result = data.success;
        }
    });
    return result;
}

function ECCFCollectionBegin() {
    $("#btnECCFCollectionBegin").click(function () {
        $("#btnECCFCollectionBegin").button('loading');
        disableButton("#btnECCFCollectionBegin")
        if (VerifyConfirmationNumber($('#btnECCFCollectionBegin').attr('data-tt-confirmnum'))) {
            if (VerifyCollectibleStatus($('#btnECCFCollectionBegin').attr('data-tt-confirmnum'))) {
                window.location.href = $('#btnECCFCollectionBegin').attr('data-tt-target');}
            else { $("#btnECCFCollectionBegin").button('reset'); }
        }
        else { $("#btnECCFCollectionBegin").button('reset'); }
        //$("#btnECCFCollectionBegin").button('reset');
        //enableButton("#btnECCFCollectionBegin");
    });
}

function ECCFDateTimeAddCheckMark() {
    var html = '<td><botton class="btn btn-success btn-sm" id="btnCheckBoxForTime"><i class="fa fa-check"></i></botton></td>';
    $(".timepicker-picker > table > tbody tr:nth-child(3)").append(html);
}

function CheckBoxForTime() {
    $("#btnCheckBoxForTime").click(function () {
        $('#dtpExpirationT').data("DateTimePicker").hide();
    }
     );
    $('#dobdatetimepicker').on("dp.show", function (e) {
        //alert($('#OrderExpirationTime').val());
        //alert($('#OrderExpirationTime').val().length);
    });

}

function ExpirationTimeZoneClick() {
    $("#TimeZoneGroup").on('select2-open', function () { $('#dtpExpirationT').data("DateTimePicker").hide(); });
}

//function DateChageTestEvent(Value)
//{
//    //alert(moment("03//"));
//    $('#dtpExpirationD').data("DateTimePicker").show();
//    $('#dtpExpirationD').data("DateTimePicker").date(Value);
//    $('#dtpExpirationD').data("DateTimePicker").hide();
//    //$(".bootstrap-datetimepicker-widget").show();
//    //$(".bootstrap-datetimepicker-widget").date(Value);
//    //$(".bootstrap-datetimepicker-widget").hide();
//    //$(".bootstrap-datetimepicker-widget").show();

//}

function HideTestTypeSiteAvailablityWarning()
{
    $("#HRS-alert").addClass("nodisplay"); 
    $("#DOT-alert").addClass("nodisplay"); 
}

$(document).keypress(function (e) {
    if (e.which == 13 && EverythingInFormsClosed()) {
        if ($('#FormStep1').is(':visible')) {
            $('#Step1').click();
        }
        else if ($('#FormStep2').is(':visible')) {
            $('#Step2').click();
        }
        else if ($('#FormStep3').is(':visible') && !$('#FormStep2').is(':visible') && !$('#FormStep1').is(':visible')) {
            $('#Step3').click();
        }
    }
});
function EverythingInFormsClosed() {
    if (!$(".bootstrap-datetimepicker-widget").is(':visible') && !$("#mapModal").is(':visible'))
    { return true; }
    else { return false; }
}

function setFocusOnFirstFormInput() {
    //alert("here");

    $("#ECCFOrderStep1").find("#EmployeeId").focus();
    $("#ECCFOrderStep1").find("#EmployeeId").select();

    $("#FormStep3").find("#OrderExpirationDate").focus();
    $("#FormStep3").find("#OrderExpirationDate").select();
}


//function InitiateCustomClientValidate() {
//    alert("Initiate Custom ClientValidate");
//    $(['requiredif', 'regularexpressionif', 'rangeif']).each(function (index, validationName) {
//        alert("load validation");
//        $.validator.addMethod(validationName,
//                function (value, element, parameters) {

//                    alert("inside add method");
//                    // Get the name prefix for the target control, depending on the validated control name
//                    var prefix = "";
//                    var lastDot = element.name.lastIndexOf('.');
//                    if (lastDot != -1) {
//                        prefix = element.name.substring(0, lastDot + 1).replace('.', '_');
//                    }
//                    var id = '#' + prefix + parameters['dependentproperty'];
//                    // get the target value
//                    var targetvalue = parameters['targetvalue'];
//                    targetvalue = (targetvalue == null ? '' : targetvalue).toString();
//                    // get the actual value of the target control
//                    var control = $(id);
//                    if (control.length == 0 && prefix.length > 0) {
//                        // Target control not found, try without the prefix
//                        control = $('#' + parameters['dependentproperty']);
//                    }

//                    if (control.length > 0) {
//                        var controltype = control.attr('type');
//                        var actualvalue = "";
//                        switch (controltype) {
//                            case 'checkbox':
//                                actualvalue = control.attr('checked').toString(); break;
//                            case 'select':
//                                actualvalue = $('option:selected', control).text(); break;
//                            case 'radio':
//                                //console.log(control.filter(":checked").val());
//                                //alert(control.filter(":checked").val());
//                                var temp = control.filter("input:checked").val();
//                                actualvalue = temp;
//                                alert(actualvalue);
//                                break;
//                                //alert($(id + ":checked").val());
//                                //actualvalue = $("input:checked").val(); break;
//                            default:
//                                actualvalue = control.val(); break;
//                        }
//                        // if the condition is true, reuse the existing validator functionality
//                        if (targetvalue.toLowerCase() === actualvalue.toLowerCase()) {
//                            var rule = parameters['rule'];
//                            var ruleparam = parameters['ruleparam'];
//                            return $.validator.methods[rule].call(this, value, element, ruleparam);
//                        }
//                    }
//                    return true;
//                }
//            );

//        $.validator.unobtrusive.adapters.add(validationName, ['dependentproperty', 'targetvalue', 'rule', 'ruleparam'], function (options) {
//            alert("unobtrusive");
//            alert(options.params['rule']);
//            alert("END");
//            var rp = options.params['ruleparam'];
//            options.rules[validationName] = {
//                dependentproperty: options.params['dependentproperty'],
//                targetvalue: options.params['targetvalue'],
//                rule: options.params['rule']
//            };
//            if (rp) {
//                options.rules[validationName].ruleparam = rp.charAt(0) == '[' ? eval(rp) : rp;
//            }
//            options.messages[validationName] = options.message;
//        });
//    });
//}


