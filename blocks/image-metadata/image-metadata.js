/**
 * Image Metadata Block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const metadata = extractMetadata(block);
  const jsonLd = createJsonLd(metadata);
  appendJsonLdToHead(jsonLd);
  removeBlock(block);
}

/**
 * Extracts metadata from block children
 * @param {Element} block The block element
 * @returns {Object} The extracted metadata object
 */
function extractMetadata(block) {
  const metadata = {};

  [...block.children].forEach((child) => {
    const children = [...child.children];
    const attributeName = children[0].textContent.trim();
    const attributeValue = getAttributeValue(children[1], attributeName);

    if (attributeValue) {
      metadata[attributeName] = attributeValue;
    }
  });
  return metadata;
}

/**
 * Gets the attribute value based on the attribute name and element
 * @param {Element} element The element containing the value
 * @param {string} attributeName The name of the attribute
 * @returns {string} The attribute value
 */
function getAttributeValue(element, attributeName) {
  if (attributeName === 'contentUrl') {
    const imgElement = element.querySelector('img');
    if (imgElement && imgElement.src) {
      const url = new URL(imgElement.src);
      return url.origin + url.pathname;
    }
    return '';
  }

  if (attributeName === 'creator' || attributeName === 'copyrightHolder') {
    const children = [...element.children];
    return {
      "@type": children[0].textContent.trim(),
      "name": children[1].textContent.trim()
    }
  }
  return element.textContent.trim();
}

/**
 * Creates JSON-LD object with schema.org format
 * @param {Object} metadata The metadata object
 * @returns {Object} The JSON-LD object
 */
function createJsonLd(metadata) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    ...metadata
  };
}

/**
 * Creates and appends JSON-LD script tag to document head
 * @param {Object} jsonLd The JSON-LD object
 */
function appendJsonLdToHead(jsonLd) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(jsonLd, null, 2);
  document.head.appendChild(script);
}

/**
 * Removes the block element and its parent containers from the DOM
 * @param {Element} block The block element to remove
 */
function removeBlock(block) {
  const twoUp = block.parentElement.parentElement;
  twoUp.remove();
}