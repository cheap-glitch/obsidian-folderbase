import { z } from 'zod/v4';

import { FDB_DEFAULT_VIEW_MODE } from '@/lib/constants';
import { CONTAINER_TYPES, FOLDERBASE_VIEW_MODES, KANBAN_COLUMN_SORTING_MODES } from '@/types/settings';

export const FolderbaseViewSettingsSchema = z.object({
	mode: z.enum(FOLDERBASE_VIEW_MODES).optional().default(FDB_DEFAULT_VIEW_MODE),
	folder: z.string().optional(), // The default value for this prop is computed in each view instance
	kanban: z
		.object({
			columnsKey: z.string().optional().default(''), // Prevent this property from being undefined in the type, but check for its presence at runtime
			columnsOrder: z.array(z.string()).optional().default([]), // The order of the columns (left-to-right)
			columnsOrdering: z
				.record(
					z.string(),
					// The ordering scheme of each column: either a mode (for automatic sorting), or a list of card IDs (when manually ordered)
					z.union([z.enum(KANBAN_COLUMN_SORTING_MODES), z.array(z.string())]),
				)
				.optional()
				.default({}),
			openCardFilesInNew: z.enum(CONTAINER_TYPES).optional().default('tab'),
			showCardTitles: z.boolean().optional().default(false),
			showCardFrontmatter: z.boolean().optional().default(true),
		})
		.optional()
		.prefault({}),
});

export type FolderbaseViewSettings = z.infer<typeof FolderbaseViewSettingsSchema>;
export type ColumnsOrdering = FolderbaseViewSettings['kanban']['columnsOrdering'];

export type PartialFolderbaseViewSettings = z.input<typeof FolderbaseViewSettingsSchema>;
