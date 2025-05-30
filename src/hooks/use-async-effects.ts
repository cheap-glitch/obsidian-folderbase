import { useEffect } from 'react';

export function useAsyncEffect(effect: (signal: AbortSignal) => Promise<void>, dependencies?: unknown[]): void {
	const controller = new AbortController();

	useEffect(() => {
		void effect(controller.signal);

		return () => {
			controller.abort();
		};
		// biome-ignore lint/correctness/useExhaustiveDependencies: `dependencies` is typed as an Array
	}, dependencies);
}
