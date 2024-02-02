import { ChangeEvent, useState, useCallback, useRef, FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/useAppDispatch";
import { RootStateType } from "../../lib/store";
import { useRouter } from "next/router";
import { Button, Table, TextInput, Stack, Text, ActionIcon } from "@mantine/core";
import { modals } from '@mantine/modals';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
import { getAppStatus } from "../../selectors/appStatus";
import { AppStatus } from "../../lib/constants";
import { saveSetOnRemote, loadSetOnRemote, destroySetOnRemote, renameSetOnRemote } from "../../actions/graph";

export default function Sets() {

	const { query, isReady, push } = useRouter();
	const { ...restQuery } = query;

	const dispatch = useAppDispatch();

	const [name, setName] = useState<string>("");
	const [error, setError] = useState<string | undefined>(undefined);

	const [sets, appStatus] = useAppSelector((state: RootStateType) => {
		const names: string[] =	state.sets.sets.toArray().map(v => v[1].name).toSorted();
		return [names, getAppStatus(state)];
	});

	if (!isReady || appStatus !== AppStatus.Ready) return null;

	const onSaveSet = useCallback((e: FormEvent<HTMLFormElement>): void => {
		e.preventDefault();
		if (!name?.length) {
			setError("Please provide a valid set name");
		} else {
			setError(undefined);
			dispatch(saveSetOnRemote(name));
			setName("");
		}
	}, [dispatch, name, setName, setError]);


	const onNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
		setName(e.target.value);
		if (error && e.target.value?.length) setError(undefined);
	};

	const onLoadSet = useCallback((name: string): void => {
		dispatch(loadSetOnRemote(name));
		push({ pathname: "/", query: restQuery });
	}, [dispatch, restQuery]);

	const newNameInput = useRef<HTMLInputElement>(null);
	const onRenameSet = (name: string) => {
		const handleClick = async () => {
			const newName = newNameInput.current?.value;
			if (newName) {
				dispatch(renameSetOnRemote(name, newName));
			}
			modals.closeAll();
		};

		return modals.open({
			title: `Rename set "${name}"`,
			children: (
				<>
					<TextInput
						label="New Name"
						placeholder={name}
						ref={newNameInput}
						data-autofocus
					/>
					<Button fullWidth onClick={handleClick} mt="md">
						Submit
					</Button>
				</>
			),
		});
	};


	const onDeleteSet = (name: string) =>
		modals.openConfirmModal({
      title: 'Delete set',
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete the set named "{name}"?
        </Text>
      ),
      labels: { confirm: `Delete set ${name}`, cancel: "No don't delete it" },
      confirmProps: { color: 'red' },
      //onCancel: () => console.log('Cancel'),
      onConfirm: () => dispatch(destroySetOnRemote(name)),
    });

  const rows = sets.map((name) => {
    return (
      <Table.Tr key={name}>
        <Table.Td>
					{name}
        </Table.Td>
        <Table.Td>
					<ActionIcon variant="default" onClick={() => onLoadSet(name) }>
						<FontAwesomeIcon icon={faUpload} />
					</ActionIcon>
					<ActionIcon variant="default" onClick={() => onRenameSet(name) }>
						<FontAwesomeIcon icon={faPenToSquare} />
					</ActionIcon>
					<ActionIcon variant="default" onClick={() => onDeleteSet(name) }>
						<FontAwesomeIcon icon={faTrash} />
					</ActionIcon>
				</Table.Td>
      </Table.Tr>
    );
  });

  return (
		<div>
			<form onSubmit={ onSaveSet } >
				<Stack gap="xs">
					<TextInput
						label="Create Set"
						description="Name the new set"
						placeholder="Set Name"
						value={ name }
						error={ error || undefined }
						onChange={ onNameChange }
					/>
					<Button variant="outline" size="sm" type="submit">Save</Button>
				</Stack>
			</form>
			<Table.ScrollContainer minWidth={40}>
				<Table verticalSpacing="xs">
					<Table.Thead>
						<Table.Tr>
							<Table.Th>Name</Table.Th>
							<Table.Th>Control</Table.Th>
						</Table.Tr>
					</Table.Thead>
					<Table.Tbody>{rows}</Table.Tbody>
				</Table>
			</Table.ScrollContainer>
		</div>
  );
}
