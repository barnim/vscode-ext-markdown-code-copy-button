'use strict';

(function () {
	const BUTTON_CLASS = 'vscode-markdown-copy-button';
	const PRE_CLASS = 'vscode-markdown-copy-pre';
	const COPIED_ATTR = 'data-copied';
	const RESET_TIMEOUT = 2000;
	const buttonTimers = new WeakMap();
	console.log('[markdown-code-copy-button] preview script booting');

	const copySvg = `<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M3.75 1.5h6.5c.966 0 1.75.784 1.75 1.75v1h-1.5v-1a.25.25 0 0 0-.25-.25h-6.5a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h1v1.5h-1a1.75 1.75 0 0 1-1.75-1.75v-8.5c0-.966.784-1.75 1.75-1.75Zm3 3h6.5c.966 0 1.75.784 1.75 1.75v6.5A1.75 1.75 0 0 1 13.25 14.5h-6.5A1.75 1.75 0 0 1 5 12.75v-6.5C5 5.284 5.784 4.5 6.75 4.5Zm-.25 8.25c0 .138.112.25.25.25h6.5a.25.25 0 0 0 .25-.25v-6.5a.25.25 0 0 0-.25-.25h-6.5a.25.25 0 0 0-.25.25v6.5Z"></path></svg>`;
	const checkSvg = `<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M13.78 4.22a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 1.06-1.06L7 9.69l5.47-5.47a.75.75 0 0 1 1.06 0Z"></path></svg>`;

	const style = document.createElement('style');
	style.textContent = `
		.${PRE_CLASS} {
			position: relative;
		}

		.${BUTTON_CLASS} {
			position: absolute;
			top: 0.4rem;
			right: 0.4rem;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			border-radius: 0.35rem;
			border: 1px solid var(--vscode-editorWidget-border, rgba(255,255,255,.2));
			background-color: var(--vscode-editorWidget-background, rgba(0,0,0,.6));
			color: var(--vscode-editor-foreground, #c9d1d9);
			padding: 0.25rem;
			cursor: pointer;
			opacity: 0;
			transform: translateY(-0.25rem);
			transition: opacity 120ms ease, transform 120ms ease, background-color 120ms ease, color 120ms ease;
		}

		.${PRE_CLASS}:hover .${BUTTON_CLASS},
		.${BUTTON_CLASS}:focus-visible {
			opacity: 1;
			transform: translateY(0);
		}

		.${BUTTON_CLASS}:hover {
			background-color: var(--vscode-editorWidget-background, rgba(255,255,255,.05));
		}

		.${BUTTON_CLASS}[${COPIED_ATTR}="true"] {
			color: var(--vscode-testing-iconPassed, #3fb950);
		}

		.${BUTTON_CLASS} svg {
			pointer-events: none;
		}

		.${BUTTON_CLASS} .icon-check {
			display: none;
		}

		.${BUTTON_CLASS}[${COPIED_ATTR}="true"] .icon-copy {
			display: none;
		}

		.${BUTTON_CLASS}[${COPIED_ATTR}="true"] .icon-check {
			display: inline;
		}

		.${BUTTON_CLASS} .sr-only {
			border: 0;
			clip: rect(0 0 0 0);
			height: 1px;
			margin: -1px;
			overflow: hidden;
			padding: 0;
			position: absolute;
			width: 1px;
		}
	`;
	document.head.appendChild(style);

	function ensureButtons() {
		const codeBlocks = document.querySelectorAll('pre > code');
		codeBlocks.forEach((codeBlock) => {
			const pre = codeBlock.parentElement;
			if (!pre) {
				return;
			}

			pre.classList.add(PRE_CLASS);

			if (pre.querySelector(`button.${BUTTON_CLASS}`)) {
				return;
			}

			const button = createButton(codeBlock);
			pre.appendChild(button);
		});
	}

	function createButton(codeBlock) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = BUTTON_CLASS;
		button.setAttribute('aria-label', 'Copy code block to clipboard');
		button.setAttribute(COPIED_ATTR, 'false');
		button.innerHTML = `
			<span class="sr-only">Copy</span>
			<span class="icon-copy">${copySvg}</span>
			<span class="icon-check">${checkSvg}</span>
		`;

		button.addEventListener('click', async (event) => {
			event.preventDefault();
			event.stopPropagation();
			const codeText = getCodeText(codeBlock);
			const copied = await copyToClipboard(codeText);
			if (copied) {
				markAsCopied(button);
			}
		});

		return button;
	}

	function getCodeText(codeBlock) {
		const clone = codeBlock.cloneNode(true);
		clone.querySelectorAll('span[data-highlighted-line]').forEach((node) => {
			node.replaceWith(...node.childNodes);
		});
		return clone.textContent || '';
	}

	async function copyToClipboard(text) {
		try {
			await navigator.clipboard.writeText(text);
			return true;
		} catch (error) {
			return legacyCopy(text);
		}
	}

	function legacyCopy(text) {
		const textArea = document.createElement('textarea');
		textArea.value = text;
		textArea.style.position = 'fixed';
		textArea.style.top = '-1000px';
		textArea.style.left = '-1000px';
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		let copied = false;
		try {
			copied = document.execCommand('copy');
		} catch (error) {
			copied = false;
		}
		textArea.remove();
		return copied;
	}

	function markAsCopied(button) {
		button.setAttribute(COPIED_ATTR, 'true');
		button.setAttribute('aria-label', 'Copied');
		const existingTimer = buttonTimers.get(button);
		if (existingTimer) {
			clearTimeout(existingTimer);
		}
		const timer = setTimeout(() => {
			button.setAttribute(COPIED_ATTR, 'false');
			button.setAttribute('aria-label', 'Copy code block to clipboard');
			buttonTimers.delete(button);
		}, RESET_TIMEOUT);
		buttonTimers.set(button, timer);
	}

	function boot() {
		if (!document.body) {
			requestAnimationFrame(boot);
			return;
		}
		ensureButtons();
		const observer = new MutationObserver(() => {
			requestAnimationFrame(ensureButtons);
		});
		observer.observe(document.body, { childList: true, subtree: true });
		document.addEventListener('vscode.markdown.updateContent', () => {
			requestAnimationFrame(ensureButtons);
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', boot);
	} else {
		boot();
	}
})();
