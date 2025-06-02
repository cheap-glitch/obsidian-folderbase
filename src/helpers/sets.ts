export function getSetValueAtIndex<T>(set: Set<T>, index: number): T | undefined {
	return [...set.values()][index];
}

export function isSameSet<T>(setA: Set<T>, setB: Set<T>): boolean {
	return setA.symmetricDifference(setB).size === 0;
}
