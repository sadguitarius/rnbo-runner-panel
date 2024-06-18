import Router from "next/router";
import { ActionBase, AppThunk } from "../lib/store";
import { OSCQueryRNBOInstance, OSCQueryRNBOInstancePresetEntries, OSCValue } from "../lib/types";
import { InstanceStateRecord } from "../models/instance";
import { getInstanceByIndex } from "../selectors/instances";
import { getAppSettingValue } from "../selectors/settings";
import { ParameterRecord } from "../models/parameter";
import { OSCArgument, writePacket } from "osc";
import { showNotification } from "./notifications";
import { NotificationLevel } from "../models/notification";
import { oscQueryBridge } from "../controller/oscqueryBridgeController";
import throttle from "lodash.throttle";
import { PresetRecord } from "../models/preset";
import { AppSetting } from "../models/settings";
import { DataRefRecord } from "../models/dataref";
import { DataFileRecord } from "../models/datafile";
import { ParameterSortAttr, SortOrder } from "../lib/constants";

export enum InstanceActionType {
	SET_INSTANCE = "SET_INSTANCE",
	SET_INSTANCES = "SET_INSTANCES",
	DELETE_INSTANCE = "DELETE_INSTANCE",
	DELETE_INSTANCES = "DELETE_INSTANCES",
	SET_INSTANCE_PARAMTER_SORT_ATTR = "SET_INSTANCE_PARAMTER_SORT_ATTR",
	SET_INSTANCE_PARAMTER_SORT_ORDER = "SET_INSTANCE_PARAMTER_SORT_ORDER"
}

export interface ISetInstance extends ActionBase {
	type: InstanceActionType.SET_INSTANCE;
	payload: {
		instance: InstanceStateRecord;
	};
}

export interface ISetInstances extends ActionBase {
	type: InstanceActionType.SET_INSTANCES;
	payload: {
		instances: InstanceStateRecord[];
	};
}

export interface IDeleteInstance extends ActionBase {
	type: InstanceActionType.DELETE_INSTANCE;
	payload: {
		instance: InstanceStateRecord;
	};
}

export interface IDeleteInstances extends ActionBase {
	type: InstanceActionType.DELETE_INSTANCES;
	payload: {
		instances: InstanceStateRecord[];
	};
}

export interface ISetInstanceParameterSortAttr extends ActionBase {
	type: InstanceActionType.SET_INSTANCE_PARAMTER_SORT_ATTR;
	payload: {
		attr: ParameterSortAttr;
	};
}

export interface ISetInstanceParameterSortOrder extends ActionBase {
	type: InstanceActionType.SET_INSTANCE_PARAMTER_SORT_ORDER;
	payload: {
		order: SortOrder;
	};
}

export type InstanceAction = ISetInstance | ISetInstances | IDeleteInstance | IDeleteInstances | ISetInstanceParameterSortAttr | ISetInstanceParameterSortOrder;

export const setInstance = (instance: InstanceStateRecord): ISetInstance => ({
	type: InstanceActionType.SET_INSTANCE,
	payload: {
		instance
	}
});

export const setInstances = (instances: InstanceStateRecord[]): ISetInstances => ({
	type: InstanceActionType.SET_INSTANCES,
	payload: {
		instances
	}
});

export const deleteInstance = (instance: InstanceStateRecord): IDeleteInstance => ({
	type: InstanceActionType.DELETE_INSTANCE,
	payload: {
		instance
	}
});

export const deleteInstances = (instances: InstanceStateRecord[]): IDeleteInstances => ({
	type: InstanceActionType.DELETE_INSTANCES,
	payload: {
		instances
	}
});

// Trigger Events on Remote OSCQuery Runner
export const loadPresetOnRemoteInstance = (instance: InstanceStateRecord, preset: PresetRecord): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: `${instance.path}/presets/load`,
				args: [
					{ type: "s", value: preset.name }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to load preset ${preset.name}`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const savePresetToRemoteInstance = (instance: InstanceStateRecord, name: string): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: `${instance.path}/presets/save`,
				args: [
					{ type: "s", value: name }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to save preset ${name}`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const destroyPresetOnRemoteInstance = (instance: InstanceStateRecord, preset: PresetRecord): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: `${instance.path}/presets/delete`,
				args: [
					{ type: "s", value: preset.name }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to delete preset ${preset.name}`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const renamePresetOnRemoteInstance = (instance: InstanceStateRecord, preset: PresetRecord, name: string): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: `${instance.path}/presets/rename`,
				args: [
					{ type: "s", value: preset.name },
					{ type: "s", value: name }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to rename preset ${preset.name} to ${name}`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const setInitialPresetOnRemoteInstance = (instance: InstanceStateRecord, preset: PresetRecord): AppThunk =>
	(dispatch) => {
		try {
			const message = {
				address: `${instance.path}/presets/initial`,
				args: [
					{ type: "s", value: preset.name }
				]
			};
			oscQueryBridge.sendPacket(writePacket(message));
		} catch (err) {
			dispatch(showNotification({
				level: NotificationLevel.error,
				title: `Error while trying to set initial preset to ${preset.name}`,
				message: "Please check the console for further details."
			}));
			console.log(err);
		}
	};

export const sendInstanceMessageToRemote = (instance: InstanceStateRecord, inportId: string, value: string): AppThunk =>
	(dispatch) => {
		const values = value.split(" ").reduce((values, v) => {
			const fv = parseFloat(v.replaceAll(",", ".").trim());
			if (!isNaN(fv)) values.push({ type: "f", value: fv });
			return values;
		}, [] as OSCArgument[]);

		if (!values.length) {
			dispatch(showNotification({
				title: "Invalid Message Input",
				level: NotificationLevel.warn,
				message: `Could not send message input "${value}" as it appears to contain non-valid number input. Please provide a single or multiple numbers separated by a space.`
			}));
			return;
		}


		const message = {
			address: `/rnbo/inst/${instance.index}/messages/in/${inportId}`,
			args: values
		};
		oscQueryBridge.sendPacket(writePacket(message));
	};

export const triggerInstanceMidiNoteOnEventOnRemote = (instance: InstanceStateRecord, note: number): AppThunk =>
	() => {

		const midiChannel = 0;
		const routeByte = 144 + midiChannel;
		const velocityByte = 100;

		const message = {
			address: `${instance.path}/midi/in`,
			args: [routeByte, note, velocityByte].map(byte => ({ type: "i", value: byte }))
		};

		oscQueryBridge.sendPacket(writePacket(message));
	};

export const triggerInstanceMidiNoteOffEventOnRemote = (instance: InstanceStateRecord, note: number): AppThunk =>
	() => {

		const midiChannel = 0;
		const routeByte = 128 + midiChannel;
		const velocityByte = 0;

		const message = {
			address: `${instance.path}/midi/in`,
			args: [routeByte, note, velocityByte].map(byte => ({ type: "i", value: byte }))
		};

		oscQueryBridge.sendPacket(writePacket(message));
	};

export const setInstanceParameterValueNormalizedOnRemote = throttle((instance: InstanceStateRecord, param: ParameterRecord, value: number): AppThunk =>
	(dispatch) => {

		const message = {
			address: `${param.path}/normalized`,
			args: [
				{ type: "f", value }
			]
		};

		oscQueryBridge.sendPacket(writePacket(message));

		// optimistic local state update
		dispatch(setInstance(instance.setParameterNormalizedValue(param.id, value)));
	}, 100);

export const setInstanceDataRefValueOnRemote = throttle((instance: InstanceStateRecord, dataref: DataRefRecord, file?: DataFileRecord): AppThunk =>
	() => {

		const message = {
			address: `${instance.path}/data_refs/${dataref.id}`,
			args: [
				{ type: "s", value: file?.fileName || "" } // no files unsets
			]
		};

		oscQueryBridge.sendPacket(writePacket(message));
	}, 100);


// Updates in response to remote OSCQuery Updates
export const updateInstancePresetEntries = (index: number, entries: OSCQueryRNBOInstancePresetEntries): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const instance = getInstanceByIndex(state, index);
			if (!instance) return;

			dispatch(setInstance(instance.updatePresets(entries)));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstancePresetLatest = (index: number, name: string): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const instance = getInstanceByIndex(state, index);
			if (!instance) return;

			dispatch(setInstance(instance.setPresetLatest(name)));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstancePresetInitial = (index: number, name: string): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const instance = getInstanceByIndex(state, index);
			if (!instance) return;

			dispatch(setInstance(instance.setPresetInitial(name)));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceMessages = (index: number, desc: OSCQueryRNBOInstance["CONTENTS"]["messages"]): AppThunk =>
	(dispatch, getState) => {
		try {
			if (!desc) return;

			const state = getState();
			const instance = getInstanceByIndex(state, index);
			if (instance) return;

			dispatch(setInstance(
				instance
					.set("messageInputs", InstanceStateRecord.messagesFromDescription(desc.CONTENTS?.in))
					.set("messageOutputs", InstanceStateRecord.messagesFromDescription(desc.CONTENTS?.out))
			));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceMessageOutputValue = (index: number, name: string, value: OSCValue | OSCValue[]): AppThunk =>
	(dispatch, getState) => {
		try {

			const state = getState();

			// Debug enabled?!
			const enabled = getAppSettingValue<boolean>(state, AppSetting.debugMessageOutput);
			if (!enabled) return;

			// Active Instance view?!
			if (Router.pathname !== "/instances/[index]" || Router.query.index !== `${index}`) return;

			const instance = getInstanceByIndex(state, index);
			if (!instance) return;

			dispatch(setInstance(
				instance.setMessageOutportValue(name, Array.isArray(value) ? value.join(", ") : `${value}`)
			));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceParameters = (index: number, desc: OSCQueryRNBOInstance["CONTENTS"]["params"]): AppThunk =>
	(dispatch, getState) => {
		try {
			if (!desc) return;

			const state = getState();
			const instance = getInstanceByIndex(state, index);
			if (!instance) return;

			dispatch(setInstance(
				instance.set("parameters", InstanceStateRecord.parametersFromDescription(desc))
			));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceDataRefValue = (index: number, name: string, value: string): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();

			const instance = getInstanceByIndex(state, index);
			if (!instance) return;

			dispatch(setInstance(
				instance.setDataRefValue(name, value)
			));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceParameterValue = (index: number, id: ParameterRecord["id"], value: number): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const instance = getInstanceByIndex(state, index);
			if (!instance) return;

			dispatch(setInstance(instance.setParameterValue(id, value)));
		} catch (e) {
			console.log(e);
		}
	};

export const updateInstanceParameterValueNormalized = (index: number, id: ParameterRecord["id"], value: number): AppThunk =>
	(dispatch, getState) => {
		try {
			const state = getState();
			const instance = getInstanceByIndex(state, index);
			if (!instance) return;

			dispatch(setInstance(instance.setParameterNormalizedValue(id, value)));
		} catch (e) {
			console.log(e);
		}
	};


// Parameter Display Settings
export const setParameterSortAttribute = (attr: ParameterSortAttr): InstanceAction => {
	return {
		type: InstanceActionType.SET_INSTANCE_PARAMTER_SORT_ATTR,
		payload: {
			attr
		}
	};
};

export const setParameterSortOrder = (order: SortOrder): InstanceAction => {
	return {
		type: InstanceActionType.SET_INSTANCE_PARAMTER_SORT_ORDER,
		payload: {
			order
		}
	};
};
