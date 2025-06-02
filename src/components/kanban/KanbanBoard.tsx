import { useMemo, useState } from 'react';

import { useSettings } from '@/contexts/settings-context';

import { buildInitialColumns, buildKanbanCards } from '@/lib/kanban';
import { KanbanColumn } from './KanbanColumn';

import type { FileData } from '@/lib/files-data';
import type { KanbanCardData, KanbanColumnData } from '@/types/kanban';

import './KanbanBoard.css';

import { Select } from '../ui/Select';

export function KanbanBoard({ initialData, initialKeys }: { initialData: FileData[]; initialKeys: Set<string> }) {
	const settings = useSettings((settings) => settings.kanban);
	const setColumnsKey = useSettings((settings) => settings.setColumnsKey);
	// const setColumnsOrder = useSettings((settings) => settings.setColumnsOrder);

	const [keys, _setKeys] = useState(() => [...initialKeys]);
	const cards = useMemo<KanbanCardData[]>(() => buildKanbanCards(initialData), [initialData]);
	const columns = useMemo<KanbanColumnData[]>(() => buildInitialColumns(cards, settings), [cards, settings]);

	// const wrapper = useRef<HTMLDivElement | null>(null);
	// const { setFileFrontmatterProperty } = useUpdateFileFrontmatter();

	/*
	async function handleCardAdded(columnId: KanbanColumnData['id']): Promise<void> {
		const fileBasename = `New card – ${columnId}`;
		const filePath = `${folderPath}/${fileBasename}.md`;

		try {
			addCard<KanbanCardData>(
				board,
				{ id: columnId },
				{
					id: filePath,
					columnId: String(columnId),
					filePath,
					title: fileBasename,
					frontmatter: {},
					markdownContent: '',
				},
				{ on: 'top' },
			);

			// TODO: Wrap this in a helper to automatically ignore the creation event?
			await app.vault.create(filePath, generateFrontMatterText({ [columnsKey]: columnId }));
		} catch (error) {
			console.error(error); // TODO: Display error somewhere
		}
	}
	*/

	// Disable containement for the parent `WorkspaceLeaf` element as it breaks the drag & drop of the cards
	/*
	useEffect(() => {
		const leafElement = wrapper.current?.closest<HTMLElement>('.workspace-leaf');
		if (leafElement) {
			leafElement.style = 'contain: none !important';
		}
	}, []);
	*/

	// const [draggedCardId, setDraggedCardId] = useState<string | undefined>();
	// const draggedCard = useMemo(() => cards.find((card) => card.id === draggedCardId), [cards, draggedCardId]);

	return (
		<div className="fdb-kanban-board">
			{/*
			<DndContext
				onDragStart={({ active }: { active: { id: string } }) => {
					setDraggedCardId(active.id);
				}}
				onDragEnd={() => {
					setDraggedCardId(undefined);
				}}
			>
			*/}
			<div className="fdb-kanban-board-settings">
				<Select
					className="fdb-kanban-settings-select"
					label="Group by"
					value={settings.columnsKey}
					options={keys}
					onChange={setColumnsKey}
				/>
			</div>
			<div className="fdb-kanban-board-columns">
				{columns.map((column) => (
					<KanbanColumn
						key={column.id}
						{...column}
						cards={cards.filter((card) => column.cardsIds.includes(card.id))}
					/>
				))}
			</div>
			{/*
				<DragOverlay
					zIndex={2}
					dropAnimation={{
						duration: 250,
						easing: 'ease-out',
					}}
				>
					{draggedCard && (
						<KanbanCard
							{...draggedCard}
							isDragged={true}
							columnsKey={columnsKey}
						/>
					)}
				</DragOverlay>
				*/}
			{/* </DndContext> */}
		</div>
	);
}

/*
	<ControlledBoard
		allowAddCard={false} // Handle the UI and logic to add a card ourselves
		allowAddColumn={false} // TODO: Allow this?
		allowRenameColumn={false}
		allowRemoveColumn={false}
		renderCard={(card) => <KanbanCard {...card} />}
		renderColumnHeader={(column) => (
			<KanbanColumnHeader
				{...column}
				// onCardAdd={handleCardAdded}
			/>
		)}
		// TODO: Change callback shape to pass directly to it the new order of the column ids
		onColumnDragEnd={(column, _source, destination) => {
			console.log(column, _source, destination);

			if (!destination?.toPosition) {
				return;
			}

			const columns = moveItemToIndex(board.columns, column, destination.toPosition);

			console.log(columns);
			setBoard({ columns });
			setColumnsOrder(columns.map(({ id }) => id));
		}}
		// TODO: Change callback shape to pass directly to it the new order of the cards ids
		onCardDragEnd={(card, source, destination) => {
			console.log(card, source, destination);

			if (!destination?.toColumnId || !destination.toPosition) {
				return;
			}

			const toIndex = destination.toPosition;

			// The card was moved within the same column
			if (source?.fromColumnId === destination.toColumnId) {
				console.log('// The card was moved within the same column');

				const columns = board.columns.map((column) => {
					if (column.id !== card.columnId) {
						return column;
					}

					return {
						...column,
						cards: moveItemToIndex(column.cards, card, toIndex),
					};
				});

				console.log(columns);
				setBoard({ columns });

				return;
			}

			// The card was moved to another column
			const columns = board.columns.map((column) => {
				if (column.id === destination.toColumnId) {
					return {
						...column,
						cards: column.cards.toSpliced(toIndex, 0, card),
					};
				}

				return column;
			});

			console.log(columns);
			setBoard({ columns });
			void setFileFrontmatterProperty(card.filePath, columnsKey, destination.toColumnId);
		}}
	>
		{board}
	</ControlledBoard>
	*/
