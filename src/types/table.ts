import type { FormattedFrontMatterValue } from './frontmatter';

export interface ColumnData {
	file: {
		path: string;
		basename: string;
	};
	frontmatter: Record<string, FormattedFrontMatterValue>;
}

export type CellInputType = 'text' | 'select';
