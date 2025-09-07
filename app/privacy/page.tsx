"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, Eye, Database } from "lucide-react"
import AdSlot from "@/components/SafeAdSlot"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Ad Slot - Header Position */}
      <AdSlot position="header" className="max-w-7xl mx-auto px-4 py-2" />

      <div className="max-w-4xl mx-auto p-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Privacy Policy</h1>
          <p className="text-lg text-slate-600">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-slate-500 mt-2">Last updated: January 1, 2025</p>
        </div>

        {/* Quick Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardHeader>
              <Lock className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Data Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                We use industry-standard security measures to protect your personal information.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Eye className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Transparency</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                We're transparent about what data we collect and how we use it.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Database className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Minimal Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                We only collect data that's necessary to provide our gaming services.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Privacy Policy Content */}
        <Card>
          <CardContent className="p-8 prose prose-slate max-w-none">
            <h2>1. Information We Collect</h2>
            <p>
              When you use our gaming platform, we may collect the following types of information:
            </p>
            
            <h3>Personal Information</h3>
            <ul>
              <li>Email address (if you choose to create an account)</li>
              <li>Username and display name</li>
              <li>Game preferences and favorites</li>
            </ul>

            <h3>Automatic Information</h3>
            <ul>
              <li>IP address and browser information</li>
              <li>Game usage statistics and performance data</li>
              <li>Device type and operating system</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul>
              <li>To provide and improve our gaming services</li>
              <li>To personalize your gaming experience</li>
              <li>To communicate with you about updates and new games</li>
              <li>To analyze usage patterns and improve our platform</li>
              <li>To prevent fraud and ensure platform security</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
            </p>
            <ul>
              <li>With service providers who help us operate our platform</li>
              <li>When required by law or legal process</li>
              <li>To protect our rights, property, or safety</li>
              <li>With your explicit consent</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>

            <h2>5. Cookies and Tracking</h2>
            <p>
              Our platform uses cookies and similar technologies to enhance your gaming experience. You can control cookie settings through your browser, but disabling cookies may affect some features.
            </p>

            <h2>6. Children's Privacy</h2>
            <p>
              Our platform is designed to be family-friendly. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
            </p>

            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and personal data</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability</li>
            </ul>

            <h2>8. International Users</h2>
            <p>
              Our services are available globally. By using our platform, you consent to the transfer of your information to our servers, which may be located outside your country of residence.
            </p>

            <h2>9. Policy Updates</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of significant changes through our platform or via email if you have an account.
            </p>

            <h2>10. Contact Information</h2>
            <p>
              If you have questions about this privacy policy or our privacy practices, please contact us through our support page or at privacy@gameplatform.com.
            </p>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold mb-4">Have Questions About Your Privacy?</h3>
            <p className="text-gray-600 mb-4">
              We're here to help. Contact us if you have any questions about how we handle your personal information.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/contact">
                <Button>Contact Support</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Back to Games</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}