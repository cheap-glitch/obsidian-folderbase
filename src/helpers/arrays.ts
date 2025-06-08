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

// TODO: Write a unit test for this
export function moveItemToIndex<T>(input: T[], from: number, to: number): T[] {
	return input.flatMap((item, index) => {
		if (index === from) {
			return [];
		}
		if (index === to) {
			return to > from ? [item, input[from]] : [input[from], item];
		}

		return item;
	});
}

export function pushMissingItems<T>(input: T[], items: T[]): T[] {
	const result = [...input];
	for (const item of items) {
		if (!result.includes(item)) {
			result.push(item);
		}
	}

	return result;
}

export function unique<T>(array: T[]): T[] {
	return [...new Set(array)];
}
