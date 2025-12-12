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
        parseHTML: (element) => {
          return element.hasAttribute("allowfullscreen") || element.hasAttribute("allow")
        },
        renderHTML: (attributes) => {
          if (!attributes.allowfullscreen) {
            return {}
          }
          return {
            allowfullscreen: "",
            allow: "fullscreen",
          }
        },
      },
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => {
          if (!attributes.style) {
            return {}
          }
          return {
            style: attributes.style,
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
    const attrs = { ...HTMLAttributes }
    if (attrs.height && !attrs.height.toString().includes("px") && !attrs.height.toString().includes("%")) {
      attrs.height = `${attrs.height}px`
    }

    return [
      "div",
      { class: "iframe-container", style: "width: 100%; overflow: hidden;" },
      ["iframe", mergeAttributes(this.options.HTMLAttributes, attrs)],
    ]
  },

  addCommands() {
    return {
      setIframe:
        (options: { src: string; width?: string; height?: string }) =>
        ({ commands }) => {
          console.log("[v0] setIframe command called with:", options)
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
})
