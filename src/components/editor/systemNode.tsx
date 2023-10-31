import React, { FunctionComponent, memo } from "react";
import { EditorNodeProps, calcPortOffset } from "./util";
import { GraphPortRecord, PortDirection } from "../../models/graph";
import EditorPort from "./port";
import classes from "./editor.module.css";
import { Paper } from "@mantine/core";

const EditorSystemNode: FunctionComponent<EditorNodeProps> = memo(function WrappedGraphPatcherNode({
	data: {
		node,
		contentHeight
	},
	selected
}) {

	const { sinks, sources } = node.ports.reduce((result, port) => {
		result[port.direction === PortDirection.Sink ? "sinks" : "sources"].push(port);
		return result;
	}, { sinks: [], sources: [] } as { sinks: GraphPortRecord[]; sources: GraphPortRecord[]; });

	return (
		<Paper className={ classes.node }  shadow="sm" withBorder data-selected={ selected } >
			<div className={ classes.nodeHeader } >
				{ node.name }
			</div>
			<div className={ classes.nodeContent } style={{ height: `${contentHeight}px` }} >
				{
					sinks.map((port, i) => <EditorPort key={ port.id} port={ port } offset={ calcPortOffset(sinks.length, i) } />)
				}
				{
					sources.map((port, i) => <EditorPort key={ port.id } port={ port } offset={ calcPortOffset(sources.length, i) } />)
				}
			</div>
		</Paper>
	);
});

export default EditorSystemNode;
