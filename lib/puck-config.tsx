import { Config } from '@measured/puck'

export const config: Config = {
  components: {
    HeadingBlock: {
      fields: {
        children: {
          type: 'text',
        },
        level: {
          type: 'select',
          options: [
            { label: 'H1', value: 'h1' },
            { label: 'H2', value: 'h2' },
            { label: 'H3', value: 'h3' },
          ],
        },
      },
      defaultProps: {
        children: 'Heading',
        level: 'h1',
      },
      render: ({ children, level }) => {
        const Tag = level as 'h1' | 'h2' | 'h3'
        return <Tag className="font-bold my-4">{children}</Tag>
      },
    },
    TextBlock: {
      fields: {
        text: {
          type: 'textarea',
        },
      },
      defaultProps: {
        text: 'Enter your text here',
      },
      render: ({ text }) => {
        return <p className="my-4">{text}</p>
      },
    },
    ButtonBlock: {
      fields: {
        label: {
          type: 'text',
        },
        href: {
          type: 'text',
        },
      },
      defaultProps: {
        label: 'Click me',
        href: '#',
      },
      render: ({ label, href }) => {
        return (
          <a
            href={href}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {label}
          </a>
        )
      },
    },
  },
}
