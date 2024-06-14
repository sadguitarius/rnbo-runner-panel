import { Button, Group, Stack, Table, Text, UnstyledButton } from "@mantine/core";
import { DataFileListItem } from "../components/datafile/item";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { RootStateType } from "../lib/store";
import { getDataFilesSortedByName } from "../selectors/datafiles";
import classes from "../components/datafile/datafile.module.css";
import { faArrowDownAZ, faArrowUpAZ, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SortOrder } from "../lib/constants";
import { useCallback, useState } from "react";
import { DataFileUploadModal } from "../components/datafile/uploadModal";
import { useDisclosure } from "@mantine/hooks";
import { deleteDataFileOnRemote } from "../actions/datafiles";
import { DataFileRecord } from "../models/datafile";
import { modals } from "@mantine/modals";

const SampleDependencies = () => {

	const [showUploadModal, uploadModalHandlers] = useDisclosure(false);
	const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.Asc);

	const dispatch = useAppDispatch();
	const [files] = useAppSelector((state: RootStateType) => [
		getDataFilesSortedByName(state, sortOrder)
	]);

	const onToggleSort = useCallback(() => {
		setSortOrder(sortOrder === SortOrder.Asc ? SortOrder.Desc : SortOrder.Asc);
	}, [setSortOrder, sortOrder]);

	const onDeleteFile = useCallback((file: DataFileRecord) => {
		modals.openConfirmModal({
			title: "Delete File",
			centered: true,
			children: (
				<Text size="sm">
					Are you sure you want to delete the file { `"${file.id}"` } from the device?
				</Text>
			),
			labels: { confirm: "Clear", cancel: "Cancel" },
			confirmProps: { color: "red" },
			onConfirm: () => dispatch(deleteDataFileOnRemote(file))
		});
	}, [dispatch]);

	return (
		<Stack className={ classes.dataFileWrap } >
			<Group justify="space-between" wrap="nowrap">
				<Button variant="default" leftSection={ <FontAwesomeIcon icon={ faUpload } /> } onClick={ uploadModalHandlers.open } >
					Upload Files
				</Button>
			</Group>
			{ showUploadModal ? <DataFileUploadModal maxFileCount={ 10 } onClose={ uploadModalHandlers.close } /> : null }
			<Table verticalSpacing="sm" maw="100%" layout="fixed">
				<Table.Thead>
					<Table.Tr>
						<Table.Th>
							<UnstyledButton onClick={ onToggleSort } className={ classes.control } >
								<Group justify="space-between" align="center">
									<Text fw="bold" fz="sm">Filename</Text>
									<FontAwesomeIcon icon={ sortOrder === SortOrder.Asc ? faArrowDownAZ : faArrowUpAZ } />
								</Group>
							</UnstyledButton>
						</Table.Th>
						<Table.Th w={ 60 }></Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{
						files.map(f => (
							<DataFileListItem
								key={ f.id }
								dataFile={ f }
								onDelete={ onDeleteFile }
							/>
						))
					}
				</Table.Tbody>

			</Table>
		</Stack>
	);
};

export default SampleDependencies;
