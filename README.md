# Just for Neha

A guided birthday experience: countdown → birthday song → blow out the candles → cake cutting → birthday greeting → sealed letter → photo album → twenty birthday wishes → QR prank → lantern finale.

The cake is a live Three.js scene with textured vanilla sponge, cream and strawberry filling, pink ganache drips, piped cream, seeded strawberries, candles, and a porcelain stand. Drag to rotate it. Use the optional microphone to blow out the candles, or use the tap alternative. Flames fade with a brief wisp of smoke, then the cutting button unlocks. Two knife cuts release a slice onto its plate before the birthday reveal. Devices without WebGL can still make a wish and continue.

The microphone runs only after a button click and browser permission. It measures a short breath pulse locally without recording or uploading audio. It stops after detection, cancellation, fourteen seconds, a hidden tab, or leaving the cake. The soundtrack pauses while listening and resumes afterwards; a test reset does not resume it.

The photo album has animated Polaroids, thumbnails, swipe gestures, arrow-key navigation, and an enlarged photo view. Each of the twenty stars opens its own wish, and she can continue whenever she likes. QR scanning, the same-phone button, and skipping all lead to a playful “Just kidding!” reveal, followed by floating lanterns and a favorite-photo keepsake.

Tap **Neha’s name five times within six seconds** in the header or birthday greeting to open the hidden Birthday VIP surprise. Close it with its button, Escape, or the backdrop. Edit the secret text or add an inside-joke photo in `experienceConfig.ts`.

Run `npm install` and `npm run dev`, then open http://localhost:3000.

## Test the timing now

In development, open **Development · test the timing** beneath the page.

- Choose a future date and time, click **Set test time**, then click **I’m ready for the surprise**. The test field uses your device’s local timezone and includes seconds.
- Or click **Start 10-second test** to enable sound and begin a short countdown immediately.
- **Use birthday time** restores the configured release time. Test settings reset on refresh and are excluded from production builds.

The opening tap is needed to enable browser audio. Keep the page open; at the deadline, the music starts and the cake appears automatically. If a browser blocks playback, the music button lets the visitor start it. Visitors arriving after the deadline can begin immediately with the opening button.

## Set the content in code

- `src/data/experienceConfig.ts`: set `celebrationAt` to an ISO timestamp including a timezone offset. The default `2026-10-26T00:00:00+05:30` is October 26, 2026 at midnight in India. Change this to any desired time for a production rehearsal.
- The album uses the four supplied collages directly from `public/`: `IMG_4028.jpg`, `IMG_4026 2.PNG`, `IMG_4036.jpg`, and `IMG_4037.jpg`. Portrait frames show each complete collage without cropping, including in the enlarged view. The brown-top collage is the finale keepsake; the red-top collage also appears in the hidden surprise. Keep the filenames unchanged, including the PNG’s space and uppercase extension.
- `src/data/defaultConfig.ts`: edit Neha’s name, birth date, letter, memory captions, and optional custom photo URLs.
- `src/data/birthdayWishes.ts`: edit the twenty wishes. `experienceConfig.ts` controls the milestone age, hidden surprise, and finale photo ID and message.
- `src/data/experienceConfig.ts`: the soundtrack is the supplied **Baar Baar Din Yeh Aaye** recording in `public/audio/baar-baar-din-yeh-aaye.wav`. Change `birthdaySong.customUrl` to use a different recording. The song is prepared silently on the opening tap, starts at the countdown deadline, and loops through the experience. The music button pauses and resumes it.
- `surprise.qrValue`: the message or HTTPS URL encoded in the locally generated QR. The default is a birthday message. A same-phone button is also available; **Skip this part** opens the “Just kidding!” scene, with a button to continue to the lantern finale.

There are no visitor customization controls, uploads, or saved content overrides. Old local-storage settings and shared configuration hashes are ignored.

## Checks

`npm test` checks birthday logic and countdown timing. `npx tsc --noEmit` checks TypeScript. `npm run build` creates the production site in `dist/`, with development timing controls removed.
