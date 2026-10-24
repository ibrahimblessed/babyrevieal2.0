# Baby Syed

A live gender-reveal site. Everyone with the link sees the countdown. When the parents press the button, the reveal plays for everyone, in real time.

Stack: Vite, React 18, TypeScript, Framer Motion, Firebase (Auth + Firestore).

- `/` public countdown and reveal
- `/#/login` parents sign in (Firebase email and password)
- `/#/parents` dashboard: set the reveal time, pick boy or girl, hold the button to reveal

## One-time Firebase setup (project `ibrahim-cv-df6ad`)

1. **Authentication** -> Sign-in method -> enable **Email/Password**.
2. **Authentication** -> Users -> **Add user** for each parent (email and password).
3. **Firestore Database** -> create one if the project has none.
4. **Firestore** -> Rules. Do not replace your existing rules. Add the `babySyed` block from `firestore.rules` inside your existing `match /databases/{database}/documents { ... }`, put the two parent emails in it, and Publish.
5. Optional: put the same emails in `src/config.ts` -> `PARENT_EMAILS`. This only hides the dashboard from other accounts. The rules are the real lock.
6. If you host anywhere other than `*.web.app`, `*.firebaseapp.com` or `localhost`, add the domain under Authentication -> Settings -> Authorized domains.

The Firebase config in `src/firebase.ts` is public by design. Security comes from Auth plus the Firestore rules.

## Run it

```bash
npm install
npm run dev
```

## Publish it

Firebase Hosting (project already set in `.firebaserc`):

```bash
npm run build
npx firebase-tools login
npx firebase-tools deploy --only hosting
```

Or upload the `dist` folder to GitHub Pages, Netlify or Vercel. It uses hash routing, so no server rules are needed.

## Reveal day

1. Open `/#/login` and sign in.
2. Check the reveal time (default Monday 26 Oct 2026, 17:00 South Africa time).
3. Pick Boy or Girl. Use "Preview" to see the animation on your screen only.
4. Press and hold "Hold to reveal to everyone". Every open page plays the reveal at once.
5. Made a mistake? "Hold to hide the result again" puts the countdown back. Reveal again later for a fresh cinematic.

The answer is only written to Firestore when you reveal, so nobody can find it early.
