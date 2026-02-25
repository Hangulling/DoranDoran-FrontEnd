import React from 'react'

import Card1 from '../assets/onboarding/casual.svg'
import Card2 from '../assets/onboarding/dating.svg'
import Card3 from '../assets/onboarding/workplace.svg'
import Card4 from '../assets/onboarding/school.svg'

import Entertainment from '../assets/onboarding/entertainment.svg'
import Food from '../assets/onboarding/food.svg'
import Daily from '../assets/onboarding/daily.svg'
import Fb from '../assets/onboarding/fb.svg'
import Sports from '../assets/onboarding/sports.svg'
import Travel from '../assets/onboarding/travel.svg'

export interface OptionItem {
  value: string
  label?: React.ReactNode
  subLabel?: string
  image?: string
  level?: number
}

export interface OnboardingStepData {
  id: number
  title: string
  description?: string
  type: 'single' | 'multiple'
  layout?: 'list' | 'grid'
  hasEtc?: boolean
  options: OptionItem[]
}

export const ONBOARDING_STEPS: OnboardingStepData[] = [
  {
    id: 1,
    title: 'How did you hear\nabout Koach',
    type: 'single',
    layout: 'list',
    hasEtc: true,
    options: [
      { value: 'ads', label: 'ads' },
      { value: 'instagram_contents', label: 'Instagram contents' },
      { value: 'instagram_reels', label: 'Instagram reels' },
      { value: 'facebook_contents', label: 'Facebook contents' },
      { value: 'friend', label: 'Recommended by a friend' },
    ],
  },
  {
    id: 2,
    title: 'How well do you\nknow Korean?',
    type: 'single',
    layout: 'list',
    hasEtc: false,
    options: [
      {
        value: '1',
        label: (
          <span>
            <span className="text-gray-400 text-[12px] mr-2.5">lv.1</span>
            Just getting started
          </span>
        ),
      },
      {
        value: '2',
        label: (
          <span>
            <span className="text-gray-400 text-[12px] mr-2.5">lv.2</span>
            Know some basic words
          </span>
        ),
      },
      {
        value: '3',
        label: (
          <span>
            <span className="text-gray-400 text-[12px] mr-2.5">lv.3</span>
            Can hold simple conversations
          </span>
        ),
      },
      {
        value: '4',
        label: (
          <span>
            <span className="text-gray-400 text-[12px] mr-2.5">lv.4</span>
            Comfortable with many topics
          </span>
        ),
      },
      {
        value: '5',
        label: (
          <span>
            <span className="text-gray-400 text-[12px] mr-2.5">lv.5</span>
            Comfortable discussing specific topics
          </span>
        ),
      },
    ],
  },
  {
    id: 3,
    title: 'What is your purpose\nfor learning Korean?',
    description: '* Multiple choices available',
    type: 'multiple',
    layout: 'grid',
    hasEtc: true,
    options: [
      {
        value: 'casual_chats',
        label: 'Casual chats with Korean friends',
        image: Card1,
      },
      {
        value: 'dating',
        label: 'Natural phrases for dating',
        image: Card2,
      },
      {
        value: 'workplace',
        label: 'Workplace communication',
        image: Card3,
      },
      {
        value: 'school',
        label: 'Talking with seniors at school',
        image: Card4,
      },
    ],
  },
  {
    id: 4,
    title: 'What do you want\nto talk about?',
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
  },
  {
    id: 5,
    title: 'Do you want to get\nchat notifications?',
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
        subLabel: "No worries—I'll stay quiet… for now.",
      },
    ],
  },
]
