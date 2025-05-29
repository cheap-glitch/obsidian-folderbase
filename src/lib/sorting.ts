import type { Row } from '@tanstack/react-table';
import type { ColumnData, FileLink } from '@/types/table';

const TEXT_COLLATOR = new Intl.Collator();

export function sortFileLink(rowA: Row<ColumnData>, rowB: Row<ColumnData>, columnId: string): number {
	const linkA = rowA.getValue<FileLink | null>(columnId);
	const linkB = rowB.getValue<FileLink | null>(columnId);
	if (!linkA && !linkB) {
		return 0;
	}
	if (!linkA) {
		return 1;
	}
	if (!linkB) {
		return -1;
	}

	return TEXT_COLLATOR.compare(linkA.anchor, linkB.anchor);
}

export function sortEnum(
	enumArray: Array<string | undefined>,
	rowA: Row<ColumnData>,
	rowB: Row<ColumnData>,
	columnId: string,
): number {
	const indexA = getEnumIndex(enumArray, rowA.getValue<string | null>(columnId));
	const indexB = getEnumIndex(enumArray, rowB.getValue<string | null>(columnId));

	if (indexA === -1 && indexB === -1) {
		return 0;
	}
	if (indexA === -1) {
		return 1;
	}
	if (indexB === -1) {
		return -1;
	}

	return indexA - indexB;
}

function getEnumIndex(enumArray: Array<string | undefined>, value: string | null): number {
	const index = enumArray.indexOf(value ?? undefined);
	if (index === -1) {
		return enumArray.indexOf(undefined);
	}

	return index;
}

export const __CUSTOM__STATUS_EMOJIS = ['📖', '📌', '✍️', undefined, '✅'];

export function __custom__sortTags(rowA: Row<ColumnData>, rowB: Row<ColumnData>, columnId: string): number {
	const tagsA = rowA.getValue<string[] | null>(columnId) ?? [];
	const tagsB = rowB.getValue<string[] | null>(columnId) ?? [];

	const scoreA = tagsA.includes('🥇') ? 2 : tagsA.includes('🔥') ? 1 : 0;
	const scoreB = tagsB.includes('🥇') ? 2 : tagsB.includes('🔥') ? 1 : 0;

	return scoreB - scoreA;
}
