import { addCard, ControlledBoard, moveCard, moveColumn } from '@caldwell619/react-kanban';
import { useEffect, useRef, useState } from 'react';

import { useSettingsStore } from '@/contexts/settings-context';
import { generateFrontMatterText } from '@/helpers/frontmatter';
import { getValueAtIndex } from '@/helpers/sets';
import { capitalize } from '@/helpers/text';
import { useApp } from '@/hooks/use-app';
import { updateFileFrontMatter } from '@/lib/frontmatter';
import { KanbanCard } from './KanbanCard';
import { KanbanColumnHeader } from './KanbanColumnHeader';

import type { KanbanBoard as KanbanData, OnDragEndNotification } from '@caldwell619/react-kanban';
import type { FileData } from '@/lib/files-data';
import type { KanbanCardData, KanbanColumnData } from '@/types/kanban';

import './KanbanBoard.css';

export function KanbanBoard({
	data: initialData,
	keys,
	folderPath,
}: {
	data: FileData[];
	keys: Set<string>;
	folderPath: string;
}) {
	const wrapper = useRef<HTMLDivElement | null>(null);

	const app = useApp();
	const kanban = useSettingsStore((settings) => settings.kanban);

	const [columnsKey, _setColumnsKey] = useState<string>(() => {
		// biome-ignore lint/style/noNonNullAssertion: Component isn't instanced if there are no frontmatter keys
		return kanban.columnsKey ?? getValueAtIndex(keys, 0)!;
	});

	// Build the inital columns
	const [board, setBoard] = useState<KanbanData<KanbanCardData>>(() => {
		const columnIds = new Set<string>(initialData.map((fileData) => String(fileData.frontmatter[columnsKey])));
		const columns: KanbanColumnData[] = [...columnIds.values()].map((columnId) => ({
			id: columnId,
			title: capitalize(columnId),
			cards: initialData
				.filter((fileData) => fileData.frontmatter[columnsKey] === columnId)
				.map(({ path, basename, frontmatter, markdownContent }) => ({
					id: path,
					columnId,
					filePath: path,
					title: basename,
					frontmatter,
					markdownContent,
				})),
		}));

		return { columns };
	});

	const handleCardMoved: OnDragEndNotification<KanbanCardData> = (card, source, destination) => {
		const columnId = destination?.toColumnId;
		if (!columnId) {
			return;
		}

		setBoard((currentBoard) => moveCard(currentBoard, source, destination));

		void (async () => {
			try {
				await updateFileFrontMatter(app, card.filePath, (frontmatter) => {
					frontmatter[columnsKey] = columnId;
				});
			} catch (error) {
				console.error(error); // TODO: Display error somewhere
			}
		})();
	};

	const handleColumnMoved: OnDragEndNotification<KanbanColumnData> = (_column, source, destination) => {
		setBoard((currentBoard) => moveColumn(currentBoard, source, destination));
	};

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

	// Disable containement for the parent `WorkspaceLeaf` element as it breaks the drag & drop of the cards
	useEffect(() => {
		const leafElement = wrapper.current?.closest<HTMLElement>('.workspace-leaf');
		if (leafElement) {
			leafElement.style = 'contain: none !important;';
		}
	}, []);

	return (
		<div ref={wrapper}>
			<ControlledBoard
				allowAddCard={false} // Handle the UI and logic to add a card ourselves
				allowAddColumn={false} // TODO: Allow this?
				allowRenameColumn={false}
				allowRemoveColumn={false}
				renderCard={(card) => <KanbanCard {...card} />}
				renderColumnHeader={(column) => (
					<KanbanColumnHeader
						{...column}
						onCardAdd={handleCardAdded}
					/>
				)}
				onCardDragEnd={handleCardMoved}
				onColumnDragEnd={handleColumnMoved}
			>
				{board}
			</ControlledBoard>
		</div>
	);
}
