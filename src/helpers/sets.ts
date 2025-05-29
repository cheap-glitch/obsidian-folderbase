export function isSameSet<T>(setA: Set<T>, setB: Set<T>): boolean {
	return setA.symmetricDifference(setB).size === 0;
}
