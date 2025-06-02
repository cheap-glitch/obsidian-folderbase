import { KanbanCard } from './KanbanCard';
import { KanbanColumnHeader } from './KanbanColumnHeader';

import type { KanbanCardData, KanbanColumnData } from '@/types/kanban';

import './KanbanColumn.css';

export function KanbanColumn({ id, title, cards }: KanbanColumnData & { cards: KanbanCardData[] }) {
	return (
		<div className="fdb-kanban-column">
			<KanbanColumnHeader
				id={id}
				title={title}
				cardsCount={cards.length}
			/>
			{/*
			<Droppable
				id={`fdb-kanban-column-${id}`}
			>
			*/}
			<div className="fdb-kanban-column-contents">
				{cards.map((card) => (
					/*
					<Draggable
						key={card.id}
						id={`fdb-kanban-card-${card.id}`}
					>
					*/
					<KanbanCard
						key={card.id}
						{...card}
					/>
				))}
			</div>
			{/* </Droppable> */}
		</div>
	);
}
