type HTMLDOMOptions = {
  text?: string;
  attributes?: {
    [key: string]: string;
  };
  children?: string[];
};

/**
 * Handle create content element
 * @param tag
 * @param options
 * @returns {string}
 */
function handleCreateElement(
  tag: keyof HTMLElementTagNameMap | string,
  options: HTMLDOMOptions = {},
): string {
  const { text = '', attributes, children } = options;
  const attributesFormatted: string[] = [];
  if (attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      attributesFormatted.push(`${key}="${value}"`);
    });
  }

  return `<${tag} ${attributesFormatted.join(' ')}>${text} ${
    children ? children.join('') : ''
  }</${tag}>`;
}

export default handleCreateElement;
