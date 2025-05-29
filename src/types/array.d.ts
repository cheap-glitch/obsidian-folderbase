// Workaround for https://github.com/microsoft/TypeScript/issues/17002
declare global {
	interface ArrayConstructor {
		// biome-ignore lint/suspicious/noExplicitAny: No choice but to use `any`
		isArray(arg: any): arg is readonly any[];
	}
}

export {};
