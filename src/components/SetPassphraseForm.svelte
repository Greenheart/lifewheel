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

        window.setTimeout(() => (copyText = 'Copy'), 2000)
    }
</script>

<h2 class="pt-8 text-lg font-bold">Securely generated passphrase</h2>
<div class="grid gap-2 pt-8">
    {#await passphrase then generated}
        <code>{generated}</code>
    {/await}
    <div class="grid grid-cols-2 gap-2">
        <Button variant="outline" on:click={copy}>Copy</Button>
        <Button
            variant="outline"
            on:click={() => {
                passphrase = generatePassphrase({ words })
            }}
        >
            <!-- IDEA: Maybe add regenerate/refresh icon instead of the text label, though we need to use it for the aria label -->
            Regenerate
        </Button>
    </div>
    <Button
        on:click={() => {
            // TODO: use this passphrase to generate the key and encrypt data
        }}>Save</Button
    >
</div>
