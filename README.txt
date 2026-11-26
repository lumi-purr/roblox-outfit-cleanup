OUTFIT MANAGER FOR ROBLOX — 3.1.1 BETA
Unofficial Chrome / Opera GX Manifest V3 extension.

UPDATE
Back up your current extension folder. Extract this ZIP into that same folder and replace its files. Open opera://extensions (or chrome://extensions), enable Developer mode, Reload the unpacked extension, and refresh https://www.roblox.com/my/avatar. Do not run v2 and v3 at once. The existing account-specific localStorage key is unchanged, so existing folders, favorites and history are retained in the same browser profile.

INLINE FOLDERS
Go to the saved characters area (the page section with Create New Character). An Outfit folders panel is inserted near that button. Expand a folder to see its outfit cards. Use + Folder to create a folder and the dropdown on each card to move it. Refresh reloads outfits and thumbnails. Manage opens the original library, cleanup and history tools, including folder rename/removal. The native Roblox list remains intact; this is a separate inline section, not server-side folders. Folder cards display outfits and move them; use Roblox's normal saved-character list to wear a saved outfit. The panel depends on the Create New Character button being visible and recognized in English.

RANDOMIZER
Manage Outfits > Library > Build random outfit. The extension reads your owned inventory (with pagination) and animation bundles. It rolls one hair, one non-hair accessory, one classic shirt, one classic pair of pants, and one complete owned animation pack (not independent animation slots). Missing categories remain unchanged; pack matching requires seven core animation types in the owned inventory. It preserves the current body, face, and unrelated assets; conflicting existing hair/accessories/clothing/animation categories are removed when replaced. Layered tops/bottoms are removed when a classic replacement exists; shoes and other unrelated items remain. Generate / reroll previews item names and individual Roblox thumbnails, not a combined rendered avatar. Equip requires confirmation, records the pre-change avatar in history, checks the avatar hasn't changed since the roll, then applies the asset list. Refresh Roblox to see the result. No purchases or new saved outfits are made. First load can take a while; inventory is cached for five minutes. A saved snapshot is reference data, not a one-click restore.

API LIMITATION
The equip implementation uses POST /v2/avatar/set-wearing-assets, currently documented but scheduled for removal beginning December 11, 2026. Migration to PATCH /v4/avatar is needed for a stable release; its update mask mapping wasn't verified. Inventory/bundle schema handling, live browser layout, and authenticated equip calls are not live-tested. If an API rejects a request, the UI reports an error; refresh to inspect avatar state. Test with a saved backup outfit first. Sources: https://create.roblox.com/docs/cloud/reference/domains/avatar ; https://devforum.roblox.com/t/official-list-of-deprecated-web-endpoints/62889/126 ; https://create.roblox.com/docs/cloud/reference/features/inventories .

HISTORY AND CLEANUP
The v2 history and cleanup features remain. History polls when the editor is visible, about every 20 seconds, and retains up to 150 snapshots. Equipping a generated outfit explicitly creates a pre-change snapshot even if periodic tracking is off. Cleanup requires selection, review, typed confirmation and a backup download, followed by a final confirmation. Deletion is permanent; backup JSON is not an automatic restore file. Stop halts subsequent requests.

PRIVACY
Folders, favorites and history are stored locally per account on www.roblox.com. Clearing site data removes them. No third-party endpoints, cookie reading, or external services. Requests use the normal signed-in Roblox session.

TESTING
Node JavaScript syntax check and mocked randomizer logic checks. No authenticated Roblox session or live browser layout test was available.

3.0.1 HOTFIX
Inventory queries use smaller category groups with named types and numeric single-type fallback for HTTP 400. Animation bundle read failures are shown separately and do not prevent clothing rolls; existing animations are kept. Requests report API path and server error text. Avatar reads explicitly select AvatarModel. No live authenticated test.

3.0.2 UPDATE
Optional Randomize body parts and Randomize gear checkboxes in the randomizer. Both default off. Check either and Generate / reroll. Each body slot independently selects an owned part (classic or dynamic head, torso, each arm and leg); gear selects one owned item. Missing or rejected optional inventory categories are reported and existing items are kept if no replacement is available. A dynamic head replaces classic face and conflicting makeup; head replacement clears previous mood animation. Existing body scales and colors are not changed. Gear display/equip and mixed body compatibility are subject to Roblox validation. No live authenticated test.

3.0.3 UPDATE
Library > Suggest an accessory rolls from owned non-hair accessories, without changing your avatar. Reroll cycles through unique suggestions until the pool is exhausted. Item cards show a Roblox thumbnail, name and catalog link. The randomizer now shows individual item and animation bundle thumbnails, with graceful fallback if Roblox does not supply an image. Body and gear toggles are unchanged. Thumbnail requests are read-only and cached briefly. No live authenticated test.

3.0.4 UI UPDATE
Larger responsive cards, consistent two-line outfit names (hover to see full name), corner favorite buttons, readable folder selectors, missing-thumbnail placeholders, and restyled inline folders, tools and previews. No inventory, equip, deletion or local storage API changes.

UI testing: Chromium mock page with 60 outfits at 1440x850, 1920x1080 and 390x800; verified equal card heights, no clipped selectors, scrolling, missing thumbnail fallback, favorite toggling, cleanup selection and inline folder expansion. Roblox account and live website not tested.

3.0.5 APPEARANCE UPDATE
Manage Outfits > Appearance. Choose independent background, text and button colors; adjust card surface opacity (0–100%) and wallpaper dimming. Avatar thumbnails and text stay opaque. Select a local PNG, JPEG or WebP up to 20 MB; it is resized to at most 1600 pixels on its longest edge, flattened to JPEG and compressed to <=500,000 data URL characters. Remove image or Reset to default independently of all existing outfit data. Appearance applies to the manager and its inline folder section and is browser-wide for this Roblox site (not the rest of Roblox). The separate localStorage key does not alter folders, history or favorites. No image upload or external request is performed by this extension, but Roblox site scripts can access site storage and the rendered page, so do not select private or sensitive photos. If site storage is full the UI reports that a theme could not be saved. Clearing Roblox site data clears the theme.

Appearance UI testing: Chromium mock with 60 outfits; verified colors, 25% card background alpha without fading card contents, inline folder theme, local image selection and conversion, saved theme on reopening, image removal, reset, preserved folder data, and existing three viewport layout tests. No live Roblox test; site CSP may affect local image display.

3.0.6 WALLPAPER HOTFIX
Decode selected images directly with createImageBitmap and render stored wallpaper through a non-interactive canvas rather than blob or data URL image requests. Existing appearance data remains compatible.


3.0.7 TEXT UPDATE
Reworded user-facing descriptions and status messages in a casual style. No behavior, confirmation tokens, storage keys, or API changes.


3.0.8 LANGUAGE SETTINGS
Choose proper English, improper English (the v3.0.7 writing style), LOLcat, upside-down English, pirate speak, leetspeak, alternating case, or medieval English. Toggle headers/titles/buttons separately. Changes apply immediately and persist on this browser. Names, IDs, confirmation tokens, deletion safety controls, raw errors and the language settings panel are not transformed. Novelty modes are playful text transformations, not complete translations. Outfit and appearance storage are unchanged.

3.0.9: Proper English is the default for new installs; saved language choices are respected. Searchable language list with Spanish, French and German interface translations (safety confirmations and some runtime text remain English). Visible native title checkbox. Requests outfit thumbnails with Roblox backgrounds, falling back to ordinary thumbnails if unsupported.

3.1.1: Hidden TV, Konami code Up Up Down Down Left Right Left Right B A while manager is open and no text field is focused. Bundled original cat clip plays as a silent 15 fps canvas loop. Click right knob to dismiss. No extra permissions, network requests, or saved data changes.

3.1.2: TV slides in from the left. Konami letters accept either case and physical A/B keys. The search field is still excluded from the shortcut.
