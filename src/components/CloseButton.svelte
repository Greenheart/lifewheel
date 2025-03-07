<script lang="ts">
    let { class: className = '' } = $props()
</script>

<button
    class={[
        'flex h-12 w-12 items-center justify-center rounded-full border-2 border-transparent text-center text-sm hover:border-emerald-500/5 hover:bg-emerald-400/5 hover:from-emerald-500/10 hover:to-emerald-500/5',
        className,
    ]}>⨉</button
>
