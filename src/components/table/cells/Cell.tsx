import { Link } from '@/components/ui/Link';

import type { FormattedFrontMatterValue } from '@/types/table';

import './Cell.css';

export function Cell({
	value,
	onFileLinkClick,
}: {
	value: FormattedFrontMatterValue;
	onFileLinkClick: (filePath: string) => void;
}) {
	// Array (e.g. tags)
	if (Array.isArray(value)) {
		return (
			<ul className="fdb-cell-list">
				{value.map((tag) => (
					<li key={typeof tag === 'string' ? tag : tag.href}>
						{typeof tag === 'string' ? (
							tag
						) : (
							<Link
								href={tag.href}
								onClick={onFileLinkClick}
							>
								{tag.anchor}
							</Link>
						)}
					</li>
				))}
			</ul>
		);
	}

	// Link to another file
	if (value && typeof value === 'object' && 'href' in value) {
		return (
			<Link
				href={value.href}
				onClick={onFileLinkClick}
			>
				{value.anchor}
			</Link>
		);
	}

	return <>{value}</>;
}
