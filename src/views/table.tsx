import { ItemView, WorkspaceLeaf } from 'obsidian';
import { StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';

import { Table } from '@/components/Table';

import type { TableData } from '@/types';

export const TABLE_VIEW_ID = 'folderbase';

export class TableView extends ItemView {
	root?: Root;
	keys: Set<string>;
	data: TableData;

	constructor(leaf: WorkspaceLeaf, keys: Set<string>, data: TableData) {
		super(leaf);

		this.keys = keys;
		this.data = data;
	}

	getViewType() {
		return TABLE_VIEW_ID;
	}

	getDisplayText() {
		return 'Folderbase Table';
	}

	async onOpen() {
		this.root = createRoot(this.containerEl.children[1]);
		this.root.render(
			<StrictMode>
				<Table
					keys={this.keys}
					data={this.data}
				/>
			</StrictMode>
		);
	}

	async onClose() {
		this.root?.unmount();
	}
}
