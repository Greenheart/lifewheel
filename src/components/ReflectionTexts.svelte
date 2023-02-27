<script>
    import { cx, isLifewheelStep } from '../lib/utils'
    import { reflectionStep } from '../lib/stores'
</script>

<h2
    class={cx(
        'text-center text-lg font-normal normal-case 2xs:text-2xl xs:text-3xl',
        isLifewheelStep($reflectionStep) ? $reflectionStep.colors.text : 'text-emerald-400',
    )}
>
    {$reflectionStep.title}
</h2>
<p class="whitespace-pre-wrap pt-2 text-left xs:text-lg">
    {$reflectionStep.text}
</p>
