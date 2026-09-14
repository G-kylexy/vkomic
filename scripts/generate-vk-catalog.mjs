import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const API_VERSION = process.env.VK_API_VERSION || "5.199";
const GROUP_ID = String(process.env.VK_GROUP_ID || "203785966").replace(/^-/, "");
const ROOT_TOPIC_ID = String(process.env.VK_TOPIC_ID || "47515406");
const MAX_DEPTH = Number(process.env.VK_CATALOG_MAX_DEPTH || "6");
const MAX_API_CALLS = Number(process.env.VK_MAX_API_CALLS || "1800");
const OUTPUT_PATH = resolve(process.env.VK_CATALOG_OUTPUT || "docs/catalog-v1.json");
const SERVICE_TOKEN = process.env.VK_SERVICE_TOKEN || "";
const API_INTERVAL_MS = 400;

let apiCalls = 0;
let lastRequestAt = 0;
const commentsCache = new Map();

const sleep = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));

const cleanTitle = (value) => {
  let title = String(value || "").trim();
  const bbcodeTitle = title.match(/\[topic-\d+(?:_\d+)?\|([^\]]+)\]/i);
  if (bbcodeTitle) title = bbcodeTitle[1];
  return title
    .replace(/\s*[-–—=]+[>→»]\s*.*$/u, "")
    .replace(/https?:\/\/.*$/iu, "")
    .replace(/[:\-–—]+$/u, "")
    .replace(/^\s*[-–—'»«•*·]+\s*/u, "")
    .replace(/\s*[-–—'»«•*·]+\s*$/u, "")
    .replace(/\(lien\)/giu, "")
    .trim();
};

const addTopic = (nodes, byId, groupId, topicId, rawTitle, excludeTopicId) => {
  if (!groupId || !topicId || topicId === excludeTopicId) return;
  const id = `topic_${topicId}`;
  let title = cleanTitle(rawTitle);
  if (title.length < 2) title = `Topic ${topicId}`;
  if (title.length >= 200) return;

  const existing = byId.get(id);
  if (existing) {
    if (!existing.title.includes(title) && !title.startsWith("Topic ")) {
      existing.title = `${existing.title} - ${title}`;
    }
    return;
  }

  const node = {
    id,
    title,
    type: "genre",
    url: `https://vk.ru/topic-${groupId}_${topicId}`,
    children: [],
    isLoaded: false,
    structureOnly: false,
    vkGroupId: groupId,
    vkTopicId: topicId,
  };
  byId.set(id, node);
  nodes.push(node);
};

export const parseTopicBody = (text, excludeTopicId = null) => {
  const nodes = [];
  const byId = new Map();
  const value = String(text || "");

  for (const match of value.matchAll(/\[topic-(\d+)_(\d+)\|([^\]]+)\]/giu)) {
    addTopic(nodes, byId, match[1], match[2], match[3], excludeTopicId);
  }
  for (const match of value.matchAll(/@topic-(\d+)_(\d+)(?:\?post=\d+)?(?:\s*\(([^)]+)\))?/giu)) {
    addTopic(nodes, byId, match[1], match[2], match[3], excludeTopicId);
  }

  const lines = value.split(/\r?\n/u);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const matches = [];

    for (const match of line.matchAll(/https?:\/\/(?:[a-z0-9]+\.)?vk\.(?:com|ru)\/topic-(\d+)_(\d+)(?:\?post=\d+)?/giu)) {
      matches.push({ match, groupId: match[1], topicId: match[2] });
    }
    for (const match of line.matchAll(/https?:\/\/(?:[a-z0-9]+\.)?vk\.(?:com|ru)\/board(\d+)\?[^\s\]]*(?:topic-|topic_id=|tid=)(?:-?\d+_)?(\d+)/giu)) {
      matches.push({ match, groupId: match[1], topicId: match[2] });
    }

    for (const entry of matches) {
      const start = entry.match.index || 0;
      const end = start + entry.match[0].length;
      const before = cleanTitle(line.slice(0, start));
      const previous = index > 0 && !/vk\.(?:com|ru)/iu.test(lines[index - 1])
        ? cleanTitle(lines[index - 1])
        : "";
      const after = !/vk\.(?:com|ru)/iu.test(line.slice(end))
        ? cleanTitle(line.slice(end))
        : "";
      const title = before || previous || after || `Topic ${entry.topicId}`;
      addTopic(nodes, byId, entry.groupId, entry.topicId, title, excludeTopicId);
    }
  }

  return nodes;
};

export const extractDocuments = (items) => {
  const documents = [];
  const seen = new Set();
  for (const item of items || []) {
    for (const attachment of item.attachments || []) {
      if (attachment?.type !== "doc" || !attachment.doc) continue;
      const doc = attachment.doc;
      const ownerId = String(doc.owner_id ?? "");
      const docId = String(doc.id ?? "");
      if (!ownerId || !docId) continue;
      const id = `doc_${ownerId}_${docId}`;
      if (seen.has(id)) continue;
      seen.add(id);
      documents.push({
        id,
        title: String(doc.title || "Document"),
        type: "file",
        ...(doc.url ? { url: String(doc.url) } : {}),
        ...(doc.ext ? { extension: String(doc.ext).toUpperCase() } : {}),
        ...(Number.isFinite(Number(doc.size)) ? { sizeBytes: Number(doc.size) } : {}),
        vkOwnerId: ownerId,
        vkDocId: docId,
        ...(doc.access_key ? { vkAccessKey: String(doc.access_key) } : {}),
        isLoaded: true,
        structureOnly: false,
      });
    }
  }
  return documents;
};

const waitForApiSlot = async () => {
  const remaining = API_INTERVAL_MS - (Date.now() - lastRequestAt);
  if (remaining > 0) await sleep(remaining);
  lastRequestAt = Date.now();
};

const vkRequest = async (method, params) => {
  if (!SERVICE_TOKEN) throw new Error("VK_SERVICE_TOKEN is missing");
  if (apiCalls >= MAX_API_CALLS) {
    throw new Error(`Safety limit reached (${MAX_API_CALLS} VK API calls)`);
  }

  for (let attempt = 0; attempt < 4; attempt += 1) {
    await waitForApiSlot();
    apiCalls += 1;
    const body = new URLSearchParams({ v: API_VERSION, ...params });
    let response;
    try {
      response = await fetch(`https://api.vk.ru/method/${method}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SERVICE_TOKEN}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Vkomic-Catalog/1.0 (+https://github.com/G-kylexy/vkomic)",
        },
        body,
        signal: AbortSignal.timeout(30_000),
      });
    } catch (error) {
      if (attempt === 3) throw error;
      await sleep(1500 * (attempt + 1));
      continue;
    }

    if (!response.ok) {
      if (attempt === 3 || response.status < 500) {
        throw new Error(`VK API HTTP ${response.status}`);
      }
      await sleep(1500 * (attempt + 1));
      continue;
    }

    const payload = await response.json();
    if (!payload.error) return payload.response;
    const code = Number(payload.error.error_code);
    if ((code === 6 || code === 10) && attempt < 3) {
      await sleep(1500 * (attempt + 1));
      continue;
    }
    throw new Error(`VK API ${code}: ${payload.error.error_msg || "request rejected"}`);
  }
  throw new Error("VK API request failed");
};

const fetchAllComments = async (groupId, topicId) => {
  const key = `${groupId}:${topicId}`;
  if (commentsCache.has(key)) return commentsCache.get(key);

  const items = [];
  let offset = 0;
  let total = 0;
  do {
    const page = await vkRequest("board.getComments", {
      group_id: String(groupId).replace(/^-/, ""),
      topic_id: String(topicId),
      count: "100",
      offset: String(offset),
      extended: "0",
    });
    const pageItems = Array.isArray(page?.items) ? page.items : [];
    total = Number(page?.count || pageItems.length);
    items.push(...pageItems);
    offset += pageItems.length;
    if (pageItems.length === 0) break;
  } while (offset < total);

  const result = { items, count: total };
  commentsCache.set(key, result);
  return result;
};

const mergeChildren = (topics, documents) => {
  const result = [];
  const ids = new Set();
  for (const node of [...topics, ...documents]) {
    if (ids.has(node.id)) continue;
    ids.add(node.id);
    result.push(node);
  }
  return result;
};

const expandTopicNode = async (node, depth, ancestors) => {
  if (!node.vkGroupId || !node.vkTopicId) return;
  const key = `${node.vkGroupId}:${node.vkTopicId}`;
  if (ancestors.has(key)) {
    node.children = [];
    node.isLoaded = true;
    return;
  }

  const { items, count } = await fetchAllComments(node.vkGroupId, node.vkTopicId);
  const fullText = items.map((item) => String(item.text || "")).join("\n");
  const topics = parseTopicBody(fullText, node.vkTopicId);
  const documents = extractDocuments(items);
  node.children = mergeChildren(topics, documents);
  node.count = count;
  node.isLoaded = true;
  node.structureOnly = false;
  if (documents.length > 0) node.type = "series";

  if (depth >= MAX_DEPTH) return;
  const nextAncestors = new Set(ancestors).add(key);
  for (const child of node.children) {
    if (child.type !== "file") {
      await expandTopicNode(child, depth + 1, nextAncestors);
    }
  }
};

const generateCatalog = async () => {
  const root = await fetchAllComments(GROUP_ID, ROOT_TOPIC_ID);
  const fullText = root.items.map((item) => String(item.text || "")).join("\n");
  const items = parseTopicBody(fullText, ROOT_TOPIC_ID);
  for (const item of items) {
    item.type = "category";
    await expandTopicNode(item, 1, new Set([`${GROUP_ID}:${ROOT_TOPIC_ID}`]));
  }

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: { groupId: GROUP_ID, topicId: ROOT_TOPIC_ID },
    apiCalls,
    items,
  };
};

const runSelfTest = () => {
  const nodes = parseTopicBody([
    "BDs en français / French comics books",
    "https://vk.ru/topic-203785966_47386771",
    "Mangas en français",
    "https://vk.com/topic-203785966_47423270",
  ].join("\n"));
  assert.equal(nodes.length, 2);
  assert.equal(nodes[0].title, "BDs en français / French comics books");
  assert.equal(nodes[0].vkTopicId, "47386771");

  const docs = extractDocuments([{ attachments: [{ type: "doc", doc: {
    id: 42,
    owner_id: -203785966,
    title: "Album.pdf",
    ext: "pdf",
    size: 123,
    url: "https://example.invalid/file",
  } }] }]);
  assert.equal(docs.length, 1);
  assert.equal(docs[0].extension, "PDF");
  assert.equal(docs[0].id, "doc_-203785966_42");
  console.log("Catalog parser self-test passed");
};

if (process.argv.includes("--self-test")) {
  runSelfTest();
} else {
  const catalog = await generateCatalog();
  if (!catalog.items.length) throw new Error("VK returned an empty catalog");
  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
  console.log(`Catalog generated: ${catalog.items.length} roots, ${apiCalls} VK API calls`);
}
