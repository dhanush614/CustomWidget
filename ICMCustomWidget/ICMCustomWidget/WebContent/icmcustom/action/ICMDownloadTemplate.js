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
    "icmcustom/js/xlsx",
    "icmcustom/js/jszip",
    "dojo/dom-attr",
    "dojo/request/xhr",
    "dojo/domReady!"
], function(declare, Action, domStyle, Button, declare, lang, Coordination, BaseDialog, FilteringSelect, ItemFileWriteStore, Uploader, FileList, aspect, xlsx, jszip, domAttr, xhr) {

    return declare("icmcustom.action.ICMDownloadTemplate", [Action], {
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
           
            this.htmlTemplate = this.buildHtmlTemplate();
            var initiateTaskDialog;
            var caseTypeVal;
            initiateTaskDialog = new BaseDialog({
                cancelButtonLabel: "Cancel",
                contentString: this.htmlTemplate,
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
                       onChange: lang.hitch(this, function(value) {
                    	   caseTypeVal=value;
                        }),
                        placeHolder: 'Select the required Case Type',
                        required: true,
                        searchAttr: "value"
                    });
                    
                    this.caseTypeDropDown.placeAt(this.primaryInputField);
                    this.caseTypeDropDown.startup();
                    
                },
                
                

                executeCESearch: function(repositoryId, ceQuery, execute, fileNameValue) {

                    this._repositoryId = repositoryId;
                    var repository = ecm.model.desktop.getRepositoryByName(repositoryId);
                    this._ceQuery = ceQuery;
                    var resultsDisplay = ecm.model.SearchTemplate.superclass.resultsDisplay;
                    resultsDisplay = [];
                    var sortBy = "";
                    var sortAsc = true;
                    var json = '{' + resultsDisplay + '}';
                    this._searchQuery = new ecm.model.SearchQuery();
                    var json = JSON.parse(json);
                    this._searchQuery.repository = repository;
                    this._searchQuery.resultsDisplay = json;
                    this._searchQuery.pageSize = 0;
                    this._searchQuery.query = ceQuery;
                    this._searchQuery.search(lang.hitch(this, function(results) {

                        var item = results.items[0];
                        var itemUrl = item.getContentUrl();

                        xhrArgs = {
                            url: itemUrl,
                            handleAs: "text",
                            sync: true,
                            headers: {
                                "Content-Type": "application/json"
                            },
                            error: function(error) {

                                alert("Error occured during getting users from role. Please contact administrator");
                                console.log("Error occured during getting users from role. Please contact administrator" + error);
                            }
                        };

                        var deferred = dojo.xhrGet(xhrArgs);
                        var content = deferred.results;
                        var htmlFileTemplate = content[0];
                        var D = document;
                        var a = D.createElement('a');
                        var rawFile;
                        var fileName = fileNameValue;
                        fileName = fileName + ".xlsx";
                        if (navigator.msSaveBlob) {
                            var template = htmlFileTemplate;
                            var blob = new Blob([template], {
                                type: 'application/vnd.ms-excel',
                                endings: 'native'
                            });
                            return navigator.msSaveBlob(blob, fileName);
                        }
                        if ('download' in a) {
                            var template = htmlFileTemplate;
                            var blob = new Blob([template], {
                                type: 'application/vnd.ms-excel',
                                endings: 'native'
                            });
                            rawFile = URL.createObjectURL(blob);
                            a.setAttribute('download', fileName);
                        } else {
                            var uri = 'data:application/vnd.ms-excel;base64,';
                            var base64 = function(s) {
                                return window.btoa(unescape(encodeURIComponent(s)))
                            };
                            window.location.href = uri + base64(template)
                            a.setAttribute('target', '_blank');
                            a.setAttribute('download', fileName);
                        }
                        a.href = rawFile;
                        a.setAttribute('style', 'display:none;');
                        D.body.appendChild(a);
                        initiateTaskDialog.destroy();
                        setTimeout(function() {
                            if (a.click) {
                                a.click();
                            } else if (document.createEvent) {
                                var eventObj = document.createEvent('MouseEvents');
                                eventObj.initEvent('click', true, true);
                                a.dispatchEvent(eventObj);
                            }
                            D.body.removeChild(a);
                        }, 100);

                    }), sortBy, sortAsc, null, function(error) {

                        console.log(error);
                    });
                    

                },
                createQuery: function() {

                	var ceQuery = "SELECT * FROM [Document] WHERE [DocumentTitle] =" + "'" + caseTypeVal + "'"+" and IsCurrentVersion=true";
                    this.executeCESearch("tos", ceQuery, false, caseTypeVal);

                },
               

            });
            initiateTaskDialog.setTitle("Download Template");
            initiateTaskDialog.createGrid();
            initiateTaskDialog.setSize(450, 350);
            initiateTaskDialog.addButton("Download",initiateTaskDialog.createQuery, false, false);
            initiateTaskDialog.setResizable(true);
            initiateTaskDialog.show();

        },
        buildHtmlTemplate: function() {
            var dialogueBoxName = "Choose Case Type";
            var htmlstring = '<div class="fieldsSection"><div class="fieldLabel" id="mainDiv"><span style="color:red" class="mandatory">**</span><label for="primaryInputFieldLabel">' + dialogueBoxName + ':</label><div data-dojo-attach-point="primaryInputField"/></div></div></div>';
            return htmlstring;
        },

    });
});