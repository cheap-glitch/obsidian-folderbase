import { useEffect, useMemo, useState } from 'react';

import { InputCell } from './InputCell';
import { SelectCell } from './SelectCell';

import type { Column, Getter, Row, Table } from '@tanstack/react-table';
import type { FormattedFrontMatterValue, FrontMatterValue } from '@/types/frontmatter';
import type { CellInputType, ColumnData } from '@/types/table';

export function EditableCell({
	inputType,
	getValue,
	row,
	column: { id: columnId, getFacetedUniqueValues },
	table,
	updateFileFrontmatter,
}: {
	inputType: CellInputType;
	getValue: Getter<FormattedFrontMatterValue | null>;
	row: Row<ColumnData>;
	column: Column<ColumnData>;
	table: Table<ColumnData>;
	updateFileFrontmatter: (filePath: string, key: string, value: FrontMatterValue) => Promise<void>;
}) {
	const initialValue = getValue();
	const [value, setValue] = useState<string | null>(() => String(initialValue ?? ''));
	const options = useMemo(
		() => [...getFacetedUniqueValues().keys()].map((optionValue) => String(optionValue)),
		[getFacetedUniqueValues],
	);

	// Keep the `initialValue` in sync with the internal cell state in case it's changed externally
	useEffect(() => {
		setValue(String(initialValue ?? ''));
	}, [initialValue]);

	function updateCellData() {
		void updateFileFrontmatter(row.original.file.path, columnId, value);
		table.options.meta?.updateData(row.index, columnId, value);
	}

	switch (inputType) {
		case 'text': {
			return (
				<InputCell
					value={value ?? ''}
					onBlur={updateCellData}
					// TODO: parse the value depending on the input type?
					onChange={setValue}
				/>
			);
		}

		case 'select': {
			return (
				<SelectCell
					value={String(value)}
					options={options}
					onBlur={updateCellData}
					onChange={setValue}
				/>
			);
		}
	}
}
