"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Shield, AlertCircle, CheckCircle } from "lucide-react"
import AdSlot from "@/components/SafeAdSlot"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Ad Slot - Header Position */}
      <AdSlot position="header" className="max-w-7xl mx-auto px-4 py-2" />

      <div className="max-w-4xl mx-auto p-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Terms of Service</h1>
          <p className="text-lg text-slate-600">
            Please read these terms carefully before using our gaming platform.
          </p>
          <p className="text-sm text-slate-500 mt-2">Last updated: January 1, 2025</p>
        </div>

        {/* Quick Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardHeader>
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Fair Use</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Use our platform responsibly and respect other users' experience.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Safe Gaming</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                We maintain a safe, family-friendly gaming environment for all users.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <CardTitle className="text-lg">User Responsibility</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Users are responsible for their actions and account security.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Terms Content */}
        <Card>
          <CardContent className="p-8 prose prose-slate max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using our gaming platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              Our platform provides access to a curated collection of browser-based games. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.
            </p>

            <h2>3. User Accounts</h2>
            <h3>Account Creation</h3>
            <ul>
              <li>You may create an account to save your progress and preferences</li>
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You must be at least 13 years old to create an account</li>
            </ul>

            <h3>Account Security</h3>
            <ul>
              <li>You are responsible for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>We are not liable for losses due to unauthorized account access</li>
            </ul>

            <h2>4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the service for any illegal or unauthorized purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Upload or transmit malicious code or harmful content</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Violate any applicable local, state, or international law</li>
            </ul>

            <h2>5. Intellectual Property</h2>
            <h3>Our Content</h3>
            <p>
              All content on our platform, including games, graphics, logos, and text, is owned by us or licensed to us. You may not copy, modify, or distribute this content without permission.
            </p>

            <h3>Game Content</h3>
            <p>
              Individual games may have their own copyright and licensing terms. Respect the intellectual property rights of game developers and publishers.
            </p>

            <h2>6. Privacy</h2>
            <p>
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our service.
            </p>

            <h2>7. Disclaimers</h2>
            <h3>Service Availability</h3>
            <p>
              We strive to maintain service availability but cannot guarantee uninterrupted access. The service is provided "as is" without warranties of any kind.
            </p>

            <h3>Game Content</h3>
            <p>
              We are not responsible for the content, quality, or functionality of individual games. Games are provided by third-party developers.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of the service.
            </p>

            <h2>9. Termination</h2>
            <p>
              We may terminate or suspend your access to the service at any time, with or without cause or notice, for conduct that violates these terms or is harmful to other users or us.
            </p>

            <h2>10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>

            <h2>11. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through binding arbitration.
            </p>

            <h2>12. Contact Information</h2>
            <p>
              If you have questions about these terms, please contact us through our support page or at legal@gameplatform.com.
            </p>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold mb-4">Questions About These Terms?</h3>
            <p className="text-gray-600 mb-4">
              We're here to help clarify any questions you may have about our terms of service.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/contact">
                <Button>Contact Support</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Start Gaming</Button>
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