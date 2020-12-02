package com.ibm.icm.custom.plugin.actions;

import java.io.IOException;
import java.util.Locale;

import com.ibm.ecm.extension.PluginAction;
import com.ibm.json.java.JSONObject;

public class ICMBulkUploadAction extends PluginAction {

	@Override
	public String getId() {
		return "custom.ICMBulkUploadAction";
	}

	@Override
	public String getName(Locale locale) {
		return "ICM Bulk Upload Action";
	}

	@Override
	public String getIcon() {
		return "";
	}

	@Override
	public String getPrivilege() {
		return "";
	}

	@Override
	public String getServerTypes() {
		return "p8,cm";
	}

	@Override
	public String getActionFunction() {
		return "";
	}

	@Override
	public boolean isMultiDoc() {
		return false;
	}

	@Override
	public boolean isGlobal() {
		return true;
	}

	@Override
	public String getActionModelClass() {
		return "icmcustom.action.ICMBulkUploadAction";
	}

	@Override
	public JSONObject getAdditionalConfiguration(Locale locale) {
		String jsonString = 
			"{" +
			"\"ICM_ACTION_COMPATIBLE\": true," +
			"\"context\": null," +
			"\"name\": \"ICM Bulk Upload Action\"," +
			"\"description\": \"An action to do bulk upload documents\"," +
			"\"properties\": [" +
				"{" +
					"\"id\": \"label\"," +
					"\"title\": \"label\"," +
					"\"defaultValue\": \"Bulk Upload Action\"," +
					"\"type\": \"string\"," +
					"\"isLocalized\": false" +
				"}," +
				"{" +
				"\"id\": \"caseType\"," +
				"\"title\": \"Provide CaseType to create Case \"," +
				"\"defaultValue\": \"\"," +
				"\"type\": \"caseType\"," +
				"\"isLocalized\": false" +
			"}," +					
				"{" +
					"\"id\": \"caseProperties\"," +
					"\"title\": \"Provide Case Properties for Case Creation \"," +
					"\"defaultValue\": \"\"," +
					"\"type\": \"string\"," +
					"\"isLocalized\": false" +
				"}," +
				"{" +
				"\"id\": \"message\"," +
				"\"title\": \"message\"," +
				"\"defaultValue\": \"\"," +
				"\"type\": \"string\"," +
				"\"isLocalized\": false" +
			"}" +					
			"]}";
		try {
			return JSONObject.parse(jsonString);
		} catch (IOException e) {
			e.printStackTrace();
		}
		return null;
	}
}
