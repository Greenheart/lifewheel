<script lang="ts" module>
    import type { Snippet } from 'svelte'
</script>

<script lang="ts">
    type Props = {
        id: string
        name: string
        disabled: boolean
        checked: boolean
        class?: string
        label: Snippet
    }
    let {
        id,
        name,
        disabled = false,
        checked = $bindable(),
        class: className = '',
        label,
    }: Props = $props()
</script>

<label class={['toggle', className]} for={name}>
    <input type="checkbox" {name} {id} {disabled} bind:checked />
    <span class="toggle-track">
        <span class="toggle-indicator"></span>
    </span>
    {@render label()}
</label>

<style>
    .toggle {
        display: flex;
        align-items: center;
        border-radius: calc(infinity * 1px);
    }

    .toggle input {
        clip-path: inset(50%);
        position: absolute;
        overflow: hidden;
        white-space: nowrap;
        height: 1px;
        width: 1px;
    }

    .toggle input:not([disabled]):focus-visible + .toggle-track {
        /* Use default browser focus styles for keyboard users */
        outline: 5px auto Highlight;
        outline: 5px auto -webkit-focus-ring-color;
    }

    .toggle input:disabled + .toggle-track {
        cursor: not-allowed;
        opacity: 75%;
    }

    .toggle-track {
        border: 1px solid transparent;
        position: relative;
        margin-right: 12px;
        display: flex;
        cursor: pointer;
        flex-shrink: 0;
        border-radius: calc(infinity * 1px);
        background-color: color-mix(in oklab, var(--color-emerald-400) 20%, transparent);
        height: 30px;
        width: 60px;
    }

    .toggle-indicator {
        position: absolute;
        display: flex;
        width: 24px;
        height: 24px;
        align-items: center;
        justify-content: center;
        border-radius: calc(infinity * 1px);
        background: var(--color-white);
        transition: all 200ms var(--tw-ease, var(--default-transition-timing-function));
        bottom: 2px;
        left: 2px;
    }

    .toggle input:checked + .toggle-track .toggle-indicator {
        translate: 30px;
        background: var(--color-white);
    }

    .toggle input:checked + .toggle-track {
        background-color: var(--color-emerald-500);
    }
</style>
