<script lang="ts" context="module">
    import type { ReflectionStep } from '$lib/types'
    import type { Readable } from 'svelte/store'
    import { cx, isLifewheelStep } from '../lib/utils'
</script>

<script lang="ts">
    import { colors, icons } from '$lib/constants'

    export let reflectionStep: Readable<ReflectionStep>
</script>

<h2
    class={cx(
        'flex items-center justify-center gap-2 text-center text-lg font-normal normal-case 2xs:text-2xl xs:text-3xl',
        isLifewheelStep($reflectionStep) ? $reflectionStep.colors.text : 'text-emerald-400',
    )}
>
    {#if isLifewheelStep($reflectionStep)}
        <svg
            xmlns="http://www.w3.org/2000/svg"
            class={cx(colors[$reflectionStep.i].text, '-mb-0.5')}
            width="24"
            height="24"
            viewBox="0 0 24 24"><path fill="currentColor" d={icons[$reflectionStep.i]} /></svg
        >
    {/if}
    {$reflectionStep.title}
</h2>
<p class="whitespace-pre-wrap pt-2 text-sm 2xs:text-base xs:text-lg">
    {$reflectionStep.text}
</p>
