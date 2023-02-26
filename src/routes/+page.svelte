<script lang="ts">
    import Button from '$components/Button.svelte'
    import LinkButton from '$components/LinkButton.svelte'
</script>

<div class="pt-16 text-center">
    <h1
        class="bg-gradient-to-br from-emerald-400 to-emerald-400/75 bg-clip-text text-5xl font-extrabold normal-case text-transparent xs:text-6xl"
    >
        Life Wheel
    </h1>

    <p class="pt-4 text-xl text-white xs:text-2xl">Reflect on Your Life Balance</p>
</div>

<div class="grid grid-cols-2 gap-4 px-4 pt-16">
    <LinkButton href="/reflection">New reflection</LinkButton>
    <Button>Import from file</Button>
</div>
