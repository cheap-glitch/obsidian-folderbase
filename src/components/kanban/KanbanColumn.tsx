import { Draggable, type DraggableProvided, Droppable } from '@hello-pangea/dnd';
import { clsx } from 'clsx';

import { KanbanCard } from '@/components/kanban/KanbanCard';
import { KanbanColumnHeader } from '@/components/kanban/KanbanColumnHeader';

import { capitalize } from '@/helpers/text';

import type { KanbanCardData } from '@/types/kanban';

import './KanbanColumn.css';

export function KanbanColumn({
	id,
	cards,
	groupingKey,
	dragProps,
	isDragged: isColumnDragged,
	// isDraggedOver,
}: {
	id: string;
	cards: KanbanCardData[];
	groupingKey: string;
	dragProps: DraggableProvided;
	isDragged: boolean;
	// isDraggedOver: boolean;
}) {
	return (
		<div
			className="fdb-kanban-column"
			{...dragProps.draggableProps}
		>
			<KanbanColumnHeader
				id={id}
				title={capitalize(id)}
				dragProps={dragProps}
				cardsCount={cards.length}
			/>

			<Droppable
				type="card"
				direction="vertical"
				droppableId={id}
			>
				{(dropProvided, { isDraggingOver: isDraggedOver }) => (
					<div
						ref={dropProvided.innerRef}
						className={clsx('fdb-kanban-column-contents', isDraggedOver && 'fdb-is-dragged-over')}
					>
						{cards.map(
							(card, index) =>
								card && (
									<Draggable
										key={card.id}
										index={index}
										draggableId={card.id}
									>
										{(provided, { isDragging }) => (
											<KanbanCard
												{...card}
												groupingKey={groupingKey}
												dragProps={provided}
												isDragged={isDragging || isColumnDragged}
											/>
										)}
									</Draggable>
								),
						)}
						{dropProvided.placeholder}
					</div>
				)}
			</Droppable>
		</div>
	);
}
