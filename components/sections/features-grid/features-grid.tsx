"use client"

import * as Icons from "lucide-react"

export default function FeaturesGrid({ props }: { props: any }) {
  const { headline, subheadline, features, backgroundColor = "bg-accent/5" } = props

  return (
    <section className={`py-20 ${backgroundColor}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">{headline}</h2>
          {subheadline && <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">{subheadline}</p>}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features?.map((feature: any, i: number) => {
            const IconComponent = (Icons as any)[feature.icon] || Icons.Mail
            return (
              <div key={i} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <IconComponent className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground mb-3">{feature.description}</p>
                {feature.highlight && <p className="text-sm text-accent font-semibold">{feature.highlight}</p>}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
