<script lang="ts" context="module">
    import Button from './Button.svelte'
    import ReflectionTexts from './ReflectionTexts.svelte'
    import InputSlider from './InputSlider.svelte'
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

    <InputSlider />

    <div class="flex w-full min-w-[160px] max-w-md justify-between px-4 pb-4 pt-4 2xs:pt-8">
        {#if onPrev}
            <Button variant="roundOutline" on:click={onPrev}>←</Button>
        {/if}
        {#if onNext}
            <Button variant="roundSolid" on:click={onNext}>→</Button>
        {/if}
    </div>
</div>
