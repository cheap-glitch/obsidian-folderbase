import type { MouseEvent, ReactNode } from 'react';

export function Link({
	children,
	href,
	onClick,
}: {
	children: ReactNode;
	href: string;
	onClick: (filePath: string) => void;
}) {
	return (
		<a
			// biome-ignore lint/a11y/useSemanticElements: Avoid double lint error
			role="link"
			// biome-ignore lint/a11y/useValidAnchor: We have to "manually" implement opening the file when the lick is clicked
			onClick={() => {
				onClick(href);
			}}
			onMouseDown={(event: MouseEvent) => {
				// Middle click
				// TODO: Handle differently the left & middle clicks?
				if (event.button === 1) {
					onClick(href);
				}
			}}
		>
			{children}
		</a>
	);
}
