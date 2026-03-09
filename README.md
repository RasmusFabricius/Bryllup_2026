Wedding website (forest / Gaelic style)

What I created
- A static site in this folder ready to be served on GitHub Pages.
- Read-only wish list stored at `data/wishlist.json`. You can edit it manually or use the admin script to add new wishes.
- Photo upload and gallery powered by Cloudinary (unsigned uploads) so guests can upload without repo access.

How to set up and deploy
1. Copy `config.example.js` to `config.js` and fill in your Cloudinary cloud name and an unsigned upload preset (see Cloudinary docs).

2. (Optional) Install the admin script's dependency and use it to add wishes locally:

```bash
cd /Users/rasmus/Desktop/Bryllup_test
npm init -y
npm install minimist
node admin/add-wish.js --title "New wish" --description "Details" --link "https://example.com"
```

This will append the wish to `data/wishlist.json`. Commit and push to GitHub to update the public site.

3. Deploy to GitHub Pages
- Create a GitHub repository and push this folder as the repo root (or use gh-pages branch). Enable GitHub Pages in repository settings (serve from `main` branch / `docs/` or `gh-pages` branch as you prefer).

Notes & limitations
- This is a static site. Guests upload photos directly to Cloudinary via the unsigned preset; you must create that preset in your Cloudinary dashboard. Photos are tagged `wedding-photos` so the gallery lists them.
- Guests cannot add wishes through the site. Only the repository-owned `data/wishlist.json` controls the wish list. Use the admin script or edit `data/wishlist.json` on GitHub to change it.

Next steps (optional)
- If you prefer guests to upload images directly to the repo, you'll need a server-side component or GitHub API flow which requires authentication and is not included here.
- I can add a nicer Celtic border SVG, RSVP form (via Google Forms), or a printable directions page if you want — tell me which.
