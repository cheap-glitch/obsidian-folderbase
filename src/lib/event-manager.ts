import type { TFile } from 'obsidian';

type CallbackPayload = Partial<Record<string, TFile | string | number | undefined>>;
type EventCallback = (payload?: CallbackPayload) => void;
type FolderBaseEvent =
	| 'file-created' //
	| 'file-renamed'
	| 'folder-renamed'
	| 'file-removed'
	| 'folder-removed'
	| 'file-frontmatter-updated';

export class EventManager {
	private static instance: EventManager;
	private listeners: Record<FolderBaseEvent, EventCallback[]>;

	private constructor() {
		this.listeners = {} as Record<FolderBaseEvent, EventCallback[]>;
	}

	// Ensure only one instance is ever created
	public static getInstance(): EventManager {
		if (!EventManager.instance) {
			EventManager.instance = new EventManager();
		}

		return EventManager.instance;
	}

	public on(event: FolderBaseEvent, callback: EventCallback): void {
		if (!this.listeners[event]) {
			this.listeners[event] = [];
		}

		this.listeners[event].push(callback);
	}

	public off(event: FolderBaseEvent, target: EventCallback): void {
		if (!this.listeners[event]) {
			return;
		}

		this.listeners[event] = this.listeners[event].filter((callback) => callback !== target);
	}

	public emit(event: FolderBaseEvent, payload?: CallbackPayload): void {
		for (const callback of this.listeners[event] ?? []) {
			callback(payload);
		}
	}
}
