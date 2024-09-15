export function secureRandomInt(min: number, max: number) {
    let randomNumber
    // Due to the repeating nature of results from the remainder
    // operator, we potentially need to regenerate the random number
    // several times. This is required to ensure all numbers have
    // the same probability to get picked. Otherwise, the first
    // numbers would appear more often, resulting in a weaker password security.
    // Learn more: https://samuelplumppu.se/blog/generate-password-in-browser-web-crypto-api
    do {
        randomNumber = crypto.getRandomValues(new Uint8Array(1))[0]
    } while (randomNumber >= 256 - (256 % max))

    return min + (randomNumber % max)
}
