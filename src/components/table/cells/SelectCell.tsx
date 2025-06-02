import { clsx } from 'clsx';

import './SelectCell.css';

export function SelectCell({
	value,
	options,
	onBlur,
	onChange,
}: {
	value: string;
	options: string[];
	onBlur: VoidFunction;
	onChange: (value: string | null) => void;
}) {
	// TODO: Use the `<Select/>` component here?
	return (
		<select
			className={clsx(
				'fdb-input-unstyled',
				'fdb-cell-select',
				(value === 'null' || value === '') && 'fdb-null-value',
			)}
			value={value}
			onBlur={onBlur}
			onChange={(event) => {
				onChange(event.target.value === 'null' ? null : event.target.value);
			}}
		>
			{options.map((optionValue) => (
				<option
					key={optionValue}
					value={optionValue}
				>
					{optionValue === 'null' ? '<none>' : optionValue === '' ? '<empty>' : optionValue}
				</option>
			))}
		</select>
	);
}
