import { ControlledBoard, moveCard } from '@caldwell619/react-kanban';
import { useEffect, useRef, useState } from 'react';

import { KanbanCard } from './KanbanCard';

import type { KanbanBoard as KanbanData, OnDragEndNotification } from '@caldwell619/react-kanban';
import type { KanbanCardData } from '@/types/kanban';

export function KanbanBoard({ data: initialBoard }: { data: KanbanData<KanbanCardData> }) {
	const wrapper = useRef<HTMLDivElement | null>(null);
	const [board, setBoard] = useState<KanbanData<KanbanCardData>>(initialBoard);

	const handleCardMove: OnDragEndNotification<KanbanCardData> = (_card, source, destination) => {
		setBoard((currentBoard) => moveCard(currentBoard, source, destination));
	};

	useEffect(() => {
		if (!wrapper.current) {
			return;
		}

		const leafElement = wrapper.current.closest<HTMLElement>('.workspace-leaf');
		if (leafElement) {
			// Disable containement for the view as it breaks the drag & drop
			leafElement.style = 'contain: none !important;';
		}
	}, []);

	return (
		<div ref={wrapper}>
			<ControlledBoard
				allowRenameColumn={false}
				renderCard={(card) => <KanbanCard {...card} />}
				onCardDragEnd={handleCardMove}
			>
				{board}
			</ControlledBoard>
		</div>
	);
}
