export type ManagerStepId =
  | 'intro'
  | 'inconvenience'
  | 'suggestions'
  | 'error'
  | 'feedback'
  | 'other'
  | 'completed'

export type ManagerAction = 'open_sheet' | 'reload' | 'navigate_main'

export interface ScenarioOption {
  label: string
  nextStepId?: ManagerStepId
  action?: ManagerAction
}

export interface ScenarioStep {
  message: string[]
  options: ScenarioOption[]
  completedMessages?: Partial<Record<ManagerStepId, string[]>>
}

export const MANAGER_DATA: Record<ManagerStepId, ScenarioStep> = {
  intro: {
    message: [
      'Hi! 😊',
      'What would you like to share?',
      'Please choose one option below.',
    ],
    options: [
      {
        label: 'Inconvenience while using the service',
        nextStepId: 'inconvenience',
      },
      { label: 'Feature suggestions and ideas', nextStepId: 'suggestions' },
      { label: 'Bug / Error', nextStepId: 'error' },
      { label: 'Chatbot feedback', nextStepId: 'feedback' },
      { label: 'Other inquiries', nextStepId: 'other' },
    ],
  },

  inconvenience: {
    message: [
      'Sorry for the inconvenience 🙏',
      'Please tell me what felt uncomfortable.',
    ],
    options: [{ label: 'Contact us', action: 'open_sheet' }],
  },

  suggestions: {
    message: [
      'I’d love to hear your ideas ✨',
      "Let me know any features you'd like improved or added.",
    ],
    options: [{ label: 'Contact us', action: 'open_sheet' }],
  },

  error: {
    message: ['Sorry for the trouble 🙏', 'Please tell me what went wrong.'],
    options: [{ label: 'Contact us', action: 'open_sheet' }],
  },

  feedback: {
    message: [
      'Sorry if anything felt uncomfortable 🙏',
      'Let me know the specific part so I can improve quickly.',
    ],
    options: [{ label: 'Contact us', action: 'open_sheet' }],
  },

  other: {
    message: [
      'Other Feedback',
      'Feel free to share anything 🙂',
      'Leave your email if you need a reply.',
    ],
    options: [{ label: 'Contact us', action: 'open_sheet' }],
  },

  completed: {
    completedMessages: {
      inconvenience: [
        'Thanks for letting us know!',
        'We’ll check this and try to fix it soon.',
      ],
      suggestions: [
        'Thanks for the great idea!',
        'We’ll review it with our team.',
      ],
      error: [
        'Thanks for reporting this!',
        'We’ll check it as soon as possible.',
      ],
      feedback: ['Thanks for your feedback!', 'It really helps us improve.'],
      other: ['Thanks for reaching out!', 'We’ll get back to you if needed.'],
    },

    message: ['Got it! 💌', 'We’ll get back to you by email shortly!'],
    options: [
      {
        label: 'reload',
        action: 'reload',
        nextStepId: 'intro',
      },
      {
        label: 'Go Home',
        action: 'navigate_main',
      },
    ],
  },
}
