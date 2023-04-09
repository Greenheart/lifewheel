<script lang="ts">
    // Icon from https://heroicons.com/ - MIT License
    import { cx } from '$lib/utils'
    let className = ''
    export { className as class }
</script>

<svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class={cx('h-6 w-6', className)}
>
    <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
</svg>
