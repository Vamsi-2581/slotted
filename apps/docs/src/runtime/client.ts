import type { Framework } from './frameworks';

type Runtime = { mount: (element: HTMLElement, id: string) => Promise<void> };

const runtimes: Record<Framework, () => Promise<Runtime>> = {
  react: () => import('./react.client'),
};

function isFramework(value: string | undefined): value is Framework {
  return value !== undefined && value in runtimes;
}

async function mount(element: HTMLElement): Promise<void> {
  const { example, exampleFramework } = element.dataset;
  if (!example || !isFramework(exampleFramework)) return;
  const runtime = await runtimes[exampleFramework]();
  await runtime.mount(element, example);
  element.dataset['exampleMounted'] = '';
}

/**
 * A preview is mounted when it comes within one viewport of being seen: the
 * build already drew it, so mounting only adds behavior, and a page of twenty
 * examples loads the runtime of the ones a reader reaches.
 */
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      void mount(entry.target as HTMLElement);
    }
  },
  { rootMargin: '100% 0px' },
);

for (const element of document.querySelectorAll<HTMLElement>('[data-example]')) {
  observer.observe(element);
}
