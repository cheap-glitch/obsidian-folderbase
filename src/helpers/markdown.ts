import type { App, Pos, TFile } from 'obsidian';

export function removeFrontMatterFromFileContents(app: App, file: TFile, fileContents: string): string {
	const position = app.metadataCache.getFileCache(file)?.frontmatterPosition;
	if (!position) {
		return fileContents;
	}

	return replaceTextAtPosition(fileContents, position, '');
}

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

const MARKDOWN_TASK_MARKER = /- \[.\]/u;

export function setMarkdownTaskState(taskText: string, checked: boolean): string {
	return taskText.replace(MARKDOWN_TASK_MARKER, `- [${checked ? 'x' : ' '}]`);
}
