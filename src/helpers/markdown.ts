const MARKDOWN_TASK_MARKER = /- \[.\]/u;

export function setMarkdownTaskState(taskText: string, checked: boolean): string {
	return taskText.replace(MARKDOWN_TASK_MARKER, `- [${checked ? 'x' : ' '}]`);
}
