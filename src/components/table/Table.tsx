import {
	flexRender,
	getCoreRowModel,
	getFacetedUniqueValues,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { useEffect, useRef, useState } from 'react';

import { TableHead } from '@/components/table/TableHead';

import { isInFolder } from '@/helpers/files';
import { isSameSet } from '@/helpers/sets';
import { useApp } from '@/hooks/use-app';
import { buildColumns } from '@/lib/columns';
import { processFileFrontMatter } from '@/lib/data';
import { EventManager } from '@/lib/event-manager';
import { __CUSTOM__STATUS_EMOJIS, __custom__sortTags, sortEnum, sortFileLink } from '@/lib/sorting';

import type { Row, SortingState } from '@tanstack/react-table';
import type { TFile } from 'obsidian';
import type { ColumnData, FileFrontMatter, FormattedFrontMatterValue, FrontMatterValue } from '@/types/table';

// import classes from './Table.module.css';

export function Table({
	keys: defaultKeys,
	data: defaultData,
	folderPath,
}: {
	keys: Set<string>;
	data: ColumnData[];
	folderPath: string;
}) {
	const app = useApp();
	const ignoredFilePathEvents = useRef<Set<string>>(new Set<string>());

	function skipNextFileUpdateEvent(filePath: string) {
		ignoredFilePathEvents.current.add(filePath);
	}

	function openFileInNewTab(path: string) {
		const leaf = app.workspace.getLeaf('tab');
		const file = app.vault.getFileByPath(path);

		if (file) {
			leaf?.openFile(file, { active: true });
		}
	}

	async function updateFileFrontmatter(filePath: string, key: string, value: FrontMatterValue): Promise<void> {
		try {
			const file = app.vault.getFileByPath(filePath);
			if (!file) {
				throw new Error(`Could not find file at "${filePath}"`);
			}

			skipNextFileUpdateEvent(filePath);
			await app.fileManager.processFrontMatter(file, (frontmatter: FileFrontMatter) => {
				frontmatter[key] = value;
			});
		} catch (error) {
			console.error(error); // TODO: Show error in alert
		}
	}

	const [keys, setKeys] = useState(() => new Set(defaultKeys));
	const [data, setData] = useState(() => [...defaultData]);
	const [columns, setColumns] = useState(() =>
		buildColumns({
			keys: defaultKeys,
			updateFileFrontmatter,
			onFileLinkClick: openFileInNewTab,
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
		console.log('Detected file renamed', file);

		if (!file || !isInFolder(file, folderPath)) {
			console.log('File was not in folder, ignoring');

			return;
		}

		setData((oldData) => {
			return oldData.map((fileData) => {
				if (fileData.filelink.href === file.path) {
					return {
						filelink: {
							href: file.path,
							anchor: file.basename,
						},
						frontmatter: fileData.frontmatter,
					};
				}
				return fileData;
			});
		});
	}

	async function updateOrInsertRowData({ file }: { file?: TFile } = {}) {
		console.log('Detected file updated or created', file);

		if (!file || !isInFolder(file, folderPath)) {
			console.log('File was not in folder, ignoring');

			return;
		}

		if (ignoredFilePathEvents.current.has(file.path)) {
			console.log('File was edited directly in the table, ignoring');

			ignoredFilePathEvents.current.delete(file.path);

			return;
		}

		try {
			const updatedKeys = new Set(keys);
			const updatedFileData = await processFileFrontMatter(app, updatedKeys, folderPath, file);

			setData((oldData) => {
				if (oldData.some((fileData) => fileData.filelink.href === file.path)) {
					// Update the row
					return oldData.map((fileData) =>
						fileData.filelink.href === file.path ? updatedFileData : fileData,
					);
				}

				// Insert a new row
				return [...oldData, updatedFileData];
			});

			if (!isSameSet(keys, updatedKeys)) {
				// Update column headers if needed
				setKeys(updatedKeys);
				setColumns(
					buildColumns({
						keys: updatedKeys,
						updateFileFrontmatter,
						onFileLinkClick: openFileInNewTab,
					}),
				);
			}
		} catch (error) {
			console.error(error); // TODO: Display in alert?
		}
	}

	async function removeRow({ file }: { file?: TFile } = {}) {
		if (file) {
			setData((oldData) => oldData.filter((fileData) => fileData.filelink.href !== file.path));
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
		<table
			// className={classes.table}
			className="fdb-table"
		>
			<TableHead table={table} />

			<tbody>
				{table.getRowModel().rows.map((row) => (
					<tr key={row.id}>
						{row.getVisibleCells().map((cell) => (
							<td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
						))}
					</tr>
				))}
			</tbody>

			{/* TODO: Fix this
				<button
					type="button"
					onClick={() => {
						rerender();
					}}
				>
					Rerender
				</button>
			*/}
		</table>
	);
}
