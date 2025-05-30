export function forEveryAncestorElement(
	element: Element,
	callback: (currentAncestor: Element) => boolean | undefined,
): void {
	let parent = element.parentElement;
	while (parent) {
		if (callback(parent) === false) {
			return;
		}

		parent = parent.parentElement;
	}
}

export function getElementChildIndex(element: Element): number {
	const parent = element.parentElement;
	if (!parent) {
		return -1;
	}

	return Array.prototype.indexOf.call(parent.children, element);
}

export function appendOrReplaceFirstChild(container: HTMLElement, child: HTMLElement): void {
	if (!container.firstChild) {
		container.appendChild(child);
	} else if (container.firstChild !== child) {
		container.replaceChild(child, container.firstChild);
	}
}

export function removeAllChildren(element: HTMLElement): void {
	while (element.firstChild) {
		element.removeChild(element.firstChild);
	}
}
