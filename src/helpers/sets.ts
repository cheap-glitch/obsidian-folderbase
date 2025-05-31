export function getValueAtIndex<T>(set: Set<T>, index: number): T | undefined {
	for (const [valueIndex, value] of set.entries()) {
		if (valueIndex === index) {
			return value;
		}
	}

	return undefined;
}

export function isSameSet<T>(setA: Set<T>, setB: Set<T>): boolean {
	return setA.symmetricDifference(setB).size === 0;
}
