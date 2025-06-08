import { Draggable, type DroppableProvided } from '@hello-pangea/dnd';
import { clsx } from 'clsx';

import { KanbanCard } from '@/components/kanban/KanbanCard';
import { KanbanColumnHeader } from '@/components/kanban/KanbanColumnHeader';

import { capitalize } from '@/helpers/text';

import type { KanbanCardData } from '@/types/kanban';

import './KanbanColumn.css';

export function KanbanColumn({
	id,
	cards,
	dndProps,
	isDragged: isColumnDragged,
	isDraggedOver,
}: {
	id: string;
	// allCards: KanbanCardData[];
	cards: KanbanCardData[];
	dndProps: DroppableProvided;
	isDragged: boolean;
	isDraggedOver: boolean;
}) {
	// const groupingKey = useViewSettings((settings) => settings.kanban.groupingKey);
	// const columnsCardsOrders = useViewSettings((settings) => settings.kanban.columnsCardsOrders);
	// const cards = useMemo(() => {
	// 	return getSortedColumnCards({
	// 		columnId: id,
	// 		cards: allCards,
	// 		groupingKey,
	// 		columnCardsOrder: columnsCardsOrders[groupingKey]?.[id],
	// 	});
	// }, [id, allCards, groupingKey, columnsCardsOrders]);

	return (
		<div
			ref={dndProps.innerRef}
			className={clsx('fdb-kanban-column', isDraggedOver && 'is-dragged-over')}
			{...dndProps.droppableProps}
		>
			<KanbanColumnHeader
				id={id}
				title={capitalize(id)}
				cardsCount={cards.length}
			/>
			<div className="fdb-kanban-column-contents">
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
										dndProps={provided}
										isDragged={isDragging || isColumnDragged}
									/>
								)}
							</Draggable>
						),
				)}
				{dndProps.placeholder}
			</div>
		</div>
	);
}
