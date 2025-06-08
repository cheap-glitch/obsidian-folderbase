import { clsx } from 'clsx';

import './Select.css';

export function Select({
	className,
	label,
	value,
	options,
	onChange,
}: {
	className?: string;
	label?: string;
	value: string;
	options: string[];
	onChange: (value: string) => void;
}) {
	return (
		<label className={clsx('fdb-select', className)}>
			<span className="fdb-input-label">{label}</span>

			<select
				value={value}
				onChange={(event) => {
					onChange(event.target.value);
				}}
			>
				{options.map((option) => (
					<option
						key={option}
						value={option}
					>
						{option}
					</option>
				))}
			</select>
		</label>
	);
}
