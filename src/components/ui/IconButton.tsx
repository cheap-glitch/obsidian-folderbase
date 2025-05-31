import { clsx } from 'clsx';

import { Icon } from '@/components/ui/Icon';

import type { ReactNode } from 'react';

import './IconButton.css';

export function IconButton({
	children,
	className,
	iconId,
	onClick,
}: {
	children?: ReactNode;
	className?: string;
	iconId: string;
	onClick: VoidFunction;
}) {
	return (
		<button
			className={clsx('fdb-input-unstyled', 'fdb-icon-button', className)}
			type="button"
			onClick={onClick}
		>
			<Icon id={iconId} /> {children}
		</button>
	);
}
