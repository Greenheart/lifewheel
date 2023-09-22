import type { LifewheelState, LifewheelStep, ProtocolVersion, ReflectionStep, TextStep } from './types'

export const lifewheelSteps: Partial<LifewheelStep>[] = [
    {
        title: 'Love and Relationships',
        text: 'How satisfied are you with your romantic life right now? Consider how you feel about things like intimacy, independence, and emotional/intellectual connection.',
    },
    {
        title: 'Health and Fitness',
        text: 'How satisfied are you with your mental and physical health right now? Do you sleep well? Are you exercising enough? Is your diet balanced and healthy?',
    },
    {
        title: 'Engagements and Education',
        text: 'How satisfied are you with your job, leisure engagements and/or school situation? Are you making meaningful contributions to a thriving future? Is your situation affecting your mental or physical health?',
    },
    {
        title: 'Inner Development',
        text: 'How satisfied are you with your personal growth? Are you developing new skills, learning new things or growing new relationships? Are you satisfied with your efforts?',
    },
    {
        title: 'Family',
        text: 'How satisfied are you with your family relationships right now? How are your connections with siblings, parents, children, cousins, aunts and uncles, or old friends?',
    },
    {
        title: 'Friends and Social Life',
        text: 'How satisfied are you with your social life right now? Are you attending social gatherings? Are you well-connected to your friends? Is your social life increasing or decreasing your stress levels?',
    },
    {
        title: 'Fun and Recreation',
        text: 'How satisfied are you with your free time? Do you have enough fun? Do you do things that make you smile and feel good? Do your hobbies affect your mental health in a good way?',
    },
    {
        title: 'Finances',
        text: 'How satisfied are you with your current finances? Are you saving enough? Do you have full control of where your money is going? Does your money situation make you stressed or worried?',
    },
]

/**
 * Colors for each dimension of the lifewheel.
 */
export const colors = [
    {
        rgb: 'rgb(220 38 38)',
        fill: 'fill-red-600',
        from: 'from-red-600',
        to: 'to-red-600/75',
        text: 'text-red-600',
    },
    {
        rgb: 'rgb(251 146 60)',
        fill: 'fill-orange-400',
        from: 'from-orange-400',
        to: 'to-orange-400/75',
        text: 'text-orange-400',
    },
    {
        rgb: 'rgb(250 204 21)',
        fill: 'fill-yellow-400',
        from: 'from-yellow-400',
        to: 'to-yellow-400/75',
        text: 'text-yellow-400',
    },
    {
        rgb: 'rgb(52 211 153)',
        fill: 'fill-emerald-400',
        from: 'from-emerald-400',
        to: 'to-emerald-400/75',
        text: 'text-emerald-400',
    },
    {
        rgb: 'rgb(125 211 252)',
        fill: 'fill-sky-300',
        from: 'from-sky-300',
        to: 'to-sky-300/75',
        text: 'text-sky-300',
    },
    {
        rgb: 'rgb(96 165 250)',
        fill: 'fill-blue-400',
        from: 'from-blue-400',
        to: 'to-blue-400/75',
        text: 'text-blue-400',
    },
    {
        rgb: 'rgb(168 85 247)',
        fill: 'fill-purple-500',
        from: 'from-purple-500',
        to: 'to-purple-500/75',
        text: 'text-purple-500',
    },
    {
        rgb: 'rgb(244 114 182)',
        fill: 'fill-pink-400',
        from: 'from-pink-400',
        to: 'to-pink-400/75',
        text: 'text-pink-400',
    },
]

/**
 * Lifewheel icons
 */
export const icons = [
    'm12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
    'M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5s5-2.2 5-5s-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5s-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4l.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4c0 .6.2 1.1.6 1.4L11 14v5h2v-6.2l-2.2-2.3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5s5-2.2 5-5s-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5s-1.6 3.5-3.5 3.5z',
    'M4 21q-.825 0-1.413-.588T2 19V8q0-.825.588-1.413T4 6h4V4q0-.825.588-1.413T10 2h4q.825 0 1.413.588T16 4v2h4q.825 0 1.413.588T22 8v11q0 .825-.588 1.413T20 21H4Zm6-15h4V4h-4v2Z',
    'M20.5 11H19V7a2 2 0 0 0-2-2h-4V3.5A2.5 2.5 0 0 0 10.5 1A2.5 2.5 0 0 0 8 3.5V5H4a2 2 0 0 0-2 2v3.8h1.5c1.5 0 2.7 1.2 2.7 2.7c0 1.5-1.2 2.7-2.7 2.7H2V20a2 2 0 0 0 2 2h3.8v-1.5c0-1.5 1.2-2.7 2.7-2.7c1.5 0 2.7 1.2 2.7 2.7V22H17a2 2 0 0 0 2-2v-4h1.5a2.5 2.5 0 0 0 2.5-2.5a2.5 2.5 0 0 0-2.5-2.5Z',
    'M12 12.75c1.63 0 3.07.39 4.24.9c1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73c1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1c-.99 0-1.93.21-2.78.58A2.01 2.01 0 0 0 0 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2s-2 .9-2 2s.9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85A6.95 6.95 0 0 0 20 14c-.39 0-.76.04-1.13.1c.4.68.63 1.46.63 2.29V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3s-3-1.34-3-3s1.34-3 3-3z',
    'M2 17V3q0-.425.288-.713T3 2h13q.425 0 .713.288T17 3v9q0 .425-.288.713T16 13H6l-4 4Zm5 1q-.425 0-.713-.288T6 17v-2h13V6h2q.425 0 .713.288T22 7v15l-4-4H7Z',
    'm13.13 14.56l1.43-1.43L21 19.57L19.57 21l-6.44-6.44m4.29-5.73l2.86-2.86C16.33 2 9.93 2 6 5.95c3.91-1.3 8.29-.25 11.42 2.88M5.95 6C2 9.93 2 16.33 5.97 20.28l2.86-2.86C5.7 14.29 4.65 9.91 5.95 6m.02-.04l-.01.01C5.58 9 7.13 12.85 10.26 16L16 10.26c-3.14-3.13-7-4.68-10.03-4.3Z',
    'M11.8 10.9c-2.27-.59-3-1.2-3-2.15c0-1.09 1.01-1.85 2.7-1.85c1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61c0 2.31 1.91 3.46 4.7 4.13c2.5.6 3 1.48 3 2.41c0 .69-.49 1.79-2.7 1.79c-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55c0-2.84-2.43-3.81-4.7-4.4z',
]

export const introSteps: Partial<TextStep>[] = [
    {
        title: 'Reflect on Your Life Balance',
        text: 'Rate your satisfaction of eight different areas of your life on a scale from 1 - 10 to gain a better insight into your strengths & weaknesses.',
    },
]

export const outroSteps: Partial<TextStep>[] = [
    {
        title: 'Well done!',
        text: 'Take a moment to reflect on the life wheel above.\n\nWhat does the result tell you about your situation and how does it affect your mental wellbeing?',
    },
]

/**
 * This defines the visible texts for each step of the reflection exercise.
 */
export const allReflectionSteps = [
    introSteps.map((step) => {
        step.phase = 'intro'
        return step
    }),
    lifewheelSteps.map((step, i) => {
        step.phase = 'reflection'
        step.colors = colors[i]
        step.i = i
        return step
    }),
    outroSteps.map((step) => {
        step.phase = 'outro'
        return step
    }),
].flat() as ReflectionStep[]

/**
 * Default value when adding a new dimension to the lifewheel.
 */
export const INITIAL_LEVEL = 6

export const MIN_LEVEL = 1
export const MAX_LEVEL = 10

/**
 * By starting all values at 0, we can keep the dimensions hidden until they become active for the first time.
 * This is key in enabling the tweened motion.
 */
export const INITIAL_LIFEWHEEL_STATE: LifewheelState = [0, 0, 0, 0, 0, 0, 0, 0]

/**
 * If the need arises, we could abstract away implementation details with a common public API surface
 */
export const PROTOCOL_VERSIONS = {
    1: {},
    2: {}
}

export const CURRENT_PROTOCOL_VERSION: ProtocolVersion = 2

export const REPO_URL = 'https://github.com/Greenheart/lifewheel'
