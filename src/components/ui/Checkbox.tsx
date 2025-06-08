import { clsx } from 'clsx';

import './Checkbox.css';

export function Checkbox({
	className,
	label,
	checked,
	onChange,
}: {
	className?: string;
	label?: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}) {
	return (
		<label className={clsx('fdb-checkbox', className)}>
			<span className="fdb-input-label">{label}</span>
			<input
				type="checkbox"
				checked={checked}
				onChange={(event) => {
					onChange(event.target.checked);
				}}
			/>
		</label>
	);
}
