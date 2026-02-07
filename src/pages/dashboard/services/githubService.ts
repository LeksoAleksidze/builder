import type { LandingData } from '../hooks/useLocalStorage';
import { extractAssets, normalizeRawUrls, collectReferencedAssets } from './assetExtractor';

const REPO = 'LeksoAleksidze/builder';
const API_BASE = `https://api.github.com/repos/${REPO}`;

interface GitRef {
  ref: string;
  object: { sha: string; type: string };
}

interface GitCommit {
  sha: string;
  tree: { sha: string };
}

interface GitBlob {
  sha: string;
}

interface GitTree {
  sha: string;
}

interface TreeEntry {
  path: string;
  mode: '100644';
  type: 'blob';
  sha: string | null;
}

interface GitTreeFull {
  sha: string;
  tree: Array<{
    path: string;
    mode: string;
    type: string;
    sha: string;
  }>;
}

async function ghFetch<T>(
  url: string,
  token: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

async function getRef(branch: string, token: string): Promise<GitRef | null> {
  try {
    return await ghFetch<GitRef>(
      `${API_BASE}/git/refs/heads/${branch}`,
      token,
    );
  } catch {
    return null;
  }
}

async function createBranchFromMain(
  branch: string,
  token: string,
): Promise<GitRef> {
  const mainRef = await ghFetch<GitRef>(
    `${API_BASE}/git/refs/heads/main`,
    token,
  );
  return ghFetch<GitRef>(`${API_BASE}/git/refs`, token, {
    method: 'POST',
    body: JSON.stringify({
      ref: `refs/heads/${branch}`,
      sha: mainRef.object.sha,
    }),
  });
}

async function createBlob(
  content: string,
  encoding: 'utf-8' | 'base64',
  token: string,
): Promise<GitBlob> {
  return ghFetch<GitBlob>(`${API_BASE}/git/blobs`, token, {
    method: 'POST',
    body: JSON.stringify({ content, encoding }),
  });
}

async function createTree(
  baseTreeSha: string,
  entries: TreeEntry[],
  token: string,
): Promise<GitTree> {
  return ghFetch<GitTree>(`${API_BASE}/git/trees`, token, {
    method: 'POST',
    body: JSON.stringify({ base_tree: baseTreeSha, tree: entries }),
  });
}

async function createCommit(
  message: string,
  treeSha: string,
  parentSha: string,
  token: string,
): Promise<GitCommit> {
  return ghFetch<GitCommit>(`${API_BASE}/git/commits`, token, {
    method: 'POST',
    body: JSON.stringify({
      message,
      tree: treeSha,
      parents: [parentSha],
    }),
  });
}

async function updateRef(
  branch: string,
  sha: string,
  token: string,
): Promise<void> {
  await ghFetch<GitRef>(`${API_BASE}/git/refs/heads/${branch}`, token, {
    method: 'PATCH',
    body: JSON.stringify({ sha, force: true }),
  });
}

export async function loadFromGitHub(
  branchName: string,
  token: string,
): Promise<LandingData | null> {
  try {
    const res = await fetch(
      `${API_BASE}/contents/public/config.json?ref=${branchName}`,
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      },
    );
    if (res.status === 404) return null;
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`GitHub API error ${res.status}: ${body}`);
    }
    const json = (await res.json()) as { content: string };
    const binary = atob(json.content.replace(/\n/g, ''));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    return JSON.parse(decoded) as LandingData;
  } catch (err) {
    if (err instanceof Error && err.message.includes('404')) return null;
    throw err;
  }
}

export async function publishToGitHub(
  data: LandingData,
  branchName: string,
  token: string,
): Promise<void> {
  // 0. Normalize raw GitHub URLs back to relative assets/ paths
  const normalized = normalizeRawUrls(data);

  // 1. Extract assets from data
  const { cleanedData, assets } = extractAssets(normalized);

  // 2. Get or create branch
  let ref = await getRef(branchName, token);
  if (!ref) {
    ref = await createBranchFromMain(branchName, token);
  }

  const commitSha = ref.object.sha;

  // 3. Get current commit to find base tree
  const currentCommit = await ghFetch<GitCommit>(
    `${API_BASE}/git/commits/${commitSha}`,
    token,
  );

  // 4. Create blobs for all files
  const treeEntries: TreeEntry[] = [];

  // config.json blob
  const configBlob = await createBlob(
    JSON.stringify(cleanedData, null, 2),
    'utf-8',
    token,
  );
  treeEntries.push({
    path: 'public/config.json',
    mode: '100644',
    type: 'blob',
    sha: configBlob.sha,
  });

  // Asset blobs (stored under public/ for Vite build)
  for (const [filePath, base64Content] of assets) {
    const blob = await createBlob(base64Content, 'base64', token);
    treeEntries.push({
      path: `public/${filePath}`,
      mode: '100644',
      type: 'blob',
      sha: blob.sha,
    });
  }

  // 4.5. Delete unreferenced old assets + migrate away from root-level files
  const referencedPaths = collectReferencedAssets(cleanedData);
  const currentTreeFull = await ghFetch<GitTreeFull>(
    `${API_BASE}/git/trees/${currentCommit.tree.sha}?recursive=1`,
    token,
  );
  for (const entry of currentTreeFull.tree) {
    if (entry.type !== 'blob') continue;

    // Delete old root-level config.json and assets/* (migration)
    if (entry.path === 'config.json' || (entry.path.startsWith('assets/') && !entry.path.startsWith('public/'))) {
      treeEntries.push({
        path: entry.path,
        mode: '100644',
        type: 'blob',
        sha: null,
      });
      continue;
    }

    // Delete unreferenced assets under public/assets/
    if (
      entry.path.startsWith('public/assets/') &&
      !referencedPaths.has(entry.path.replace('public/', ''))
    ) {
      treeEntries.push({
        path: entry.path,
        mode: '100644',
        type: 'blob',
        sha: null,
      });
    }
  }

  // 5. Create new tree
  const newTree = await createTree(
    currentCommit.tree.sha,
    treeEntries,
    token,
  );

  // 6. Create new commit
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const newCommit = await createCommit(
    `Update landing config - ${timestamp}`,
    newTree.sha,
    commitSha,
    token,
  );

  // 7. Update branch ref
  await updateRef(branchName, newCommit.sha, token);
}
