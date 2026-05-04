/**
 * parseFrontmatter — extract title, category, and body from a markdown string.
 *
 * Expected input format:
 *   ---
 *   title: My Prompt Title
 *   category: Coding
 *   ---
 *   The prompt body text goes here.
 *
 * Returns { title, category, body } or null if the frontmatter block is missing/malformed.
 * Whitespace around values is trimmed. Body is the text after the closing --- delimiter.
 */
function parseFrontmatter(text) {
  if (typeof text !== 'string') return null;

  // Match opening ---, any content, closing ---, then body
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return null;

  const frontmatterBlock = match[1];
  const body = match[2].trim();

  // Extract title and category from frontmatter lines
  const titleMatch = frontmatterBlock.match(/^title:\s*(.+)$/m);
  const categoryMatch = frontmatterBlock.match(/^category:\s*(.+)$/m);

  const title = titleMatch ? titleMatch[1].trim() : null;
  const category = categoryMatch ? categoryMatch[1].trim() : null;

  // Both title and category are required for a valid prompt file
  if (!title || !category) return null;

  return { title, category, body };
}
