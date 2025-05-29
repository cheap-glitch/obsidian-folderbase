export function InputCell({
	value,
	onBlur,
	onChange,
}: {
	value: string;
	onBlur: VoidFunction;
	onChange: (value: string) => void;
}) {
	return (
		<input
			type="text"
			autoComplete="off"
			value={value}
			onBlur={onBlur}
			onChange={(event) => {
				onChange(event.target.value);
			}}
		/>
	);
}
