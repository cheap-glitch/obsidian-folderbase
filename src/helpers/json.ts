import { toError } from '@/helpers/errors';

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
