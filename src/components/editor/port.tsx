import React, { FunctionComponent, memo } from "react";
import { GraphPortRecord, PortDirection } from "../../models/graph";
import { Handle, HandleType, Position } from "reactflow";

export type PortProps = {
	offset: number;
	port: GraphPortRecord;
};

const handleTypeByPortDirection: Record<PortDirection, HandleType> = {
	[PortDirection.Sink]: "target",
	[PortDirection.Source]: "source"
};

const handlePositionByPortDirection: Record<PortDirection, Position> = {
	[PortDirection.Sink]: Position.Left,
	[PortDirection.Source]: Position.Right
};

const EditorPort: FunctionComponent<PortProps> = memo(function WrappedPort({
	port,
	offset
}) {

	return (
		<Handle
			id={ port.name }
			position={ handlePositionByPortDirection[port.direction] }
			data-c74-type={ port.type }
			type={ handleTypeByPortDirection[port.direction] }
			style={{ top: `${offset * 100}%` }}
		/>
	);
});

export default EditorPort;
