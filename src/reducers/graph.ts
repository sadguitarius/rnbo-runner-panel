import { Map as ImmuMap } from "immutable";
import { GraphAction, GraphActionType } from "../actions/graph";
import { GraphConnectionRecord, GraphNodeRecord, GraphPatcherNodeRecord, NodeType } from "../models/graph";

export interface GraphState {

	connections: ImmuMap<GraphConnectionRecord["id"], GraphConnectionRecord>;
	nodes: ImmuMap<GraphNodeRecord["id"], GraphNodeRecord>;
	patcherNodeIdByIndex: ImmuMap<GraphPatcherNodeRecord["index"], GraphPatcherNodeRecord["id"]>;

}

export const graph = (state: GraphState = {

	connections: ImmuMap<GraphConnectionRecord["id"], GraphConnectionRecord>(),
	nodes: ImmuMap<GraphNodeRecord["id"], GraphNodeRecord>(),
	patcherNodeIdByIndex: ImmuMap<GraphPatcherNodeRecord["index"], GraphPatcherNodeRecord["id"]>()

}, action: GraphAction): GraphState => {

	switch (action.type) {

		case GraphActionType.INIT: {
			const { connections, nodes } = action.payload;

			return {
				...state,
				connections: ImmuMap<GraphConnectionRecord["id"], GraphConnectionRecord>().withMutations((map) => {
					for (const connection of connections) {
						map.set(connection.id, connection);
					}
				}),
				nodes: ImmuMap<GraphNodeRecord["id"], GraphNodeRecord>(nodes.map(n => [n.id, n])),
				patcherNodeIdByIndex: ImmuMap<GraphPatcherNodeRecord["index"], GraphPatcherNodeRecord["id"]>().withMutations((map) => {
					for (const node of nodes) {
						if (node.type === NodeType.Patcher) {
							map.set(node.index, node.id);
						}
					}
				})
			};
		}

		case GraphActionType.DELETE_NODE: {
			const { node } = action.payload;
			return {
				...state,
				nodes: state.nodes.delete(node.id),
				patcherNodeIdByIndex: node.type === NodeType.Patcher ? state.patcherNodeIdByIndex.delete(node.index) : state.patcherNodeIdByIndex,
				connections: state.connections
					.filter(connection => connection.sourceNodeId !== node.id && connection.sinkNodeId !== node.id )
			};
		}

		case GraphActionType.DELETE_NODES: {
			const { nodes } = action.payload;
			const nodeIds = nodes.map(n => n.id);
			return {
				...state,
				nodes: state.nodes.deleteAll(nodeIds),
				patcherNodeIdByIndex: state.patcherNodeIdByIndex.deleteAll(
					(nodes.filter(n => n.type === NodeType.Patcher) as GraphPatcherNodeRecord[])
						.map(n => n .index)
				),
				connections: state.connections
					.filter(connection => !nodeIds.includes(connection.sourceNodeId) && !nodeIds.includes(connection.sinkNodeId) )
			};
		}

		case GraphActionType.SET_NODE: {
			const { node } = action.payload;
			return {
				...state,
				nodes: state.nodes.set(node.id, node),
				patcherNodeIdByIndex: node.type === NodeType.Patcher ? state.patcherNodeIdByIndex.set(node.index, node.id) : state.patcherNodeIdByIndex
			};
		}

		case GraphActionType.SET_NODES: {
			const { nodes } = action.payload;
			return {
				...state,
				nodes: state.nodes.withMutations(map => {
					for (const node of nodes) {
						map.set(node.id, node);
					}
				}),
				patcherNodeIdByIndex: state.patcherNodeIdByIndex.withMutations(map => {
					for (const node of nodes) {
						if (node.type === NodeType.Patcher) {
							map.set(node.index, node.id);
						}
					}
				})
			};
		}

		case GraphActionType.DELETE_CONNECTION: {
			const { connection } = action.payload;

			const nodeConns = state.connections.get(connection.sourceNodeId);
			if (!nodeConns) return state;

			return {
				...state,
				connections: state.connections.delete(connection.id)
			};
		}

		case GraphActionType.DELETE_CONNECTIONS: {
			const { connections } = action.payload;

			return {
				...state,
				connections: state.connections.deleteAll(connections.map(conn => conn.id))
			};
		}

		case GraphActionType.SET_CONNECTION: {
			const { connection } = action.payload;

			return {
				...state,
				connections: state.connections.set(connection.id, connection)
			};
		}

		case GraphActionType.SET_CONNECTIONS: {
			const { connections } = action.payload;

			const newConns = state.connections.withMutations(map => {

				for (const connection of connections) {
					map.set(connection.id, connection);
				}
			});

			return {
				...state,
				connections: newConns
			};
		}

		default:
			return state;
	}
};
