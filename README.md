# Life Wheel

> [Local-first](https://localfirstweb.dev/), privacy-friendly web app for your personal wellbeing.

<img src="screenshot.png" width="214" height="463" alt="Screenshot of the Lifewheel app. Overview of previous reflections, showing colored circle segments representing eight dimensions of your life.">

Reflect on your life balance. Visualise your progress over time and reconnect to what matters in your life. Make reflection a habit and gain new insights for your wellbeing.

Seamlessly sync your data across devices with a private link (using the [URI fragment](https://en.wikipedia.org/wiki/URI_fragment) = never sent to the server), QR code, or file. For more security and privacy, let the app generate a passphrase and encrypt your data using the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API). Experience how smooth the modern web can be!

[>> DEMO LINK](https://reconnect.earth/lifewheel)

## Project Vision and Key Features

- 🧘 Reflect on your life balance.
- 🌱 Follow your progress over time and reconnect to what matters in your life.
- 📊 Make reflection a habit and gain new insights for your wellbeing.
- 👌 Keep 100% control of your private data.
- 😇 No signup or account needed. Designed to be used offline.
    <!-- -   📲 Install the Progressive Web App to reflect on the go. -->
- 📥 Seamless file exports and imports, giving you full control over data syncing and backups. Integrates well with services like [Nextcloud](https://nextcloud.com/) and [Syncthing](https://syncthing.net/).
- 🔐 Optionally encrypt your data using the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) to improve your security and privacy. Let the app generate a strong passphrase - or choose your own.
- 🔗 Save your data as a private link (using the [URI fragment](https://en.wikipedia.org/wiki/URI_fragment) which is never sent to the server). Store your link somewhere safe (for example in your password manager), or save your QR code.
- ✨ Easily access your data on any device by clicking your private link or by scanning your QR code.
- ⌨️ Keyboard shortcuts (primarily with the arrow keys) for extra comfort.
- 🆓 Free as in freedom. This is [free software](https://fsfe.org/freesoftware/), and you're welcome to help make it even better!

Designed with inspiration from the [Humane Tech](https://www.humanetech.com/) principles, this project explores the possibilities of local-first web apps. Specifically - is it possible to give users full control over their private data, while still providing a smooth user experience? For the answer... well, you have to see it yourself! 😄

**Now check out the [live demo](https://reconnect.earth/lifewheel)!**

---

## Data format: Maintaining backwards compatibility

Since this app only works with local data, backwards compatibility is a key feature. By implementing all export/import logic in versioned protocols, we can let people import their data from old formats, and re-export in the newest format. The goal is to let people just use the app and give an experience that "just works".

When a new protocol version is added, we only need to keep the import logic from the older versions, since all data will be exported in the new format. If we need the old export-logic for some reason, it's always possible to find it in the git history.

## Start the local development environment

Make sure you have a recent version of [Node.js](https://nodejs.org/en), [pnpm](https://pnpm.io/) and [Git](https://git-scm.com/) installed.

### 1. Install dependencies

```sh
pnpm i
```

### 2. Start the development server

```sh
pnpm dev
```

Visit <http://localhost:5173> to see it and make your changes.

### 3. Workflow for making changes

Use `main` as the base branch, and make sure your local copy is updated.

```sh
git switch main
git pull
```

Create a new branch for your updates:

```sh
# For new features or larger changes:
git switch -c feature/something

# For smaller changes and fixes:
git switch -c fix/something
```

Work on your changes until you are ready. Then it's time to test locally:

#### 3.1. Build a production version for local testing

```sh
pnpm build
```

#### 3.2. Locally preview the production version

```sh
pnpm preview
```

When you've tested your changes, push the branch to GitHub and open a PR, describing the main changes. If you fixed a specific GitHub-issue, you can reference it in the PR description to automatically close it once the PR is reviewed and merged by using a [special syntax](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue#linking-a-pull-request-to-an-issue-using-a-keyword). For example: `Fixes #10`.

As soon as the change is reviewed and ready, it can be merged and published.

Thanks for improving the project! 🌱

## License

AGPL-3.0
