import { setIcon } from 'obsidian';
import { useRef } from 'react';

import { appendOrReplaceFirstChild } from '@/helpers/dom';

// import classes from './Icon.module.css';
import './Icon.css';

export function Icon({ id, color }: { id: string; color?: string }) {
	const ref = useRef<HTMLDivElement | null>(null);

	return (
		<div
			// className={classes.icon}
			// className="fdb-icon"
			ref={(node) => {
				if (!node || ref.current) {
					return;
				}

				ref.current = node;

				const div = document.createElement('div');
				div.classList.add('fdb-icon');
				if (color) {
					div.style.color = color;
				}

				setIcon(div, id);
				appendOrReplaceFirstChild(node, div);
			}}
		/>
	);
}
