<script lang="ts" context="module">
    import Button from './Button.svelte'
    import ReflectionTexts from './ReflectionTexts.svelte'
</script>

<script lang="ts">
    import { reflectionStep } from '$lib/stores'

    let onPrev: ((event: MouseEvent) => void) | null = () => {}
    let onNext: ((event: MouseEvent) => void) | null = () => {}
</script>

<div class="mx-auto grid max-w-screen-md place-items-center">
    <div class="max-w-lg px-4 py-8">
        <ReflectionTexts />
    </div>

    <div class="flex w-full max-w-sm justify-between px-4 py-4">
        {#if onPrev}
            <Button variant="roundOutline" on:click={onPrev}>←</Button>
        {/if}
        <div class="flex-grow" />
        {#if onNext}
            <Button variant="roundSolid" on:click={onNext}>→</Button>
        {/if}
    </div>
</div>
