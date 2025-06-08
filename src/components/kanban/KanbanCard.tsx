import { clsx } from 'clsx';
import { Component, MarkdownRenderer } from 'obsidian';
import { useEffect, useRef } from 'react';

import { useViewSettings } from '@/contexts/view-settings-context';

import { IconButton } from '@/components/ui/IconButton';

import { getElementChildIndex, removeAllChildren } from '@/helpers/dom';
import { openFileInNewLeaf } from '@/helpers/files';
import { setMarkdownTaskState } from '@/helpers/markdown';
import { transformTextAtPosition } from '@/helpers/text';
import { useApp } from '@/hooks/use-app';
import { useAsyncEffect } from '@/hooks/use-async-effects';

import type { DraggableProvided } from '@hello-pangea/dnd';
import type { KanbanCardData } from '@/types/kanban';

import './KanbanCard.css';

export function KanbanCard({
	title,
	data,
	dndProps,
	isDragged = false,
}: KanbanCardData & { dndProps: DraggableProvided; isDragged?: boolean }) {
	const app = useApp();
	const {
		//
		showCardTitles,
		showCardFrontmatter,
		showCardContents,
		openCardFilesInNew,
	} = useViewSettings((settings) => settings.view);

	const markdownWrapper = useRef<HTMLDivElement | null>(null);

	// TODO: Extract this from the component?
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
			currentElement.parentElement !== markdownWrapper.current
		);

		if (taskIndex === -1) {
			return;
		}

		try {
			const file = app.vault.getFileByPath(data.filePath);
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
		markdownWrapper.current?.addEventListener('change', onTaskChecked);

		return () => {
			markdownWrapper.current?.removeEventListener('change', onTaskChecked);
		};
	}, []);

	const rendererComponent = useRef<Component | undefined>(undefined);
	if (!rendererComponent.current) {
		rendererComponent.current = new Component();
	}

	useAsyncEffect(
		async (signal): Promise<void> => {
			if (signal.aborted || !markdownWrapper.current || !rendererComponent.current) {
				return;
			}

			signal.addEventListener('abort', () => {
				rendererComponent.current?.unload();
				if (markdownWrapper.current) {
					removeAllChildren(markdownWrapper.current);
				}
			});

			removeAllChildren(markdownWrapper.current);
			await MarkdownRenderer.render(
				app,
				data.markdownContent,
				markdownWrapper.current,
				data.filePath,
				rendererComponent.current,
			);
		},
		[data.markdownContent],
	);

	return (
		<div
			ref={dndProps.innerRef}
			className={clsx('fdb-kanban-card', isDragged && 'is-dragged')}
			{...dndProps.draggableProps}
			{...dndProps.dragHandleProps}
		>
			<IconButton
				className="fdb-kanban-card-edit-button"
				iconId="pencil"
				onClick={() => {
					openFileInNewLeaf(app, data.filePath, openCardFilesInNew);
				}}
			/>
			<header className="fdb-kanban-card-header">
				{showCardTitles && <h5 className="fdb-kanban-card-title">{title}</h5>}
				{showCardFrontmatter && (
					<div className="cm-s-obsidian">
						{Object.entries(data.frontmatter).map(([key, value]) => {
							/*
							if (key === groupingKey) {
								return;
							}
							*/

							return (
								<span
									key={key}
									className="cm-inline-code fdb-kanban-card-frontmatter"
								>
									{String(value)}
								</span>
							);
						})}
					</div>
				)}
			</header>
			<div
				ref={markdownWrapper}
				className={clsx('cm-s-obsidian', 'fdb-kanban-card-contents', !showCardContents && 'fdb-hidden')}
			/>
		</div>
	);
}
