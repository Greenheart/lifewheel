# Life Wheel

> [Local-first](https://localfirstweb.dev/), privacy-friendly web app for your personal wellbeing.

<img src="screenshot.png" width="214" height="463" alt="Screenshot of the Lifewheel app. Overview of previous reflections, showing colored circle segments representing eight dimensions of your life.">

Reflect on your life balance. Visualise your progress over time and reconnect to what matters in your life. Make reflection a habit and gain new insights for your wellbeing.

Seamlessly sync your data across devices with a private link (using the [URI fragment](https://en.wikipedia.org/wiki/URI_fragment) = never sent to the server), QR code, or file. For more security and privacy, let the app generate a passphrase and encrypt your data using the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API). Experience how smooth the modern web can be!

[>> DEMO LINK](https://reconnect.earth/lifewheel)

## Project Vision and Key Features

-   🧘 Reflect on your life balance.
-   🌱 Follow your progress over time and reconnect to what matters in your life.
-   📊 Make reflection a habit and gain new insights for your wellbeing.
-   👌 Keep 100% control of your private data.
-   😇 No signup or account needed. Designed to be used offline.
<!-- -   📲 Install the Progressive Web App to reflect on the go. -->
-   📥 Seamless file exports and imports, giving you full control over data syncing and backups. Integrates well with services like [Nextcloud](https://nextcloud.com/) and [Syncthing](https://syncthing.net/).
-   🔐 Optionally encrypt your data using the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) to improve your security and privacy. Let the app generate a strong passphrase - or choose your own.
-   🔗 Save your data as a private link (using the [URI fragment](https://en.wikipedia.org/wiki/URI_fragment) which is never sent to the server). Store your link somewhere safe (for example in your password manager), or save your QR code.
-   ✨ Easily access your data on any device by clicking your private link or by scanning your QR code.
-   ⌨️ Keyboard shortcuts (primarily with the arrow keys) for extra comfort.
-   🆓 Free as in freedom. This is [free software](https://fsfe.org/freesoftware/), and you're welcome to help make it even better!

Designed with inspiration from the [Humane Tech](https://www.humanetech.com/) principles, this project explores the possibilities of local-first web apps. Specifically - is it possible to give users full control over their private data, while still providing a smooth user experience? For the answer... well, you have to see it yourself! 😄

**Now check out the [live demo](https://reconnect.earth/lifewheel)!**

---

## Development

### Maintaining backwards compatibility

Since this app only works with local data, backwards compatibility is a key feature. By implementing all export/import logic in versioned protocols, we can let people import their data from old formats, and re-export in the newest format. The goal is to let people just use the app and give an experience that "just works".

When a new protocol version is added, we only need to keep the import logic from the older versions, since all data will be exported in the new format. If we need the old export-logic for some reason, it's always possible to find it in the git history.

## License

AGPL-3.0
