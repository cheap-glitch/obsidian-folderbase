import { toError } from './errors';

import type { JsonObject, JsonValue } from 'type-fest';

export function safeParseJsonObject(rawJson: string): JsonObject | Error {
	try {
		const parsedJson = JSON.parse(rawJson) as JsonValue;
		if (parsedJson === null || typeof parsedJson !== 'object' || Array.isArray(parsedJson)) {
			return new Error('Parsed JSON is not an object');
		}

		return parsedJson;
	} catch (error) {
		return toError(error);
	}
}

export function capitalize(name: string): string {
	return name.slice(0, 1).toUpperCase() + name.slice(1);
}
