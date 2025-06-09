import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { clsx } from 'clsx';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';

import { SettingsUpdatersContext } from '@/contexts/settings-updaters-context';
import { useViewSettings } from '@/contexts/view-settings-context';

import { KanbanColumn } from '@/components/kanban/KanbanColumn';
import { Checkbox } from '@/components/ui/Checkbox';
import { Select } from '@/components/ui/Select';

import { moveItemToIndex, pushMissingItems, unique } from '@/helpers/arrays';
import { useAsyncEffect } from '@/hooks/use-async-effects';
import { useUpdateFileFrontmatter } from '@/hooks/use-update-file-frontmatter';
import { buildKanbanCards } from '@/lib/kanban';

import type { FileData } from '@/lib/files-data';
import type { KanbanColumnsSettings, KanbanSettings } from '@/lib/settings';
import type { KanbanCardData } from '@/types/kanban';

import './KanbanBoard.css';

export function KanbanBoard({
	initial,
}: {
	initial: {
		data: FileData[];
		keys: Set<string>;
		boardSettings: KanbanSettings['board'];
	};
}) {
	const { setFileFrontmatterProperty } = useUpdateFileFrontmatter();
	const { saveKanbanViewSettings, saveKanbanBoardColumnSettings } = useContext(SettingsUpdatersContext);

	const allColumnsKeys = useMemo(() => [...initial.keys], [initial.keys]);
	const [cards, setCards] = useState<KanbanCardData[]>(() => buildKanbanCards(initial.data));
	const [groupingKey, setGroupingKey] = useState(() => initial.boardSettings.groupingKey);

	function getColumnCards(columnId: string): KanbanCardData[] {
		return cards.filter((card) => card.data.frontmatter[groupingKey] === columnId);
	}

	function getColumnsOrder(key: string): string[] {
		return pushMissingItems(
			initial.boardSettings.columns[groupingKey]?.order ?? [],
			unique(cards.map((card) => String(card.data.frontmatter[key]))), // Add potentially missing column IDs at the end
		);
	}

	function getColumnsCardsOrders(key: string): KanbanColumnsSettings['cardsOrders'] {
		const result: KanbanColumnsSettings['cardsOrders'] = {};
		for (const id of columnsOrder) {
			result[id] = pushMissingItems(
				initial.boardSettings.columns[key]?.cardsOrders[id] ?? [],
				getColumnCards(id).map((card) => card.id), // Add potentially missing card IDs at the end
			);
		}

		return result;
	}

	const [columnsOrder, setColumnsOrder] = useState(() => getColumnsOrder(groupingKey));
	const [columnsCardsOrders, setColumnsCardsOrders] = useState(() => getColumnsCardsOrders(groupingKey));

	useAsyncEffect(
		async (signal: AbortSignal) => {
			if (signal.aborted) {
				return;
			}

			await saveKanbanBoardColumnSettings(groupingKey, {
				order: columnsOrder,
				cardsOrders: columnsCardsOrders,
			});
		},
		[groupingKey, columnsOrder, columnsCardsOrders],
	);

	const viewSettings = useViewSettings((settings) => settings.view);
	const setShowCardContents = useViewSettings((settings) => settings.actions.setShowCardContents);

	useAsyncEffect(
		async (signal: AbortSignal) => {
			if (signal.aborted) {
				return;
			}

			await saveKanbanViewSettings(viewSettings);
		},
		[viewSettings],
	);

	function getSortedColumnCards(columnId: string): KanbanCardData[] {
		const columnCards: KanbanCardData[] = [];
		for (const cardId of columnsCardsOrders[columnId]) {
			const card = cards.find((card) => card.id === cardId);
			if (card) {
				columnCards.push(card);
			}
		}

		return columnCards;
	}

	function moveCardToColumn({
		cardId,
		fromColumn,
		toColumn,
	}: {
		cardId: string;
		fromColumn: {
			id: string;
		};
		toColumn: {
			id: string;
			index: number;
		};
	}): void {
		setCards(
			cards.map((card) => {
				if (card.id !== cardId) {
					return card;
				}

				card.data.frontmatter[groupingKey] = toColumn.id;

				return card;
			}),
		);

		setColumnsCardsOrders({
			...columnsCardsOrders,
			[fromColumn.id]: columnsCardsOrders[fromColumn.id].filter((id) => id !== cardId),
			[toColumn.id]: columnsCardsOrders[toColumn.id].toSpliced(toColumn.index, 0, cardId),
		});

		const card = cards.find((card) => card.id === cardId);
		if (card) {
			void setFileFrontmatterProperty(card.data.filePath, groupingKey, toColumn.id);
		}
	}

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
			await app.vault.create(filePath, generateFrontMatterText({ [groupingKey]: columnId }));
		} catch (error) {
			console.error(error); // TODO: Display error somewhere
		}
	}
	*/

	// Disable containement for the parent `WorkspaceLeaf` element as it breaks the drag & drop of the cards
	const kanbanWrapper = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		const leafElement = kanbanWrapper.current?.closest<HTMLElement>('.workspace-leaf');
		if (leafElement) {
			leafElement.style = 'contain: none !important';
		}
	}, []);

	return (
		<div
			ref={kanbanWrapper}
			className="fdb-kanban-board"
		>
			<DragDropContext
				onDragEnd={({ type, reason, source, destination, draggableId: cardId }) => {
					if (!destination || reason === 'CANCEL') {
						return;
					}

					// A column was moved
					if (type === 'column') {
						if (source.index === destination.index) {
							return;
						}

						setColumnsOrder(moveItemToIndex(columnsOrder, source.index, destination.index));

						return;
					}

					const { droppableId: fromColumnId, index: fromIndex } = source;
					const { droppableId: toColumnId, index: toIndex } = destination;

					// A card was re-ordered within the same column
					if (fromColumnId === toColumnId) {
						if (fromIndex === toIndex) {
							return;
						}

						setColumnsCardsOrders({
							...columnsCardsOrders,
							[toColumnId]: moveItemToIndex(columnsCardsOrders[toColumnId], fromIndex, toIndex),
						});

						return;
					}

					// A card was moved to another column
					moveCardToColumn({
						cardId,
						fromColumn: { id: fromColumnId },
						toColumn: { id: toColumnId, index: toIndex },
					});
				}}
			>
				<div className="fdb-kanban-board-settings">
					<Checkbox
						label="Show card contents"
						checked={viewSettings.showCardContents}
						onChange={setShowCardContents}
					/>
					<Select
						className="fdb-kanban-settings-select"
						label="Group by"
						value={groupingKey}
						options={allColumnsKeys}
						onChange={(value) => {
							setGroupingKey(value);
							setColumnsOrder(getColumnsOrder(value));
							setColumnsCardsOrders(getColumnsCardsOrders(value));
						}}
					/>
				</div>
				<Droppable
					type="column"
					direction="horizontal"
					droppableId="fdb-kanban-board"
				>
					{(dropProvided, { isDraggingOver }) => (
						<div
							ref={dropProvided.innerRef}
							className={clsx('fdb-kanban-board-columns', isDraggingOver && 'fdb-is-dragged-over')}
							{...dropProvided.droppableProps}
						>
							{columnsOrder.map((id, index) => (
								<Draggable
									key={id}
									index={index}
									draggableId={id}
								>
									{(dragProvided, { isDragging }) => (
										<KanbanColumn
											id={id}
											cards={getSortedColumnCards(id)}
											groupingKey={groupingKey}
											dragProps={dragProvided}
											isDragged={isDragging}
										/>
									)}
								</Draggable>
							))}
							{dropProvided.placeholder}
						</div>
					)}
				</Droppable>
			</DragDropContext>
		</div>
	);
}
