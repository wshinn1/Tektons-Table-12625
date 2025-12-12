import { Node, mergeAttributes } from "@tiptap/core"

export interface IframeOptions {
  allowFullscreen: boolean
  HTMLAttributes: Record<string, any>
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    iframe: {
      setIframe: (options: { src: string; width?: string; height?: string }) => ReturnType
    }
  }
}

export const Iframe = Node.create<IframeOptions>({
  name: "iframe",

  group: "block",

  atom: true,

  addOptions() {
    return {
      allowFullscreen: true,
      HTMLAttributes: {
        class: "iframe-wrapper",
      },
    }
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: "100%",
      },
      height: {
        default: "640",
      },
      frameborder: {
        default: 0,
      },
      allowfullscreen: {
        default: this.options.allowFullscreen,
        parseHTML: () => this.options.allowFullscreen,
        renderHTML: (attributes) => {
          return {
            allowfullscreen: attributes.allowfullscreen,
            allow: "fullscreen",
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: "iframe",
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      { class: "iframe-container" },
      ["iframe", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)],
    ]
  },

  addCommands() {
    return {
      setIframe:
        (options: { src: string; width?: string; height?: string }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
})
