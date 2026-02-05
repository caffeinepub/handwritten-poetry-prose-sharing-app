/**
 * SEO utility functions for updating document metadata dynamically
 */

/**
 * Updates the document title
 */
export function setDocumentTitle(title: string) {
  document.title = title;
}

/**
 * Updates or creates the meta description tag
 */
export function setMetaDescription(description: string) {
  let metaDescription = document.querySelector('meta[name="description"]');
  
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }
  
  metaDescription.setAttribute('content', description);
}

/**
 * Sets both title and description in one call
 */
export function setSEO(title: string, description: string) {
  setDocumentTitle(title);
  setMetaDescription(description);
}
