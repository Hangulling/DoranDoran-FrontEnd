import React from 'react'
import Icon1 from '../assets/onboarding/firstIcon.svg?react'
import Icon2 from '../assets/onboarding/secondIcon.svg?react'
import Icon3 from '../assets/onboarding/thirdIcon.svg?react'
import Icon4 from '../assets/onboarding/fourthIcon.svg?react'
import Icon5 from '../assets/onboarding/fifthIcon.svg?react'

import Card1 from '../assets/onboarding/card1.png'
import Card2 from '../assets/onboarding/card2.png'
import Card3 from '../assets/onboarding/card3.png'
import Card4 from '../assets/onboarding/card4.png'

import Level1 from '../assets/onboarding/level1.svg'
import Level2 from '../assets/onboarding/level2.svg'
import Level3 from '../assets/onboarding/level3.svg'
import Level4 from '../assets/onboarding/level4.svg'
import Level5 from '../assets/onboarding/level5.svg'

import Entertainment from '../assets/onboarding/entertainment.svg'
import Food from '../assets/onboarding/food.svg'
import Daily from '../assets/onboarding/daily.svg'
import Fb from '../assets/onboarding/fb.svg'
import Sports from '../assets/onboarding/sports.svg'
import Travel from '../assets/onboarding/travel.svg'

export interface OptionItem {
  value: string
  label?: string
  subLabel?: string
  image?: string
  level?: number
}

export interface OnboardingStepData {
  id: number
  title: React.ReactNode
  description?: string
  type: 'single' | 'multiple'
  layout?: 'list' | 'grid'
  hasEtc?: boolean
  options: OptionItem[]
  icon: React.FC<React.SVGProps<SVGSVGElement>>
}

export const ONBOARDING_STEPS: OnboardingStepData[] = [
  {
    id: 1,
    title: (
      <>
        'How did you hear{'\n'}about
        <span className="text-primary-300"> Koach</span>?'
      </>
    ),
    type: 'single',
    layout: 'list',
    hasEtc: true,
    options: [
      { value: 'ads', label: 'ads' },
      { value: 'Instagram contents', label: 'Instagram contents' },
      { value: 'Instagram reels', label: 'Instagram reels' },
      { value: 'Facebook contents', label: 'Facebook contents' },
      { value: 'Recommended by a friend', label: 'Recommended by a friend' },
    ],
    icon: Icon1,
  },
  {
    id: 2,
    title: (
      <>
        How well do you{'\n'}
        <span className="text-primary-300">know Korean?</span>
      </>
    ),
    type: 'single',
    layout: 'list',
    hasEtc: false,
    options: [
      { value: 'level1', label: 'Just getting started', image: Level1 },
      { value: 'level2', label: 'Know some basic words', image: Level2 },
      {
        value: 'level3',
        label: 'Can hold simple conversations',
        image: Level3,
      },
      { value: 'level4', label: 'Comfortable with many topics', image: Level4 },
      {
        value: 'level5',
        label: 'Comfortable discussing specific topics',
        image: Level5,
      },
    ],
    icon: Icon2,
  },
  {
    id: 3,
    title: (
      <>
        What is your <span className="text-primary-300">purpose</span>
        {'\n'}for learning Korean?
      </>
    ),
    description: '* Multiple choices available',
    type: 'multiple',
    layout: 'grid',
    hasEtc: true,
    options: [
      { value: 'Casual chats with Korean friends', image: Card1 },
      { value: 'Natural phrases for dating', image: Card2 },
      { value: 'Workplace communication', image: Card3 },
      { value: 'Talking with seniors at school', image: Card4 },
    ],
    icon: Icon3,
  },
  {
    id: 4,
    title: (
      <>
        What do you want{'\n'}to
        <span className="text-primary-300"> talk about?</span>
      </>
    ),
    description: '* Multiple choices available',
    type: 'multiple',
    layout: 'list',
    hasEtc: false,
    options: [
      {
        value: 'entertainment',
        label: 'Entertainment',
        subLabel: 'game, movie, music, drama etc.',
        image: Entertainment,
      },
      {
        value: 'food',
        label: 'Food',
        subLabel: 'muk bang, recipe, cooking etc.',
        image: Food,
      },
      {
        value: 'daily',
        label: 'Daily',
        subLabel: 'thinking, chatter',
        image: Daily,
      },
      {
        value: 'fb',
        label: 'F&B',
        subLabel: 'fashion, beauty',
        image: Fb,
      },
      {
        value: 'sports',
        label: 'Sports',
        subLabel: 'climbing, running, swimming etc.',
        image: Sports,
      },
      {
        value: 'travel',
        label: 'Travel',
        subLabel: 'global, mountain, sea, camping etc.',
        image: Travel,
      },
    ],
    icon: Icon4,
  },
  {
    id: 5,
    title: (
      <>
        Do you want to get{'\n'}
        <span className="text-primary-300">chat notifications?</span>
      </>
    ),
    description: 'We’ll send you a message to start the chat.',
    type: 'single',
    layout: 'list',
    hasEtc: false,
    options: [
      {
        value: 'yes',
        label: 'Yes, please',
        subLabel: 'I’ll give you a friendly poke when it’s time.',
      },
      {
        value: 'no',
        label: 'Not now',
        subLabel: "No worries—I'll stay quiet… for now 👀",
      },
    ],
    icon: Icon5,
  },
]
