export function sortByMatchingOrder<ModelItem, InputItem>({
	model,
	input,
	matcher,
}: {
	model: ModelItem[];
	input: InputItem[];
	matcher?: (item: InputItem) => ModelItem;
}): InputItem[] {
	return input.toSorted((a, b) => {
		const indexA = model.indexOf((matcher?.(a) ?? a) as ModelItem);
		const indexB = model.indexOf((matcher?.(b) ?? b) as ModelItem);

		if (indexA === -1 && indexB === -1) {
			return 0;
		}
		if (indexA === -1) {
			return 1;
		}
		if (indexB === -1) {
			return -1;
		}

		return indexA - indexB;
	});
}

export function moveItemToIndex<T extends { id: string | number }>(input: T[], item: T, targetIndex: number): T[] {
	console.log('before:', input);

	const array = input.filter(({ id }) => id === item.id);
	array.splice(targetIndex, 0, item);

	console.log('after:', array);

	return array;
}
