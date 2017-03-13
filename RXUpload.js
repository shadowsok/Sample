var $form;
var fileList = [];
var paramNames = [];
var uploadSuccessful;
var isMobile = false; //initiate as false

$(document).ready(function () {
    'use strict';

    // mobile device detection
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
        || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) isMobile = true;

    $('button[type="submit"]').prop("disabled", false)

    LoadRules();
    InitControlEvents();
    InitSubmitEvent();

    FormatForMobile();

    //if (isMobile)
    //{
    // Only use input mask on desktop version
    //$("#DateOfBirth").unmask("M9/D9/Y999", { placeholder: " " });
    //$("#CollectionDate").unmask("M9/D9/Y999", { placeholder: " " });
    //$("#CellPhone").unmask("(999) 999-9999", { placeholder: " " });
    //$("#HomePhone").unmask("(999) 999-9999", { placeholder: " " });
    //}

});

function FormatForMobile() {
    if (isMobile) {
        // Hide Desktop version of field. Show mobile version of field
        $("#CollectionDate").hide();
        $("#CollectionDate_m").show();
        $("#DateOfBirth").hide();
        $("#DateOfBirth_m").show();
        $("#CellPhone").hide();
        $("#CellPhone_m").show();
        $("#HomePhone").hide();
        $("#HomePhone_m").show();

        // Copy value from mobile field into desktop field for validation. Also this allows server side data binding to use same field regardless of mobile or desktop
        $('#CollectionDate_m').change(function () {
            $('#CollectionDate').val(moment($(this).val()).format('MM/DD/YYYY'));
            //alert(moment($(this).val()).format('MM/DD/YYYY'));
        });

        // Copy value from mobile field into desktop field for validation. Also this allows server side data binding to use same field regardless of mobile or desktop
        $('#DateOfBirth_m').change(function () {
            $('#DateOfBirth').val(moment($(this).val()).format('MM/DD/YYYY'));
            //alert(moment($(this).val()).format('MM/DD/YYYY'));
        });

        // Copy value from mobile field into desktop field for validation. Also this allows server side data binding to use same field regardless of mobile or desktop
        $('#CellPhone_m').change(function () {
            $('#CellPhone').val(FormatPhone($(this).val()));
            //alert(moment($(this).val()).format('MM/DD/YYYY'));
        });

        // Copy value from mobile field into desktop field for validation. Also this allows server side data binding to use same field regardless of mobile or desktop
        $('#HomePhone_m').change(function () {
            $('#HomePhone').val(FormatPhone($(this).val()));
            //alert(moment($(this).val()).format('MM/DD/YYYY'));
        });
    }
}

// Copy data from desktop fields in to mobile fieslds
function PopulateMobileFields() {
    if (isMobile) {
        $('#CollectionDate_m').val(moment($('#CollectionDate').val()).format('YYYY-MM-DD'));
        $('#DateOfBirth_m').val(moment($('#DateOfBirth').val()).format('YYYY-MM-DD'));
        $('#CellPhone_m').val(StripNonNumeric($('#CellPhone').val()));
        $('#HomePhone_m').val(StripNonNumeric($('#HomePhone').val()));
    }
}

function StripNonNumeric(value) {
    return value.replace(/\D/g, "");
}


// Load All Custom JQuery Validation rules
function LoadRules() {
    $("#CollectionDate").rules('remove');
    LoadDonorRules();
}
 
// Load All JQuery Validation Rules Related To The Rx Donor Form
function LoadDonorRules() {
    
    $.validator.addMethod('RXIdentifier', function (value, element) {
        if ($("input:checked").val() == 'Specimen ID Number' && value == "" && element.name == "SpecimenId") {
            return false;
        }
        if ($("input:checked").val() == 'Authorization Form Number' && value == "" && element.name == "AuthorizationNumber") {
            return false;
        }
        if ($("input:checked").val() == 'Donor Name' && value == "" && (element.name == "DonorFirstName" || element.name == "DonorLastName")) {
            return false;
        }
        return true;
    });


    $("#SpecimenId").rules("add", {
        RXIdentifier: ""
        , messages: {
            RXIdentifier: "Specimen ID is required. Please enter to continue"
        }
    });
    $("#AuthorizationNumber").rules("add", {
        RXIdentifier: ""
        , messages: {
            RXIdentifier: "Authorization Number is required. Please enter to continue"
        }
    });
    $("#DonorFirstName").rules("add", {
        RXIdentifier: ""
        , messages: {
            RXIdentifier: "First Name is required. Please enter to continue"
        }
    });
    $("#DonorLastName").rules("add", {
        RXIdentifier: ""
        , messages: {
            RXIdentifier: "Last Name is required. Please enter to continue"
        }
    });

    $.validator.unobtrusive.parse();
}

// Load All JQuery Validation Rules Related To the RX Upload Form
function LoadRXRules() {
    $.validator.addMethod('clientprescriptionerrors', function (value, element) {
        if ($("#RxFilePath").val() == '' && $("#RxFilePath2").val() == '' && $("#RxFilePath3").val() == '') {
            return false;
        }
        return true;
    }, "Need At Least One Prescription Image");


    $("#RxErrors").rules("add", {
        clientprescriptionerrors: ""
       , messages: {
           ClientPrescriptionErrors: "Need At Least One Prescription Image"
       }
    });

    $.validator.addMethod('agreementerror', function (value, element) {
        if ($("#AgreesWithTermsAndConditions").is(":checked")  != true) {
            return false;
        }
        return true;
    }, "You must agree to Terms & Conditions in order to upload your prescription images.");


    $("#AgreesWithTermsAndConditions").rules("add", {
        agreementerror: ""
       , messages: {
           AgreementError: "You must agree to Terms & Conditions in order to upload your prescription images."
       }
    });

    $.validator.unobtrusive.parse();
}

// Initialize All Control Events
function InitControlEvents() {
    LoadProperIdentifierEvent();
}


// Initialize Submit Event For Form Submit Button (Note: Works for Donor Form)
function InitSubmitEvent() {
    $('button[type="submit"]').button('reset');

    // Submit button is type submit for donor info form (NOTE: It is changed to type button when rx upload form is written to the page)
    $('#rx-upload-body').on("submit", '#formgrid', function (event) {
        event.preventDefault();

        $("#rxmessage").remove();

        if ($('.rx-form').valid()) {
            $('button[type="submit"]').button('loading');
            // Serialize and send format data
            $.ajax({
                type: "POST",
                url: $('.rx-form').attr('data-tt-target'),
                data: $('.rx-form').serialize(),
                dataType: 'json',
                async: true,
                error: function (jqXHR, textStatus, errorThrown) {
                    ttGrowl('An Error Has Occurred', 'Error processing your request. Please try again later', 'error');
                    $('button[type="submit"]').button('reset');
                },
                success: function (data) {
                    $('#rx-upload-body').empty();
                    $('#rx-upload-body').append(data.html);
                    InitControlEvents();
                    setInputMasks();
                    if (data.rxMessage.showUpload == true) {
                        $(document).scrollTop(0);
                        if (data.isValid == true) {
                            $("#alert-top").append('<div id="rxmessage" class="alert ' + data.rxMessage.mlevel + '"><strong><i class="fa fa-check">&nbsp;</i>' + data.rxMessage.title + '</strong>&nbsp;' + data.rxMessage.message + '</div>');
                            $("#alert-top").show();
                        }
                        $("#formgrid").fadeIn(300);
                        reinitializeJQOValidation();
                        LoadRXRules();
                        InitFileUpload();
                    }
                    else {
                        reinitializeJQOValidation();
                        LoadRules();
                        PopulateMobileFields();
                        FormatForMobile();
                        if (data.isValid == true) {
                            $("#alert").append('<div id="rxmessage" class="alert ' + data.rxMessage.mlevel + '"><strong>' + data.rxMessage.title + '</strong>&nbsp;' + data.rxMessage.message + '</div>');
                        }
                    }
                }
            });

        }
    });
}

// Initialize File Upload Controls and Events (Note: Works for File Upload Form)
function InitFileUpload() {

    // Init slim scroll
    $('#agreement').slimScroll({ height: 100, alwaysVisible: true, color: '#888', allowPageScroll: true });

    // Init click event for remove button
    $("#RxRemove").on("click", function () {
        $("#RxFilePath").replaceWith($('#RxFilePath').val('').clone(true));// clear path
        //$("#RxFileData").replaceWith($('#RxFileData').val('').clone(true));
        updateFileSize($('#rx1size'), 0);
    });
    $("#RxRemove2").on("click", function () {
        $("#RxFilePath2").replaceWith($('#RxFilePath2').val('').clone(true)); // clear path
        updateFileSize($('#rx2size'), 0);
    });
    $("#RxRemove3").on("click", function () {
        $("#RxFilePath3").replaceWith($('#RxFilePath3').val('').clone(true)); // clear path
        updateFileSize($('#rx3size'), 0);
    });

    // Init file input control change events
    $("#RxFileData").on('change', function () {
        // Copy filename to file path text box. Also make extenstion lower case for regular expression
        $("#RxFilePath").val(this.files[0].name.replace(this.files[0].name.substr(this.files[0].name.lastIndexOf('.') + 1), this.files[0].name.substr(this.files[0].name.lastIndexOf('.') + 1).toLowerCase())); // file name
        updateFileSize($('#rx1size'), this.files[0].size);
        $("#RxFileData").data('file', this.files[0])
        $("#RxFileData").data('paramName', "RxFileData")
    });
    $("#RxFileData2").on('change', function () {
        // Copy filename to file path text box. Also make extenstion lower case for regular expression
        $("#RxFilePath2").val(this.files[0].name.replace(this.files[0].name.substr(this.files[0].name.lastIndexOf('.') + 1), this.files[0].name.substr(this.files[0].name.lastIndexOf('.') + 1).toLowerCase()));
        updateFileSize($('#rx2size'), this.files[0].size);
        $("#RxFileData2").data('file', this.files[0])
        $("#RxFileData2").data('paramName', "RxFileData2")
    });
    $("#RxFileData3").on('change', function () {
        // Copy filename to file path text box. Also make extenstion lower case for regular expression
        $("#RxFilePath3").val(this.files[0].name.replace(this.files[0].name.substr(this.files[0].name.lastIndexOf('.') + 1), this.files[0].name.substr(this.files[0].name.lastIndexOf('.') + 1).toLowerCase()));
        updateFileSize($('#rx3size'), this.files[0].size);
        $("#RxFileData3").data('file', this.files[0])
        $("#RxFileData3").data('paramName', "RxFileData3")
    });

    // Init JQuery Fileupload Plugin on form element
    var elem = $(".rx-form")
    file_upload = elem.fileupload({
        autoUpload: false,
        fileInput: $("input:file"),
        progressall: function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            console.log(progress + '%')
            ToggleProgressBarError(false);
            $('#uploadProgress').width(progress + '%');
        },
    })

    $('.rx-form').bind('fileuploadprogress', function (e, data) {
        // Log the current bitrate for this upload:
        console.log(data.bitrate);
    });

    // Submit button changed to type 'button' from type 'submit' for rx upload form
    $('#rx-upload-body').on("click", '#rx-upload-btn', function (event) {
        //$("rx-upload-btn").click(function () {

        // Do not proceed with upload if validation errors on page
        if ($('.rx-form').valid() != true) {
            addValidationClasses(true);
            return;
        }
        // ReInit Successful Flag
        uploadSuccessful = false;
        $('#rx-upload-btn').button('loading');
        //ReInit Arrays
        fileList = [];
        paramNames = [];

        // Push File Data (NOTE: make sure data is not 'undefined' before pushing to array. Also make sure there is a valid path)
        if ($("#RxFileData").data('file') && $("#RxFilePath").val() != "") fileList.push($("#RxFileData").data('file'));
        if ($("#RxFileData2").data('file') && $("#RxFilePath2").val() != "") fileList.push($("#RxFileData2").data('file'));
        if ($("#RxFileData3").data('file') && $("#RxFilePath3").val() != "") fileList.push($("#RxFileData3").data('file'));

        // Push Parameter Name/element name (NOTE: make sure data is not 'undefined' before pushing to array)
        if ($("#RxFileData").data('paramName') && $("#RxFilePath").val() != "") paramNames.push($("#RxFileData").data('paramName'))
        if ($("#RxFileData2").data('paramName') && $("#RxFilePath2").val() != "") paramNames.push($("#RxFileData2").data('paramName'))
        if ($("#RxFileData3").data('paramName') && $("#RxFilePath3").val() != "") paramNames.push($("#RxFileData3").data('paramName'))

        // Show upload progress bar
        ShowProgressBar(true);

        // Ajax post form data and file data
        $('.rx-form').fileupload('send', {
            singleFileUploads: false, // enables multiple file upload in same request
            url: $('.rx-form').attr('data-tt-target'),
            files: fileList, // file array list
            paramName: paramNames // parameter name array list
        })
        .success(function (data, textStatus, jqXHR) {
            $("#alert").empty();
            ToggleProgressBarError(false);
            if (data.rxMessage.showUploadSuccess == true) {
                if (data.isValid == true) {
                    uploadSuccessful = true
                }
            }
            else {
                $("#alert-top").empty();
                ToggleProgressBarError(true);
                $('#uploadProgress').css('width', 0);
                reinitializeJQOValidation();
                LoadRXRules();
                $('#rx-upload-btn').button('reset');
                if (data.isValid == true) {
                    $("#alert").html('<div id="rxmessage" class="alert ' + data.rxMessage.mlevel + '"><strong>' + data.rxMessage.title + '</strong>&nbsp;' + data.rxMessage.message + '</div>');
                }
                else if (data.isValid == false) {
                    DisplayUploadErrors(data.rxErrorList);
                }
            }
            console.log("success");
        })
        .error(function (data, textStatus, jqXHR) {
            ToggleProgressBarError(true);
            if (jqXHR == "Upload Size Exceeded") {
                ttGrowl('Upload Size Exceeded', 'Error uploading image(s). Please reduce the size and try again.', 'error')
            }
            else {
                ttGrowl('An Error Has Occurred', 'Error uploading image(s). Please try again later.', 'error');
            }
            $('#rx-upload-btn').button('reset');
        })
        .complete(function (data, textStatus, jqXHR) {
            if (uploadSuccessful == true) {
                $(document).scrollTop(0);
                $("#alert-top").html('<div id="rxmessage" class="alert alert-info"><strong><i class="fa fa-check">&nbsp;</i>We Have Received Your Prescription(s):</strong>&nbsp;We will be in contact with your employer. <i>(Completion time may vary based on our ability to reach your employer.)</i></div>');
                $("#alert-top").fadeIn(500);
                $("#uploadsuccess").fadeIn(500);
                $(".panel-heading").hide();
                $(".panel-body").hide();
                $("#progressContainer").fadeOut(500);
            }
        });
    })
}

// Initialize Event For Idenifier On Donor Form
function LoadProperIdentifierEvent() {

    if ($("input:checked").val() == 'Specimen ID Number') {
        $("#specgrp").fadeIn(0);
        $("#authgrp").fadeOut(0);
        $("#dfngrp").fadeOut(0);
        $("#dlngrp").fadeOut(0);
        if (!isMobile) {
            $("#SpecimenId").focus();
        }
    }
    else if ($("input:checked").val() == 'Authorization Form Number') {
        $("#specgrp").fadeOut(0);
        $("#authgrp").fadeIn(0);
        $("#dfngrp").fadeOut(0);
        $("#dlngrp").fadeOut(0);
        if (!isMobile) {
            $("#AuthorizationNumber").focus();
        }
    }
    else if ($("input:checked").val() == 'Donor Name') {
        $("#specgrp").fadeOut(0);
        $("#authgrp").fadeOut(0);
        $("#dfngrp").fadeIn(0);
        $("#dlngrp").fadeIn(0);
        if (!isMobile) {
            $("#DonorFirstName").focus();
        }
    }

    $('input[type=radio][name=Identifier]').change(function () {
        if (this.value == 'Specimen ID Number') {
            $("#specgrp").fadeIn(200);
            $("#authgrp").fadeOut(0);
            $("#dfngrp").fadeOut(0);
            $("#dlngrp").fadeOut(0);
            if (!isMobile) {
                $("#SpecimenId").focus();
            }
        }
        else if (this.value == 'Authorization Form Number') {
            $("#specgrp").fadeOut(0);
            $("#authgrp").fadeIn(200);
            $("#dfngrp").fadeOut(0);
            $("#dlngrp").fadeOut(0);
            if (!isMobile) {
                $("#AuthorizationNumber").focus();
            }
        }
        else if (this.value == 'Donor Name') {
            $("#specgrp").fadeOut(0);
            $("#authgrp").fadeOut(0);
            $("#dfngrp").fadeIn(200);
            $("#dlngrp").fadeIn(200);
            if (!isMobile) {
                $("#DonorFirstName").focus();
            }
        }
    });
}

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Bytes';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

function formatBytes(bytes, decimals) {
    if (bytes == 0) return '0 Bytes';
    var k = 1000;
    var dm = decimals + 1 || 3;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
}

function updateFileSize(control, bytes) {
    control.data('bytes', bytes)
    control.text(formatBytes(bytes));
    updateTotalFileSize();
}

function updateTotalFileSize() {
    var total = 0;

    if ($('#rx1size').data('bytes')) total += $('#rx1size').data('bytes');
    if ($('#rx2size').data('bytes')) total += $('#rx2size').data('bytes');
    if ($('#rx3size').data('bytes')) total += $('#rx3size').data('bytes');

    $('#rxtotalsize').text(formatBytes(total));

    if ($('#rxtotalsize').text().replace(" MB", "") > 10) {
        $("#rxtotalsize").removeClass("green").addClass("red");
    }
    else {
        $("#rxtotalsize").removeClass("red").addClass("green")
    }
}

function DisplayUploadErrors(errors) {
    $("#alert").append('<div class="alert alert-danger" id="errList"><strong>Could not upload prescription(s):</strong></div>');
    for (var i = 0; i < errors.length; i++) {
        $("#errList").append('<div>' + errors[i] + '</div>');
    }
}

function ToggleProgressBarError(hasError) {
    if (hasError) {
        $('#uploadProgress').removeClass("progress-bar-success").addClass("progress-bar-danger");
    }
    else {
        $('#uploadProgress').removeClass("progress-bar-danger").addClass("progress-bar-success");
    }
}

function ShowProgressBar(show) {
    if (show) {
        $("#progressContainer").show();
    }
    else {
        $("#progressContainer").hide();
    }
}

function FormatPhone(phonenum) {
    var regexObj = /^(?:\+?1[-. ]?)?(?:\(?([0-9]{3})\)?[-. ]?)?([0-9]{3})[-. ]?([0-9]{4})$/;
    if (regexObj.test(phonenum)) {
        var parts = phonenum.match(regexObj);
        var phone = "";
        if (parts[1]) { phone += "(" + parts[1] + ") "; }
        phone += parts[2] + "-" + parts[3];
        return phone;
    }
    else {
        //invalid phone number
        return phonenum;
    }
}