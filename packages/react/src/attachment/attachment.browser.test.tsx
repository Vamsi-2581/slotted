import { render } from '@testing-library/react';
import { page } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';

import {
  Attachment,
  AttachmentBody,
  AttachmentDetail,
  AttachmentGroup,
  AttachmentPreview,
  AttachmentTrigger,
} from './index';

const PHOTO =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%2384cc16'/%3E%3C/svg%3E";

describe('the stretched attachment trigger', () => {
  it('keeps the preview, detail and filename inside the target while pressed', async () => {
    const onClick = vi.fn();
    render(
      <AttachmentGroup aria-label="Attachments" layout="list">
        <Attachment
          file={{ name: 'photo.png', type: 'image/png', size: 1000 }}
          orientation="vertical"
        >
          <AttachmentPreview src={PHOTO} />
          <AttachmentBody>
            <AttachmentTrigger onClick={onClick} />
            <AttachmentDetail>Photo attached</AttachmentDetail>
          </AttachmentBody>
        </Attachment>
      </AttachmentGroup>,
    );

    const trigger = document.querySelector<HTMLElement>('[data-part="trigger"]')!;
    expect(getComputedStyle(trigger).position).toBe('static');
    const points = [
      document.querySelector<HTMLElement>('[data-part="preview"]')!,
      document.querySelector<HTMLElement>('[data-part="detail"]')!,
      document.querySelector<HTMLElement>('[data-part="filename"]')!,
    ].map((element) => {
      const rect = element.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    });

    for (const [index, point] of points.entries()) {
      await page.mouse.move(point.x, point.y);
      expect(document.elementFromPoint(point.x, point.y)).toBe(trigger);

      await page.mouse.down();
      expect(document.elementFromPoint(point.x, point.y)).toBe(trigger);
      await page.mouse.up();

      expect(onClick).toHaveBeenCalledTimes(index + 1);
    }
  });
});
