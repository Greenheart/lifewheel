import MdiHeart from '~icons/mdi/heart'
import MaterialSymbolsDirectionsBikeRounded from '~icons/material-symbols/directions-bike-rounded'
import MaterialSymbolsWork from '~icons/material-symbols/work'
import MdiPuzzle from '~icons/mdi/puzzle'
import MaterialSymbolsGroupsRounded from '~icons/material-symbols/groups-rounded'
import MdiConversation from '~icons/mdi/conversation'
import MdiUmbrellaBeach from '~icons/mdi/umbrella-beach'
import MdiDollar from '~icons/mdi/dollar'

import type { LifewheelState, LifewheelStep, ReflectionStep, TextStep } from './types'

export const LIFEWHEEL_ICONS = [
    MdiHeart,
    MaterialSymbolsDirectionsBikeRounded,
    MaterialSymbolsWork,
    MdiPuzzle,
    MaterialSymbolsGroupsRounded,
    MdiConversation,
    MdiUmbrellaBeach,
    MdiDollar,
]

export const APP_NAME = 'Life Wheel'
export const APP_TAGLINE = 'Reflect on Your Life Balance'

export const APP_DESCRIPTION =
    'Reflect on your life balance. Visualise your progress over time and reconnect to what matters in your life. Make reflection a habit and gain new insights for your wellbeing.'

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

export const REPO_URL = 'https://github.com/Greenheart/lifewheel'
