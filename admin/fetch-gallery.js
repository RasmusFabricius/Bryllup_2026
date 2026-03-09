#!/usr/bin/env node
// Fetch images tagged 'wedding-photos' from Cloudinary and write to data/gallery.json
// Usage (recommended): set env vars and run
// CLOUDINARY_CLOUD_NAME=... CLOUDINARY_API_KEY=... CLOUDINARY_API_SECRET=... node admin/fetch-gallery.js

const fs = require('fs');
const path = require('path');

async function main() {
  // Support either a single CLOUDINARY_URL env var (preferred) or individual vars/args.
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  let cloud_name = process.env.CLOUDINARY_CLOUD_NAME || process.argv[2];
  let api_key = process.env.CLOUDINARY_API_KEY || process.argv[3];
  let api_secret = process.env.CLOUDINARY_API_SECRET || process.argv[4];

  if (!cloudinaryUrl && (!cloud_name || !api_key || !api_secret)) {
    console.error('Missing Cloudinary credentials. Provide either CLOUDINARY_URL or env vars CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.');
    console.error('Or run: node admin/fetch-gallery.js <cloud_name> <api_key> <api_secret>');
    process.exit(1);
  }

  // lazy-load cloudinary package
  let cloudinary;
  try {
    cloudinary = require('cloudinary').v2;
  } catch (e) {
    console.error('Please install the cloudinary package first: npm install cloudinary');
    process.exit(1);
  }

  // If CLOUDINARY_URL is present, the SDK will read it automatically.
  if (cloudinaryUrl) {
    console.log('Using CLOUDINARY_URL from environment');
  } else {
    cloudinary.config({ cloud_name, api_key, api_secret });
  }

  const all = [];
  let next_cursor = undefined;
  try {
    // First try by tag
    do {
      const res = await cloudinary.api.resources_by_tag('wedding-photos', { max_results: 500, next_cursor });
      if (res.resources && res.resources.length > 0) {
        res.resources.forEach(r => all.push(r));
      }
      next_cursor = res.next_cursor;
    } while (next_cursor);

    // If nothing found by tag, fallback to recent image resources (public accounts may not support tag listing)
    if (all.length === 0) {
      console.warn('No items found with tag "wedding-photos" — falling back to recent image resources');
      let next = undefined;
      do {
        const res = await cloudinary.api.resources({ type: 'upload', resource_type: 'image', max_results: 500, next_cursor: next });
        if (res.resources && res.resources.length > 0) { res.resources.forEach(r => all.push(r)); }
        next = res.next_cursor;
      } while (next);
    }

    const outPath = path.join(__dirname, '..', 'data', 'gallery.json');
    const simplified = all.map(r => ({ public_id: r.public_id, url: r.secure_url || r.url, format: r.format }));
    fs.writeFileSync(outPath, JSON.stringify(simplified, null, 2), 'utf8');
    console.log(`Wrote ${simplified.length} items to ${outPath}`);
  } catch (e) {
    console.error('Failed to fetch gallery:', e.message || e);
    process.exit(1);
  }
}

main();
