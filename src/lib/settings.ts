import { z } from 'zod/v4';

import { FDB_DEFAULT_VIEW_MODE } from '@/lib/constants';
import { CONTAINER_TYPES, FOLDERBASE_VIEW_MODES } from '@/types/settings';

export const FOLDERBASE_SETTINGS_VERSION = 1;

export const FolderbaseViewSettingsSchema = z.object({
	version: z.number(),
	settings: z.object({
		folder: z.string().optional(), // The default value for this prop is computed in each view instance
		mode: z.enum(FOLDERBASE_VIEW_MODES).optional().default(FDB_DEFAULT_VIEW_MODE),
		kanban: z.object({
			board: z
				.object({
					groupingKey: z.string().optional().default(''), // Prevent this property from being undefined in the type, but check for its presence at runtime
					columns: z
						.record(
							z.string(), // The settings are namespaced by grouping key
							z.object({
								order: z.array(z.string()).optional().default([]), // The order of the columns (left-to-right)
								cardsOrders: z // The order of cards inside each column
									.record(z.string(), z.array(z.string()))
									.optional()
									.default({}),
							}),
						)
						.optional()
						.prefault({}),
				})
				.optional()
				.prefault({}),
			view: z
				.object({
					showCardTitles: z.boolean().optional().default(true),
					showCardContents: z.boolean().optional().default(true),
					showCardFrontmatter: z.boolean().optional().default(false),
					openCardFilesInNew: z.enum(CONTAINER_TYPES).optional().default('split'),
				})
				.optional()
				.prefault({}),
		}),
	}),
});

export type FolderbaseFullSettings = z.infer<typeof FolderbaseViewSettingsSchema>;
export type FolderbaseSettings = FolderbaseFullSettings['settings'];
export type PartialFolderbaseSettings = z.input<typeof FolderbaseViewSettingsSchema>['settings'];

export type KanbanSettings = FolderbaseSettings['kanban'];
export type KanbanColumnsSettings = KanbanSettings['board']['columns'][string];
