import { IconButton } from '@/components/ui/IconButton';

import type { KanbanColumnData } from '@/types/kanban';

import './KanbanColumnHeader.css';

export function KanbanColumnHeader({
	id,
	title,
	cards,
	onCardAdd,
}: KanbanColumnData & { onCardAdd: (columnId: KanbanColumnData['id']) => Promise<void> }) {
	return (
		<div className="fdb-flex-row fdb">
			<h3 className="fdb-kanban-column-title">{title}</h3>
			<p className="fdb-kanban-column-items-count">{cards.length}</p>
			<div className="fdb-flex-spacer" />
			<IconButton
				iconId="plus"
				onClick={() => {
					onCardAdd(id);
				}}
			>
				Add card
			</IconButton>
		</div>
	);
}
