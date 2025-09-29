
let _cache = null;
const DEFAULT_URL = '/data/projects.json';

export async function loadProjects(url = DEFAULT_URL) {
  if (_cache) return _cache;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load projects: ${res.status}`);
  _cache = await res.json();
  return _cache;
}

export async function getProject(key, url = DEFAULT_URL) {
  const list = await loadProjects(url);
  return list.find(p => p.id === key || p.name === key || p.slug === key) || null;
}

// Handy filter by category
export async function listByCategory(category, url = DEFAULT_URL) {
  const list = await loadProjects(url);
  return list.filter(p => p.category === category);
}

export function renderProjectHTML(p) {
  if (!p) return `<div class="text-sm opacity-70">Project not found.</div>`;

  const tags = (p.tags || [])
    .map(t => `<span class="tag">${t}</span>`)
    .join(' ');

  const repo = p?.links?.repo ? `<a href="${p.links.repo}" class="link" target="_blank">Repo</a>` : '';
  const docs = p?.links?.docs ? `<a href="${p.links.docs}" class="link">Docs</a>` : '';
  const page = p?.links?.page ? `<a href="${p.links.page}" class="link">See project →</a>` : '';
  const links = [repo, docs, page].filter(Boolean).join(' • ');

  return `
    <div class="card project-card">
      ${p.hero ? `<img src="${p.hero}" alt="${p.name}" class="project-hero">` : ''}
      <h3>${p.name}</h3>
      <time class="date" datetime="${p.date}">${p.date}</time>
      <div class="tags">${tags}</div>
      <p>${p.summary || ''}</p>
      <div class="links">${links}</div>
      ${p.status ? `<div class="status">Status: ${p.status}</div>` : ''}
    </div>
  `;
}


// Optional web component for drop-in cards
class ProjectCard extends HTMLElement {
  static get observedAttributes() { return ['id', 'name', 'src']; }
  async connectedCallback() { await this.#render(); }
  async attributeChangedCallback() { await this.#render(); }
  async #render() {
    const key = this.getAttribute('id') || this.getAttribute('name');
    const src = this.getAttribute('src') || DEFAULT_URL;
    const p = key ? await getProject(key, src) : null;
    this.innerHTML = renderProjectHTML(p);
  }
}
customElements.define('project-card', ProjectCard);
