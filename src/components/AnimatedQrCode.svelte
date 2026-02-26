<script lang="ts">
    import { send } from '@lo-fi/qr-data-sync'

    async function test() {
        await send(
            {
                data: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sed dui urna. Vivamus sed quam sit amet libero volutpat luctus. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Maecenas ut metus scelerisque massa cursus mollis ac vel ligula. Phasellus venenatis, nisi eu faucibus blandit, nulla lorem interdum quam, vel porttitor urna elit sit amet mi. In sit amet consequat massa. Nam aliquet, ligula eu commodo luctus, libero elit consequat erat, eu sodales tellus ipsum eu ligula. Mauris viverra pretium ante nec dapibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas rhoncus rhoncus risus vel placerat. Ut odio leo, rutrum a urna id, pellentesque bibendum nisi. Donec molestie tempus sapien, vel mollis nibh dictum et. Vestibulum ornare porttitor quam pharetra facilisis. Sed non risus nec ex tempor tristique a et mi. Sed posuere ex in dolor interdum, nec consectetur enim euismod. ',
            },
            'testId',
            {
                maxFramesPerSecond: 2
            }
        )
    }
</script>

<button class="bg-blue-200 text-white btn-primary" onclick={test}>click me</button>
<div class="aspect-square w-full" id="testId"></div>
