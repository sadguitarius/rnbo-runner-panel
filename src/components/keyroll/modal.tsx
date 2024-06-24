import { FunctionComponent, memo, useCallback, useEffect } from "react";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import KeyRoll from "../keyroll";
import { InstanceStateRecord } from "../../models/instance";
import { triggerInstanceMidiNoteOffEventOnRemote, triggerInstanceMidiNoteOnEventOnRemote } from "../../actions/instances";
import { Group, Modal } from "@mantine/core";
import { useIsMobileDevice } from "../../hooks/useIsMobileDevice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMusic } from "@fortawesome/free-solid-svg-icons";

export type InstanceKeyboardModalProps = {
	instance: InstanceStateRecord;
	keyboardEnabled: boolean;
	open: boolean;
	onClose: () => any;
}

const InstanceKeyboardModal: FunctionComponent<InstanceKeyboardModalProps> = memo(function WrappedInstanceMIDITab({
	instance,
	keyboardEnabled,
	open,
	onClose
}) {

	const dispatch = useAppDispatch();
	const showFullScreen = useIsMobileDevice();

	const triggerMIDINoteOn = useCallback((p: number) => {
		dispatch(triggerInstanceMidiNoteOnEventOnRemote(instance, p));
	}, [dispatch, instance]);

	const triggerMIDINoteOff = useCallback((p: number) => {
		dispatch(triggerInstanceMidiNoteOffEventOnRemote(instance, p));
	}, [dispatch, instance]);

	useEffect(() => {
		if (open && document.activeElement && document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}
	}, [open]);

	return (
		<Modal.Root
			opened={ open }
			onClose={ onClose }
			fullScreen={ showFullScreen }
			size="80vw"
			trapFocus={ false }
		>
			<Modal.Overlay />
			<Modal.Content>
				<Modal.Header>
					<Group gap="xs">
						<FontAwesomeIcon icon={ faMusic } />
						Virtual Keyboard
					</Group>
					<Modal.CloseButton />
				</Modal.Header>
				<Modal.Body style={{ height: showFullScreen ? "75vh" : undefined }}>
					<KeyRoll onTriggerNoteOn={ triggerMIDINoteOn } onTriggerNoteOff={ triggerMIDINoteOff } keyboardEnabled={ keyboardEnabled } />
				</Modal.Body>
			</Modal.Content>
		</Modal.Root>
	);
});

export default InstanceKeyboardModal;
