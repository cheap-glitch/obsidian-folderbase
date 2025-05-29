export function appendOrReplaceFirstChild(container: HTMLElement, child: HTMLElement): void {
	if (!container.firstChild) {
		container.appendChild(child);
	} else if (container.firstChild !== child) {
		container.replaceChild(child, container.firstChild);
	}
}
