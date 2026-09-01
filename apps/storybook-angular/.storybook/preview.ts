import '@slotted/tokens/styles.css';
import '@slotted/theme-default/styles.css';

import './preview.css';

import { componentWrapperDecorator } from '@storybook/angular-vite';
import type { Preview } from '@storybook/angular-vite';
import {
  GLOBAL_TYPES,
  INITIAL_GLOBALS,
  resolveWorkbenchGlobals,
} from '@slotted/storybook-workbench';
import '@slotted/storybook-workbench/styles.css';

import { SlottedDocsContainer } from './docs-container';
import { applyRootDirection, applyRootScheme, getPreviewStyle, normalizeScheme } from './theme';

const preview: Preview = {
  initialGlobals: INITIAL_GLOBALS,
  globalTypes: GLOBAL_TYPES,
  decorators: [
    componentWrapperDecorator(
      (story) =>
        `<div class="slotted-workbench-preview" [class.slotted-workbench-preview--embedded]="slottedEmbedded" [attr.data-slotted-theme]="slottedTheme" [attr.data-slotted-scheme]="slottedScheme" [attr.data-slotted-density]="slottedDensity" [attr.dir]="slottedDirection" [style.background]="slottedBackground" [style.color]="slottedColor" [style.color-scheme]="slottedColorScheme">${story}</div>`,
      (context) => {
        const values = resolveWorkbenchGlobals(context?.globals);
        const scheme = normalizeScheme(values.scheme);
        const previewStyle = getPreviewStyle(scheme);
        applyRootScheme(document.documentElement, scheme);
        applyRootDirection(document.documentElement, values.direction);

        return {
          slottedBackground: previewStyle.background,
          slottedColor: previewStyle.color,
          slottedColorScheme: previewStyle.colorScheme,
          slottedDensity: values.density,
          slottedDirection: values.direction,
          slottedEmbedded: context?.viewMode === 'docs',
          slottedScheme: scheme,
          slottedTheme: values.theme,
        };
      },
    ),
  ],
  parameters: {
    a11y: { test: 'todo' },
    backgrounds: { disable: true },
    controls: { expanded: true },
    docs: { container: SlottedDocsContainer, source: { state: 'none' }, toc: true },
    layout: 'fullscreen',
    options: {
      storySort: {
        order: [
          'Components',
          [
            'Button family',
            ['Overview', 'Button', 'ButtonLink', 'IconButton', 'ToggleButton', 'ButtonGroup'],
          ],
        ],
      },
    },
  },
};
export default preview;
