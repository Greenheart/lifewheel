<script lang="ts" context="module">
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
    let passphrase = browser ? generatePassphrase({ words }) : Promise.resolve('')
</script>

<div class="grid place-items-center gap-2 pt-8">
    {#await passphrase then generated}
        <code>{generated}</code>
    {/await}
    <div class="justify-center">
        <Button
            variant="ghost"
            on:click={() => {
                passphrase = generatePassphrase({ words })
            }}
        >
            <!-- IDEA: Maybe add regenerate/refresh icon instead of the text label, though we need to use it for the aria label -->
            Regenerate
        </Button>
        <Button
            variant="ghost"
            on:click={() => {
                // TODO: use this passphrase to generate the key and encrypt data
            }}>Save</Button
        >
    </div>
</div>
