<script lang="ts" context="module">
    import type { Writable } from 'svelte/store'
    import { browser } from '$app/environment'

    import Button from './Button.svelte'
    import { generatePassphrase } from '$lib/crypto'

    const rawWords = browser
        ? (await fetch('words.txt')
              .then((res) => res.text())
              .catch((err) => {
                  console.log(err)
              })) ?? ''
        : ''

    const words = rawWords
        .trim()
        .split('\n')
        .reduce<{ [id: string]: string }>((result, row) => {
            const [id, word] = row.split('\t')
            result[id] = word
            return result
        }, {})
</script>

<script lang="ts">
    export let isGeneratingKey: Writable<boolean>
    let passphrase = browser ? generatePassphrase({ words }) : Promise.resolve('')

    let copyText = 'Copy'

    const copy = async () => {
        const text = await passphrase
        // Clipboard is only available in via HTTPS or localhost
        await navigator?.clipboard?.writeText(text)
        copyText = 'Copied!'

        window.setTimeout(() => {
            copyText = 'Copy'
        }, 2000)
    }

    let saved = false
</script>

<h2 class="pb-2 text-lg font-bold">Your generated passphrase:</h2>
<div class="grid gap-2">
    {#await passphrase then generated}
        <code class="rounded-md bg-gray-900 px-2 py-3">{generated}</code>
    {/await}
    <div class="grid grid-cols-2 gap-2">
        <Button variant="outline" on:click={copy}>{copyText}</Button>
        <Button
            variant="outline"
            on:click={() => {
                passphrase = generatePassphrase({ words })
            }}
        >
            Regenerate
        </Button>
    </div>
    <label for="persist" class="flex gap-2 py-2 text-sm"
        ><input type="checkbox" name="persist" id="persist" bind:checked={saved} />
        I have saved my passphrase somewhere safe</label
    >
    <Button
        disabled={!saved}
        on:click={() => {
            // TODO: use this passphrase to generate the key and encrypt data
        }}>Continue</Button
    >
</div>
