import { IconButton } from '@/components/ui/IconButton';

import type { DraggableProvided } from '@hello-pangea/dnd';

import './KanbanColumnHeader.css';

export function KanbanColumnHeader({
	id,
	title,
	dragProps,
	cardsCount,
	// onCardAdd,
}: {
	id: string;
	title: string;
	dragProps: DraggableProvided;
	cardsCount: number;
	// onCardAdd: (columnId: KanbanColumnData['id']) => Promise<void>
}) {
	return (
		<div
			ref={dragProps.innerRef}
			className="fdb-flex-row fdb"
			{...dragProps.dragHandleProps}
		>
			<h3 className="fdb-kanban-column-title">{title}</h3>
			<p className="fdb-kanban-column-items-count">{cardsCount}</p>

			<div className="fdb-flex-spacer" />

			<IconButton
				className="fdb-kanban-add-card-button"
				iconId="plus"
				onClick={() => {
					void id;
					// onCardAdd(id);
				}}
			>
				Add card
			</IconButton>
		</div>
	);
}
