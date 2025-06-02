import { IconButton } from '@/components/ui/IconButton';

import './KanbanColumnHeader.css';

export function KanbanColumnHeader({
	id,
	title,
	cardsCount,
	// onCardAdd,
}: {
	id: string;
	title: string;
	cardsCount: number;
	// onCardAdd: (columnId: KanbanColumnData['id']) => Promise<void>
}) {
	return (
		<div className="fdb-flex-row fdb">
			<h3 className="fdb-kanban-column-title">{title}</h3>
			<p className="fdb-kanban-column-items-count">{cardsCount}</p>
			<div className="fdb-flex-spacer" />
			<IconButton
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
