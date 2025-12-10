# Markdown Code Copy Button

Adds a GitHub-like copy button to every fenced code block inside the VS Code Markdown preview.

## Features

- Hover any ```code``` block in the Markdown preview to reveal a copy button in the top-right corner.
- Copies the rendered code exactly as it appears, including multi-line selections and highlighted lines.
- Provides instant visual feedback (icon swap + accessible label) so you always know when the copy completed.
- Works with light and dark themes, following VS Code color tokens for seamless integration.

## Usage

1. Open a Markdown file.
2. Launch the built-in Markdown preview (`Markdown: Open Preview` command or `Ctrl+K V` or `Ctrl+Shift+V`).
3. Hover a code block and press the copy button to send its contents to your clipboard.

That's it—no extra configuration required.

## Known Issues

- When clipboard permissions are denied by the OS, the button falls back to the legacy `document.execCommand('copy')`. If the environment blocks both APIs the operation will fail silently.

## Development

- `npm install`
- `npm run watch` to keep the TypeScript entry point compiled (even though the feature currently lives in the preview script).
- Press `F5` in VS Code to launch an Extension Development Host and test the Markdown preview.

## Release Notes

### 0.0.1

- Added automatic copy buttons for Markdown preview code blocks with GitHub-inspired styling and clipboard handling.
