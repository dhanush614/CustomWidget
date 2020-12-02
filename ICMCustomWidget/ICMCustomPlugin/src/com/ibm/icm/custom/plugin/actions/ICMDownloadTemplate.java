package com.ibm.icm.custom.plugin.actions;

import java.io.IOException;
import java.util.Locale;

import com.ibm.ecm.extension.PluginAction;
import com.ibm.json.java.JSONObject;

public class ICMDownloadTemplate extends PluginAction {

	@Override
	public String getId() {
		return "custom.ICMDownloadTemplate";
	}

	@Override
	public String getName(Locale locale) {
		return "ICM Download Template";
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
		return "icmcustom.action.ICMDownloadTemplate";
	}

	@Override
	public JSONObject getAdditionalConfiguration(Locale locale) {
		String jsonString = 
			"{" +
			"\"ICM_ACTION_COMPATIBLE\": true," +
			"\"context\": null," +
			"\"name\": \"ICM Download Template\"," +
			"\"description\": \"An action to download documents\"," +
			"\"properties\": [" +
				"{" +
					"\"id\": \"label\"," +
					"\"title\": \"label\"," +
					"\"defaultValue\": \"Download Template\"," +
					"\"type\": \"string\"," +
					"\"isLocalized\": false" +
				"}," +				
			"]}";
		try {
			return JSONObject.parse(jsonString);
		} catch (IOException e) {
			e.printStackTrace();
		}
		return null;
	}
}
