<script lang="ts" module>
    import type { ReflectionStep } from '$lib/types'
    import { isLifewheelStep, isCommentStep } from '../lib/utils'
</script>

<script lang="ts">
    import { colors, COMMENT_ICON, LIFEWHEEL_ICONS } from '$lib/constants'

    type Props = {
        reflectionStep: ReflectionStep
    }
    let { reflectionStep }: Props = $props()
</script>

<h2
    class={[
        'flex items-center justify-center gap-2 text-lg font-normal normal-case xs:text-2xl sm:text-3xl',
        isLifewheelStep(reflectionStep) ? reflectionStep.colors.text : 'text-emerald-400',
    ]}
>
    {#key reflectionStep}
        {#if isLifewheelStep(reflectionStep)}
            {@const Icon = LIFEWHEEL_ICONS[reflectionStep.i]}
            <Icon class="size-6 -mb-0.5 {colors[reflectionStep.i].text}" />
        {/if}
        
        {#if isCommentStep(reflectionStep)}
            {@const Icon = COMMENT_ICON}
            <Icon class="size-6 -mb-0.5 text-emerald-400" />
        {/if}
    {/key}
    {reflectionStep.title}
</h2>
<p class="whitespace-pre-wrap pt-2 text-sm 2xs:text-base xs:text-lg">
    {reflectionStep.text}
</p>
