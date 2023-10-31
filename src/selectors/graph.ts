import { Map as ImmuMap, Seq } from "immutable";
import { RootStateType } from "../lib/store";
import { GraphConnectionRecord, GraphNodeRecord, GraphPatcherNodeRecord, GraphSystemNodeRecord, NodeType } from "../models/graph";

export const getNode = (state: RootStateType, id: GraphNodeRecord["id"]): GraphNodeRecord | undefined => state.graph.nodes.get(id);
export const getNodes = (state: RootStateType): ImmuMap<GraphNodeRecord["id"], GraphNodeRecord> => state.graph.nodes;
export const getNodeByIndex = (state: RootStateType, index: GraphPatcherNodeRecord["index"]): GraphPatcherNodeRecord | undefined => {
	const id = state.graph.patcherNodeIdByIndex.get(index);
	const node = id ? state.graph.nodes.get(id) : undefined;
	return node as GraphPatcherNodeRecord | undefined;
};

export const getPatcherNodes = (state: RootStateType): ImmuMap<GraphPatcherNodeRecord["id"], GraphPatcherNodeRecord> => {
	return state.graph.nodes.filter(node => node.type === NodeType.Patcher) as ImmuMap<GraphPatcherNodeRecord["id"], GraphPatcherNodeRecord>;
};

export const getPatcherNodesByIndex = (state: RootStateType): ImmuMap<GraphPatcherNodeRecord["index"], GraphPatcherNodeRecord> => {
	return ImmuMap<GraphPatcherNodeRecord["index"], GraphPatcherNodeRecord>().withMutations(map => {
		state.graph.patcherNodeIdByIndex.forEach((id, index) => {
			const node = getNode(state, id);
			if (node && node.type === NodeType.Patcher) map.set(index, node);
		});
	});
};

export const getSystemNodes = (state: RootStateType): ImmuMap<GraphSystemNodeRecord["id"], GraphSystemNodeRecord> => {
	return state.graph.nodes.filter(node => node.type === NodeType.System) as ImmuMap<GraphSystemNodeRecord["id"], GraphSystemNodeRecord>;
};


export const getConnection = (state: RootStateType, id: GraphConnectionRecord["id"]): GraphConnectionRecord | undefined => state.graph.connections.get(id);
export const getConnections = (state: RootStateType): ImmuMap<GraphConnectionRecord["id"], GraphConnectionRecord> => state.graph.connections;

export const getConnectionByNodesAndPorts = (
	state: RootStateType,
	{ sourceNodeId, sourcePortId, sinkNodeId, sinkPortId }: {  sourceNodeId: string; sourcePortId: string; sinkNodeId: string; sinkPortId: string; }
): GraphConnectionRecord | undefined => {
	return state.graph.connections.get(GraphConnectionRecord.idFromNodesAndPorts(sourceNodeId, sourcePortId, sinkNodeId, sinkPortId));
};

export const getConnectionsForSourceNodeAndPort = (
	state: RootStateType,
	{ sourceNodeId, sourcePortId }: {  sourceNodeId: string; sourcePortId: string; }
): Seq.Indexed<GraphConnectionRecord> => {
	return state.graph.connections.filter(conn => conn.sourceNodeId === sourceNodeId && conn.sourcePortId === sourcePortId).valueSeq();
};


export const getConnectionsForSinkNodeAndPort = (
	state: RootStateType,
	{ sinkNodeId, sinkPortId }: {  sinkNodeId: string; sinkPortId: string; }
): Seq.Indexed<GraphConnectionRecord> => {
	return state.graph.connections.filter(conn => conn.sinkNodeId === sinkNodeId && conn.sinkPortId === sinkPortId).valueSeq();
};
