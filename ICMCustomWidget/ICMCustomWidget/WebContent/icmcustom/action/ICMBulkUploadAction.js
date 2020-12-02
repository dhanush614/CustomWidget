define([
    "dojo/_base/declare",
    "icm/action/Action",
    "dojo/dom-style",
    "dijit/form/Button",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "icm/util/Coordination",
    "ecm/widget/dialog/BaseDialog",
    "ecm/widget/FilteringSelect",
    "dojo/data/ItemFileWriteStore",
    "dojox/form/Uploader",
    "dojox/form/uploader/FileList",
    "dojo/aspect",
    'dijit/registry',
    "icmcustom/js/xlsx",
    "icmcustom/js/jszip",
    "dojo/dom-attr",
    "dojo/request/xhr",
    "dojo/domReady!"
], function(declare, Action, domStyle, Button, declare, lang, Coordination, BaseDialog, FilteringSelect, ItemFileWriteStore, Uploader, FileList, aspect, registry, xlsx, jszip, domAttr, xhr) {

    return declare("icmcustom.action.ICMBulkUploadAction", [Action], {
        solution: null,

        isEnabled: function() {

            var Solution = this.getActionContext("Solution");
            if (Solution === null || Solution.length == 0) {
                return false;
            } else {
                this.solution = Solution[0];
                return true;
            }
        },
        execute: function() {
            this.caseType = this.propertiesValue.caseType;
            this.caseProperties = this.propertiesValue.caseProperties;
            console.log(this.caseType + " " + this.caseProperties);
            const xlsx = require('xlsx');
            this.htmlTemplate = this.buildHtmlTemplate();
            var workbook = xlsx.XLSX;
            var content = "";
            var createdCaseCount = 0;
            var totalRowsLength = 0;
            var caseTypeDropDown1;
            this.initiateTaskDialog = new BaseDialog({
                cancelButtonLabel: "Cancel",
                contentString: this.htmlTemplate,
                onCancel: function() {
                    console.log("inside Cancel");
                    var uploadButtonId = dijit.byId("fileUpload");
                    uploadButtonId.destroy();
                },

                GetTableFromExcel: function(data) {
                    var workbook = xlsx.read(data, {
                        type: 'binary'
                    });
                    var Sheet = workbook.SheetNames[0];
                    var excelRows = xlsx.utils.sheet_to_row_object_array(workbook.Sheets[Sheet]);
                    this.createCaseMethod(excelRows);

                },
                createCaseMethod: function(excelRows) {

                    var solutionObj = ecm.model.desktop.currentSolution;
                    var excelKeyObj = [];
                    var excelValObj = [];
                    totalRowsLength = excelRows.length;
                    if (totalRowsLength > 0) {
                        for (var er = 0; er < excelRows.length; er++) {
                            excelKeyObj = Object.keys(excelRows[er]);
                            excelValObj = Object.values(excelRows[er]);
                            var caseTypeValue = this.caseTypeDropDown.value;
                            if (caseTypeValue != null && caseTypeValue != "") {

                                this.assignMetadataForCaseCreation(solutionObj, caseTypeValue, excelKeyObj, excelValObj);

                            } else {
                                var messageDialog = new ecm.widget.dialog.MessageDialog({
                                    text: "Case Type is Empty"
                                });
                                messageDialog.show();
                                var uploadButtonId = dijit.byId("fileUpload");
                                uploadButtonId.destroy();
                            }
                        }
                    } else {
                        var messageDialog = new ecm.widget.dialog.MessageDialog({
                            text: "Please upload the filled case creation template"
                        });
                        messageDialog.show();
                        var uploadButtonId = dijit.byId("fileUpload");
                        uploadButtonId.destroy();
                    }

                },
                assignMetadataForCaseCreation: function(solutionObj, caseTypeVal, excelKeyObj, excelValObj) {
                    solutionObj.createNewCaseEditable(caseTypeVal, function(newCaseEditable) {

                        for (var k = 0; k < excelKeyObj.length; k++) {
                            var d = excelKeyObj[k];
                            var symbolicName = excelKeyObj[k];
                            if (symbolicName.includes('*')) {
                                symbolicName = symbolicName.replace(/\* *\([^)]*\) */g, "").trim();
                            } else {
                                symbolicName = symbolicName.replace(/ *\([^)]*\) */g, "").trim();
                            }
                            var propVal = excelValObj[k];
                            if (d.includes('datetime')) {
                                propVal = new Date(propVal);
                            }
                            var casePropsHandler = newCaseEditable.propertiesCollection[symbolicName];
                            if (casePropsHandler != undefined) {
                                casePropsHandler.setValue(propVal);
                            }
                        }

                        newCaseEditable.save(lang.hitch(this, function(savedCaseEditable) {
                            ++createdCaseCount;
                            if (createdCaseCount == totalRowsLength) {
                                var messageDialog = new ecm.widget.dialog.MessageDialog({
                                    text: "Bulk Case Creation has been completed successfully"
                                });
                                messageDialog.show();
                                var uploadButtonId = dijit.byId("fileUpload");
                                uploadButtonId.destroy();
                            }
                        }));
                    });
                },
                createGrid: function() {

                    var solution = ecm.model.desktop.currentSolution;
                    var caseType = solution.getCaseTypes();
                    var caseTyepList = [];
                    var data = {
                        items: []
                    };

                    for (var i = 0; i < caseType.length; i++) {
                        caseTyepList.push({
                            id: caseType[i].id,
                            value: caseType[i].id
                        });
                    }

                    for (var l = 0; l < caseTyepList.length; l++) {
                        data.items.push(caseTyepList[l]);
                    }
                    var typeStore = new dojo.data.ItemFileWriteStore({
                        data: data
                    })
                    var displayName = (new Date()).getTime() + "primaryInputField";
                    this.caseTypeDropDown = new FilteringSelect({
                        displayName: displayName,
                        name: "primaryInputField",
                        store: typeStore,
                        autoComplete: true,
                        style: {
                            width: "200px"
                        },                        
                        placeHolder: 'Select Case Type',
                        onChange: function(value){
                        	if(value){
                        		caseTypeDropDown1.set('disabled',false);                        		
                        	}
                        	else{                        		
                        		caseTypeDropDown1.reset();
                        		caseTypeDropDown1.set('disabled',true);
                        	}
                        },
                        required: true,
                        searchAttr: "value"
                    });
                    caseTypeDropDown1 = new Uploader({
                        label: "Browse files",
                        id: "fileUpload",
                        multiple: false,
                        uploadOnSelect: false,
                    });
                    
                    this.fileList = new dojox.form.uploader.FileList({
                        uploader: caseTypeDropDown1
                    });
                    this.caseTypeDropDown.placeAt(this.primaryInputField);
                    this.caseTypeDropDown.startup();
                    caseTypeDropDown1.placeAt(this.primaryInputField1);
                    caseTypeDropDown1.startup();
                    caseTypeDropDown1.set('disabled',true);
                    this.fileList.placeAt(this.primaryInputField2);
                    this.fileList.startup();
                },

                onExecute: function() {
                    var fileUpload = dijit.byId("fileUpload");
                    if (fileUpload.getValue().length != 0) {
                        var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;
                        if (regex.test(fileUpload.getValue()[0].name.toLowerCase())) {
                            if (typeof(FileReader) != "undefined") {
                                var reader = new FileReader();

                                if (reader.readAsBinaryString) {
                                    reader.onload = lang.hitch(this, function(e) {
                                        this.GetTableFromExcel(e.target.result);
                                    });
                                    reader.readAsBinaryString(fileUpload._files[0]);
                                } else {
                                    reader.onload = lang.hitch(this, function(e) {
                                        var data = "";
                                        var bytes = new Uint8Array(e.target.result);
                                        for (var i = 0; i < bytes.byteLength; i++) {
                                            data += String.fromCharCode(bytes[i]);
                                        }
                                        this.GetTableFromExcel(data);
                                    });
                                    reader.readAsArrayBuffer(fileUpload._files[0]);
                                }
                            } else {
                                alert("This browser does not support HTML5.");
                                var uploadButtonId = dijit.byId("fileUpload");
                                uploadButtonId.destroy();
                            }
                        } else {
                            alert("Please upload a valid Excel file.");
                            var uploadButtonId = dijit.byId("fileUpload");
                            uploadButtonId.destroy();

                        }
                    } else {
                        alert("Please chose an Excel file.");
                        var uploadButtonId = dijit.byId("fileUpload");
                        uploadButtonId.destroy();

                    }

                }

            });
            this.initiateTaskDialog.setTitle("Bulk Upload");
            this.initiateTaskDialog.createGrid();
            this.initiateTaskDialog.setSize(450, 400);
            this.initiateTaskDialog.addButton("Create Bulk Case", this.initiateTaskDialog.onExecute, false, false);
            this.initiateTaskDialog.setResizable(true);
            this.initiateTaskDialog.show();

        },
        buildHtmlTemplate: function() {
            var dialogueBoxName = "Choose Case Type";
            var htmlstring = '<div class="fieldsSection"><div class="fieldLabel" id="mainDiv"><span style="color:red" class="mandatory">**</span><label for="primaryInputFieldLabel">' + dialogueBoxName + ':</label><div data-dojo-attach-point="primaryInputField"/></div><br><div data-dojo-attach-point="primaryInputField1"/></div><br><div data-dojo-attach-point="primaryInputField2"></div></div>';
            return htmlstring;
        },

    });
});