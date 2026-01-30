import * as base64 from './base64'

/** Parse the given Base64url string and return the data as an Uint8Array */
export function parse(string: string) {
    // Since JavaScript atob() implements forgiving base64 decoding, we don't need to add trailing `=`s for padding
    return base64.parse(string.replaceAll('-', '+').replaceAll('_', '/'))
}

/** Base64url encode the given Uint8Array and return a string */
export function stringify(data: Uint8Array) {
    return (
        base64
            .stringify(data)
            // Replace characters to convert base64 into base64url
            .replaceAll('+', '-')
            .replaceAll('/', '_')
            // Remove any trailing `=`s
            .replace(/=+$/, '')
    )
}
