import { useEffect, useMemo, useState } from 'react';

import { useUpdateFileFrontmatter } from '@/hooks/use-update-file-frontmatter';
import { InputCell } from './InputCell';
import { SelectCell } from './SelectCell';

import type { Column, Getter, Row, Table } from '@tanstack/react-table';
import type { FormattedFrontMatterValue } from '@/types/frontmatter';
import type { CellInputType, ColumnData } from '@/types/table';

export function EditableCell({
	inputType,
	getValue,
	row,
	column: { id: columnId, getFacetedUniqueValues },
	table,
}: {
	inputType: CellInputType;
	getValue: Getter<FormattedFrontMatterValue | null>;
	row: Row<ColumnData>;
	column: Column<ColumnData>;
	table: Table<ColumnData>;
}) {
	const initialValue = getValue();
	const [value, setValue] = useState<string | null>(() => String(initialValue ?? ''));

	// Keep the `initialValue` in sync with the internal cell state in case it's changed externally
	useEffect(() => {
		setValue(String(initialValue ?? ''));
	}, [initialValue]);

	const { setFileFrontmatterProperty } = useUpdateFileFrontmatter();

	function updateCellData() {
		table.options.meta?.updateData(row.index, columnId, value);
		void setFileFrontmatterProperty(row.original.file.path, columnId, value);
	}

	const options = useMemo(
		() => [...getFacetedUniqueValues().keys()].map((optionValue) => String(optionValue)),
		[getFacetedUniqueValues],
	);

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
