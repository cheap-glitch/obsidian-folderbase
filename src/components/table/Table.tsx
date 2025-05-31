import {
	flexRender,
	getCoreRowModel,
	getFacetedUniqueValues,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { useEffect, useRef, useState } from 'react';

import { TableHeader } from '@/components/table/TableHeader';

import { isInFolder, openFileInNewTab } from '@/helpers/files';
import { isSameSet } from '@/helpers/sets';
import { useApp } from '@/hooks/use-app';
import { buildColumns } from '@/lib/columns';
import { EventManager } from '@/lib/event-manager';
import { getFormattedFileFrontMatter, updateFileFrontMatter as updateFileFrontMatter_ } from '@/lib/frontmatter';
import { __CUSTOM__STATUS_EMOJIS, __custom__sortTags, sortEnum, sortFileLink } from '@/lib/sorting';

import type { Row, SortingState } from '@tanstack/react-table';
import type { TFile } from 'obsidian';
import type { FileData } from '@/lib/files-data';
import type { FormattedFrontMatterValue, FrontMatterValue } from '@/types/frontmatter';
import type { ColumnData } from '@/types/table';

// TODO: import classes from './Table.module.css';
import './Table.css';

export function Table({
	data: initialData,
	keys: initialKeys,
	folderPath,
}: {
	keys: Set<string>;
	data: FileData[];
	folderPath: string;
}) {
	const app = useApp();
	const ignoredFilePathEvents = useRef<Set<string>>(new Set<string>());

	function skipNextFileUpdateEvent(filePath: string) {
		ignoredFilePathEvents.current.add(filePath);
	}

	async function updateFileFrontMatter(filePath: string, key: string, value: FrontMatterValue): Promise<void> {
		skipNextFileUpdateEvent(filePath);

		try {
			await updateFileFrontMatter_(app, filePath, (frontmatter) => {
				frontmatter[key] = value;
			});
		} catch (error) {
			console.error(error); // TODO: Show error in alert
		}
	}

	const [keys, setKeys] = useState(() => new Set(initialKeys));
	const [data, setData] = useState(() => {
		return initialData.map(({ path, basename, frontmatter }) => ({
			file: {
				path: path,
				basename: basename,
			},
			frontmatter,
		}));
	});
	const [columns, setColumns] = useState(() =>
		buildColumns({
			keys: initialKeys,
			updateFileFrontMatter,
			onFileLinkClick: (filePath) => {
				openFileInNewTab(app, filePath);
			},
		}),
	);

	const [sorting, setSorting] = useState<SortingState>(() => {
		const state: SortingState = [];

		// __CUSTOM__: Set the inital sorted state
		if (keys.has('Statut')) {
			state.push({
				id: 'Statut',
				desc: false,
			});
		}
		if (keys.has('tags')) {
			state.push({
				id: 'tags',
				desc: false,
			});
		}

		return state;
	});

	const table = useReactTable<ColumnData>({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		sortingFns: {
			sortFileLink,
			__custom__sortTags,
			__custom__sortStatus: (rowA: Row<ColumnData>, rowB: Row<ColumnData>, columnId: string) => {
				return sortEnum(__CUSTOM__STATUS_EMOJIS, rowA, rowB, columnId);
			},
		},
		state: {
			sorting,
		},
		onSortingChange: setSorting,
		enableSortingRemoval: false,
		meta: {
			updateData: (rowIndex: number, columnId: string, value: FormattedFrontMatterValue) => {
				// TODO: Skip page index reset until after next rerender: skipAutoResetPageIndex();
				setData((old) =>
					old.map((row, index) => {
						if (index === rowIndex) {
							return {
								...old[rowIndex],
								[columnId]: value,
							};
						}

						return row;
					}),
				);
			},
		},
	});

	async function updateRowFileLink({ file }: { file?: TFile } = {}) {
		// console.log('Detected file renamed', file);

		if (!file || !isInFolder(file, folderPath)) {
			// console.log('File was not in folder, ignoring');

			return;
		}

		setData((oldData) => {
			return oldData.map((fileData) => {
				if (fileData.file.path !== file.path) {
					return fileData;
				}

				return {
					file: {
						path: file.path,
						basename: file.basename,
					},
					frontmatter: fileData.frontmatter,
				};
			});
		});
	}

	async function updateOrInsertRowData({ file }: { file?: TFile } = {}) {
		// console.log('Detected file updated or created', file);

		if (!file || !isInFolder(file, folderPath)) {
			// console.log('File was not in folder, ignoring');

			return;
		}

		if (ignoredFilePathEvents.current.has(file.path)) {
			// console.log('File was edited directly in the table, ignoring');

			ignoredFilePathEvents.current.delete(file.path);

			return;
		}

		try {
			const updatedKeys = new Set(keys);
			const updatedColumnData: ColumnData = {
				file: {
					path: file.path,
					basename: file.basename,
				},
				frontmatter: await getFormattedFileFrontMatter(app, file, folderPath, updatedKeys),
			};

			setData((oldData) => {
				if (oldData.some((fileData) => fileData.file.path === file.path)) {
					// Update the row
					return oldData.map((fileData) => (fileData.file.path === file.path ? updatedColumnData : fileData));
				}

				// Insert a new row
				return [...oldData, updatedColumnData];
			});

			// Update column headers if needed
			if (!isSameSet(keys, updatedKeys)) {
				setKeys(updatedKeys);
				setColumns(
					buildColumns({
						keys: updatedKeys,
						updateFileFrontMatter,
						onFileLinkClick: (filePath) => {
							openFileInNewTab(app, filePath);
						},
					}),
				);
			}
		} catch (error) {
			console.error(error); // TODO: Display in alert?
		}
	}

	async function removeRow({ file }: { file?: TFile } = {}) {
		if (file) {
			setData((oldData) => oldData.filter((fileData) => fileData.file.path !== file.path));
		}
	}

	// TODO: Add support for folders
	// biome-ignore lint/correctness/useExhaustiveDependencies: Only run this hook once when component is mounted
	useEffect(() => {
		EventManager.getInstance().on('file-renamed', updateRowFileLink);
		EventManager.getInstance().on('file-removed', removeRow);
		EventManager.getInstance().on('file-frontmatter-updated', updateOrInsertRowData);

		return () => {
			EventManager.getInstance().on('file-renamed', updateRowFileLink);
			EventManager.getInstance().on('file-removed', removeRow);
			EventManager.getInstance().off('file-frontmatter-updated', updateOrInsertRowData);
		};
	}, []);

	return (
		<table className="fdb-table">
			<TableHeader table={table} />
			<tbody>
				{table.getRowModel().rows.map((row) => (
					<tr key={row.id}>
						{row.getVisibleCells().map((cell) => (
							<td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
}
