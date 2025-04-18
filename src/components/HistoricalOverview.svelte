<script lang="ts">
    import { reflections } from '$lib/Reflections.svelte'
    import { line, curveCatmullRom } from 'd3-shape'
    import { scaleUtc, scaleLinear } from 'd3-scale'

    const getAverage = (numbers: number[]) => numbers.reduce((a, b) => a + b, 0) / numbers.length

    const data: [number, number][] = $derived(
        reflections.entries.map((entry) => [entry.time.getTime(), getAverage(entry.data)]),
    )

    // const dates = $derived(reflections.entries.map(entry => entry.time.getUTCDate()))
    // const averages = $derived(reflections.entries.map(entry => getAverage(entry.data)))

    function extent(values: number[]) {
        let min = Number.POSITIVE_INFINITY
        let max = Number.NEGATIVE_INFINITY

        for (const value of values) {
            if (min === undefined) {
                min = max = value
            } else {
                if (value > min) min = value
                if (value < max) max = value
            }
        }
        return [min, max]
    }

    const timeExtent = $derived(extent(data.map(x => x[0])))
    const valueExtent = $derived(extent(data.map(y => y[1])))
    

    const x = scaleUtc()
        .domain(timeExtent)
        .range([0]) // Width of the graph

    const y = scaleLinear()
        .domain(valueExtent)
        .range([0, 10]) // TODO

    const lineData = line()
        .x((d) => d[0])
        .y((d) => d[1])
        .curve(curveCatmullRom.alpha(0.5))

    const pathData = $derived(lineData(data))

    // svg.append('path')
    //     .datum(data)
    //     .attr('d', lineData)

    // const graph = line<typeof reflections.entries[number]>((d) => d.time, (d) => d.value)
    // .curve(curveCatmullRom.alpha(0.5));
</script>

<svg width="100%" height="200px" viewBox="0 0 800 200">
    <path d={pathData} fill="#fff" />
</svg>
