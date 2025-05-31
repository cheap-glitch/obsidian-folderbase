import type { Pos } from 'obsidian';

export function transformTextAtPosition(
	text: string,
	position: Pos,
	transformer: (original: string) => string,
): string {
	return replaceTextAtPosition(text, position, transformer(text.slice(position.start.offset, position.end.offset)));
}

export function replaceTextAtPosition(text: string, position: Pos, replacement: string): string {
	return text.slice(0, position.start.offset) + replacement + text.slice(position.end.offset);
}

export function capitalize(name: string): string {
	return name.slice(0, 1).toUpperCase() + name.slice(1);
}
