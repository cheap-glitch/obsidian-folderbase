import { Component, MarkdownRenderer } from 'obsidian';
import { useEffect, useRef } from 'react';

import { IconButton } from '@/components/ui/IconButton';

import { useSettingsStore } from '@/contexts/settings-context';
import { getElementChildIndex, removeAllChildren } from '@/helpers/dom';
import { setMarkdownTaskState } from '@/helpers/markdown';
import { transformTextAtPosition } from '@/helpers/text';
import { useApp } from '@/hooks/use-app';
import { useAsyncEffect } from '@/hooks/use-async-effects';

import type { KanbanCardData } from '@/types/kanban';

import './KanbanCard.css';

import { openFileInNewTab } from '@/helpers/files';

export function KanbanCard({ filePath, title, frontmatter, markdownContent }: KanbanCardData) {
	const app = useApp();
	const { showCardTitles, showCardFrontmatter } = useSettingsStore((settings) => settings.kanban);

	const contentWrapper = useRef<HTMLDivElement | null>(null);
	const rendererComponent = useRef<Component | undefined>(undefined);
	if (!rendererComponent.current) {
		rendererComponent.current = new Component();
	}

	// TODO: Extract this!
	async function onTaskChecked(event: Event): Promise<void> {
		const taskInput = event.target as HTMLInputElement;
		if (!taskInput.classList.contains('task-list-item-checkbox')) {
			return;
		}

		const taskListItem = taskInput.parentElement;
		if (!taskListItem) {
			return;
		}

		// Sync the task list item with its input state
		taskListItem.classList.toggle('is-checked', taskInput.checked);
		taskListItem.dataset.task = taskInput.checked ? 'x' : '';

		// Handle nested task lists
		let taskIndex = 0;
		let currentElement: Element | null = taskInput;
		do {
			if (!currentElement?.parentElement) {
				return;
			}

			// Get the index of the `<li>` element in the parent `<ul>`
			taskIndex += getElementChildIndex(currentElement.parentElement);

			if (currentElement.classList.contains('contains-task-list')) {
				taskIndex++; // Account for the nested `<ul>` element being in the same `<li>` as the parent task
			}

			// Jump to a potential `<ul>` ancestor corresponding to the level above in the textual task list
			currentElement = currentElement.parentElement.parentElement;
		} while (
			// Check that the ancestor we just jumped too is also a task list
			currentElement?.classList.contains('contains-task-list') &&
			currentElement.parentElement !== contentWrapper.current
		);

		if (taskIndex === -1) {
			return;
		}

		try {
			const file = app.vault.getFileByPath(filePath);
			if (!file) {
				return;
			}

			const fileListItems = app.metadataCache.getFileCache(file)?.listItems;
			const fileTask = fileListItems?.filter((item) => item.task !== undefined)?.[taskIndex];
			if (
				!fileTask ||
				(fileTask.task === ' ') === !taskInput.checked // The task is already in the same state as the corresponding input
			) {
				return;
			}

			await app.vault.process(file, (fileContents) => {
				return transformTextAtPosition(fileContents, fileTask.position, (taskText) => {
					return setMarkdownTaskState(taskText, taskInput.checked);
				});
			});
		} catch (error) {
			// TODO: Display this error somewhere
			console.error(error);
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: Only run hook once when component is mounted
	useEffect(() => {
		contentWrapper.current?.addEventListener('change', onTaskChecked);

		return () => {
			contentWrapper.current?.removeEventListener('change', onTaskChecked);
		};
	}, []);

	useAsyncEffect(async (signal: AbortSignal): Promise<void> => {
		if (signal.aborted || !contentWrapper.current || !rendererComponent.current) {
			return;
		}

		signal.addEventListener('abort', () => {
			rendererComponent.current?.unload();
			if (contentWrapper.current) {
				removeAllChildren(contentWrapper.current);
			}
		});

		await MarkdownRenderer.render(
			app,
			markdownContent,
			contentWrapper.current,
			filePath,
			rendererComponent.current,
		);
	});

	return (
		<div className="fdb-kanban-card">
			<header className="fdb-flex-row fdb-kanban-card-header">
				<div>
					{showCardTitles && <h5 className="fdb-kanban-card-title">{title}</h5>}
					{showCardFrontmatter && (
						<>
							{/* __CUSTOM__ */}
							{frontmatter.Créneau && (
								<h5 className="fdb-kanban-card-title">{String(frontmatter.Créneau)}</h5>
							)}
						</>
					)}
				</div>
				<div className="fdb-flex-spacer" />
				<IconButton
					className="fdb-kanban-card-edit-button"
					iconId="pencil"
					onClick={() => {
						openFileInNewTab(app, filePath);
					}}
				/>
			</header>
			<div
				ref={contentWrapper}
				className="fdb-kanban-card-contents"
			/>
		</div>
	);
}
