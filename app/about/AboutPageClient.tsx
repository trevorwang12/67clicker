"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Target, Heart, Gamepad2 } from "lucide-react"
import AdSlot from "@/components/SafeAdSlot"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { aboutManager, type AboutContent } from '@/lib/about-manager'

export default function AboutPageClient() {
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const loadAboutContent = async () => {
      const content = await aboutManager.getContent()
      setAboutContent(content)
    }
    loadAboutContent()
  }, [])

  // Render custom HTML sections
  const renderCustomHtmlSections = () => {
    if (!Array.isArray(aboutContent?.customHtmlSections) || aboutContent.customHtmlSections.length === 0) return null
    
    return (
      <>
        {aboutContent.customHtmlSections
          .filter(section => section.isVisible)
          .map((section) => (
            <div key={section.id} className="mb-8">
              <div className="max-w-4xl mx-auto">
                {section.title && (
                  <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
                    {section.title}
                  </h2>
                )}
                <div 
                  className="custom-html-content"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
            </div>
          ))
        }
      </>
    )
  }

  // Get icon component
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Target': return Target
      case 'Users': return Users
      case 'Heart': return Heart
      case 'Gamepad2': return Gamepad2
      default: return Gamepad2
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Ad Slot - Header Position */}
      <AdSlot position="header" className="max-w-7xl mx-auto px-4 py-2" />

      <div className="max-w-4xl mx-auto p-4 py-8">
        {/* Hero Section */}
        {aboutContent?.hero?.isVisible && (
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              {(() => {
                const IconComponent = getIconComponent(aboutContent.hero.icon)
                return <IconComponent className="w-12 h-12 text-slate-600" />
              })()}
              <h1 className="text-4xl font-bold text-slate-800">{aboutContent.hero.title}</h1>
            </div>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {aboutContent.hero.subtitle}
            </p>
          </div>
        )}

        {/* Mission Cards */}
        {aboutContent?.mission?.isVisible && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">{aboutContent.mission.title}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {aboutContent.mission.cards.mission.isVisible && (
                <Card className="text-center">
                  <CardHeader>
                    {(() => {
                      const IconComponent = getIconComponent(aboutContent.mission.cards.mission.icon)
                      return <IconComponent className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    })()}
                    <CardTitle>{aboutContent.mission.cards.mission.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      {aboutContent.mission.cards.mission.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {aboutContent.mission.cards.team.isVisible && (
                <Card className="text-center">
                  <CardHeader>
                    {(() => {
                      const IconComponent = getIconComponent(aboutContent.mission.cards.team.icon)
                      return <IconComponent className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    })()}
                    <CardTitle>{aboutContent.mission.cards.team.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      {aboutContent.mission.cards.team.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {aboutContent.mission.cards.values.isVisible && (
                <Card className="text-center">
                  <CardHeader>
                    {(() => {
                      const IconComponent = getIconComponent(aboutContent.mission.cards.values.icon)
                      return <IconComponent className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    })()}
                    <CardTitle>{aboutContent.mission.cards.values.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      {aboutContent.mission.cards.values.description}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* About Content */}
        {aboutContent?.about?.isVisible && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">{aboutContent.about.title}</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate max-w-none">
              <p className="mb-4">
                {aboutContent.about.content.description}
              </p>
              
              <h3 className="text-lg font-semibold mb-3">{aboutContent.about.content.features.title}</h3>
              <ul className="mb-4 space-y-2">
                {aboutContent.about.content.features.items.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className={`w-2 h-2 bg-${item.color}-500 rounded-full mt-2 flex-shrink-0`}></span>
                    <span><strong>{item.title}</strong>: {item.description}</span>
                  </li>
                ))}
              </ul>

              <h3 className="text-lg font-semibold mb-3">{aboutContent.about.content.vision.title}</h3>
              <p className="mb-4">
                {aboutContent.about.content.vision.content}
              </p>

              <h3 className="text-lg font-semibold mb-3">{aboutContent.about.content.contact.title}</h3>
              <p>
                {aboutContent.about.content.contact.content}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Custom HTML Sections */}
        {renderCustomHtmlSections()}

        {/* CTA Section */}
        {aboutContent?.cta?.isVisible && (
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">{aboutContent.cta.title}</h3>
              <p className="mb-6 text-blue-100">
                {aboutContent.cta.description}
              </p>
              <Link href={aboutContent.cta.buttonLink}>
                <Button className="bg-white text-blue-600 hover:bg-blue-50">
                  <Gamepad2 className="w-4 h-4 mr-2" />
                  {aboutContent.cta.buttonText}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}