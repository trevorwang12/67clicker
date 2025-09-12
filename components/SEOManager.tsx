"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Globe, Search, Eye, Code, Smartphone, Settings, Link, Download, Upload, RefreshCw, Copy } from "lucide-react"
import { seoManager, type SEOSettings, type GamePageSEO, type CategoryPageSEO } from "@/lib/seo-manager"
import ImageUploader from "@/components/ImageUploader"
import CanonicalChecker from "@/components/admin/CanonicalChecker"
import { fetchSiteConfig } from '@/lib/config-service'

export default function SEOManager() {
  const [seoSettings, setSEOSettings] = useState<SEOSettings | null>(null)
  const [gamePageSEO, setGamePageSEO] = useState<GamePageSEO | null>(null)
  const [categoryPageSEO, setCategoryPageSEO] = useState<CategoryPageSEO | null>(null)
  const [alert, setAlert] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Form states
  const [seoFormData, setSEOFormData] = useState<Partial<SEOSettings>>({})
  const [gamePageFormData, setGamePageFormData] = useState<Partial<GamePageSEO>>({})
  const [categoryPageFormData, setCategoryPageFormData] = useState<Partial<CategoryPageSEO>>({})
  

  useEffect(() => {
    loadSEOData()
  }, [])

  const loadSEOData = async () => {
    const seo = await seoManager.getSEOSettings()
    const gameSEO = await seoManager.getGamePageSEO()
    const categorySEO = await seoManager.getCategoryPageSEO()
    
    setSEOSettings(seo)
    setGamePageSEO(gameSEO)
    setCategoryPageSEO(categorySEO)
    
    if (seo) setSEOFormData({ ...seo })
    if (gameSEO) setGamePageFormData({ ...gameSEO })
    if (categorySEO) setCategoryPageFormData({ ...categorySEO })
  }

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({type, message})
    setTimeout(() => setAlert(null), 3000)
  }


  const handleSEOSubmit = async () => {
    setIsLoading(true)
    
    try {
      // Merge current form data with existing settings to ensure required fields are present
      const completeSettings = {
        ...seoSettings, // Start with existing complete settings
        ...seoFormData  // Override with form changes
      }
      
      const validation = seoManager.validateSEOSettings(completeSettings)
      if (!validation.isValid) {
        showAlert('error', validation.errors.join(', '))
        setIsLoading(false)
        return
      }
      
      const success = await seoManager.updateSEOSettings(completeSettings)
      if (success) {
        showAlert('success', 'SEO settings updated successfully!')
        loadSEOData()
      } else {
        showAlert('error', 'Failed to update SEO settings')
      }
    } catch (error) {
      showAlert('error', 'An error occurred while saving SEO settings')
    }
    
    setIsLoading(false)
  }

  const handleMetaTagsSubmit = async () => {
    setIsLoading(true)
    
    try {
      // Merge current form data with existing settings to ensure required fields are present
      const completeSettings = {
        ...seoSettings, // Start with existing complete settings
        ...seoFormData  // Override with form changes
      }
      
      const validation = seoManager.validateSEOSettings(completeSettings)
      if (!validation.isValid) {
        showAlert('error', validation.errors.join(', '))
        setIsLoading(false)
        return
      }
      
      const success = await seoManager.updateSEOSettings(completeSettings)
      if (success) {
        showAlert('success', 'Meta Tags settings updated successfully!')
        loadSEOData()
      } else {
        showAlert('error', 'Failed to update Meta Tags settings')
      }
    } catch (error) {
      showAlert('error', 'An error occurred while saving Meta Tags settings')
    }
    
    setIsLoading(false)
  }

  const handleGamePageSEOSubmit = async () => {
    setIsLoading(true)
    
    try {
      const success = await seoManager.updateGamePageSEO(gamePageFormData)
      if (success) {
        showAlert('success', 'Game page SEO settings updated successfully!')
        loadSEOData()
      } else {
        showAlert('error', 'Failed to update game page SEO settings')
      }
    } catch (error) {
      showAlert('error', 'An error occurred while saving game page SEO settings')
    }
    
    setIsLoading(false)
  }

  const handleCategoryPageSEOSubmit = async () => {
    setIsLoading(true)
    
    try {
      const success = await seoManager.updateCategoryPageSEO(categoryPageFormData)
      if (success) {
        showAlert('success', 'Category page SEO settings updated successfully!')
        loadSEOData()
      } else {
        showAlert('error', 'Failed to update category page SEO settings')
      }
    } catch (error) {
      showAlert('error', 'An error occurred while saving category page SEO settings')
    }
    
    setIsLoading(false)
  }

  const handleKeywordsChange = (value: string) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k !== '')
    setSEOFormData(prev => ({ ...prev, keywords }))
  }

  const handleSameAsChange = (value: string) => {
    const sameAs = value.split(',').map(s => s.trim()).filter(s => s !== '')
    setSEOFormData(prev => ({
      ...prev,
      structuredData: {
        ...prev.structuredData,
        sameAs
      }
    }))
  }

  return (
    <div className="space-y-6">
      {alert && (
        <Alert className={`${alert.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="general">Site Configuration</TabsTrigger>
          <TabsTrigger value="canonical">Canonical URLs</TabsTrigger>
          <TabsTrigger value="meta">Meta Tags</TabsTrigger>
          <TabsTrigger value="headings">Headings (H1-H3)</TabsTrigger>
          <TabsTrigger value="structured">Structured Data</TabsTrigger>
          <TabsTrigger value="game-pages">Game Pages</TabsTrigger>
          <TabsTrigger value="category-pages">Category Pages</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Site Configuration & Templates
              </CardTitle>
              <p className="text-sm text-gray-600">
                Manage your site's basic information, SEO settings, and configuration templates
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Configuration Info */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">Site Configuration</Label>
                <p className="text-sm text-gray-600">
                  Configuration is loaded from SEO settings. Changes are saved directly to the SEO settings.
                </p>
              </div>

              <Separator />

              {/* Basic Site Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Basic Site Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="siteName">Site Name *</Label>
                    <Input
                      id="siteName"
                      value={seoFormData.siteName || ''}
                      onChange={(e) => setSEOFormData(prev => ({ ...prev, siteName: e.target.value }))}
                      placeholder="Your Gaming Site"
                    />
                  </div>
                  <div>
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      value={seoFormData.author || ''}
                      onChange={(e) => setSEOFormData(prev => ({ ...prev, author: e.target.value }))}
                      placeholder="Gaming Platform Team"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="siteDescription">Site Description *</Label>
                  <Textarea
                    id="siteDescription"
                    value={seoFormData.siteDescription || ''}
                    onChange={(e) => setSEOFormData(prev => ({ ...prev, siteDescription: e.target.value }))}
                    placeholder="Best online gaming platform with hundreds of free games..."
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: 150-160 characters. Current: {seoFormData.siteDescription?.length || 0}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="siteUrl">Site URL *</Label>
                    <Input
                      id="siteUrl"
                      value={seoFormData.siteUrl || ''}
                      onChange={(e) => setSEOFormData(prev => ({ ...prev, siteUrl: e.target.value }))}
                      placeholder="https://yourgamesite.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="canonicalUrl">Canonical URL</Label>
                    <Input
                      id="canonicalUrl"
                      value={seoFormData.canonicalUrl || ''}
                      onChange={(e) => setSEOFormData(prev => ({ ...prev, canonicalUrl: e.target.value }))}
                      placeholder="https://yourgamesite.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="twitterHandle">Twitter Handle</Label>
                    <Input
                      id="twitterHandle"
                      value={seoFormData.twitterHandle || ''}
                      onChange={(e) => setSEOFormData(prev => ({ ...prev, twitterHandle: e.target.value }))}
                      placeholder="@yourgames"
                    />
                  </div>
                  <div>
                    <Label htmlFor="backupPrefix">Backup Prefix</Label>
                    <Input
                      id="backupPrefix"
                      value={seoFormData.backupPrefix || ''}
                      onChange={(e) => setSEOFormData(prev => ({ ...prev, backupPrefix: e.target.value }))}
                      placeholder="gaming-site"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="keywords">Keywords *</Label>
                  <Input
                    id="keywords"
                    value={seoFormData.keywords?.join(', ') || ''}
                    onChange={(e) => handleKeywordsChange(e.target.value)}
                    placeholder="online games, browser games, free games, HTML5 games"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <ImageUploader
                      label="Site Logo"
                      value={seoFormData.siteLogo || ''}
                      onChange={(url) => setSEOFormData(prev => ({ ...prev, siteLogo: url }))}
                      placeholder="Upload site logo or enter URL"
                      accept="image/*"
                      helperText="Recommended: PNG or SVG, 200x50px"
                    />
                  </div>
                  <div>
                    <ImageUploader
                      label="Favicon"
                      value={seoFormData.favicon || ''}
                      onChange={(url) => setSEOFormData(prev => ({ ...prev, favicon: url }))}
                      placeholder="Upload favicon or enter URL"
                      accept="image/x-icon,image/png,image/svg+xml"
                      helperText="Recommended: ICO or PNG, 16x16px or 32x32px"
                    />
                  </div>
                  <div>
                    <ImageUploader
                      label="Open Graph Image"
                      value={seoFormData.ogImage || ''}
                      onChange={(url) => setSEOFormData(prev => ({ ...prev, ogImage: url }))}
                      placeholder="Upload OG image or enter URL"
                      accept="image/*"
                      helperText="Recommended: PNG or JPG, 1200x630px"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Technical Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Technical Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="titleSuffix">Title Suffix</Label>
                    <Input
                      id="titleSuffix"
                      value={seoFormData.titleSuffix || ''}
                      onChange={(e) => setSEOFormData(prev => ({ ...prev, titleSuffix: e.target.value }))}
                      placeholder="GAMES"
                    />
                  </div>
                  <div>
                    <Label htmlFor="themeColor">Theme Color</Label>
                    <Input
                      id="themeColor"
                      value={seoFormData.metaTags?.themeColor || ''}
                      onChange={(e) => setSEOFormData(prev => ({
                        ...prev,
                        metaTags: { ...prev.metaTags, themeColor: e.target.value }
                      }))}
                      placeholder="#475569"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="robotsTxt">Robots.txt Content</Label>
                  <Textarea
                    id="robotsTxt"
                    value={seoFormData.robotsTxt || ''}
                    onChange={(e) => setSEOFormData(prev => ({ ...prev, robotsTxt: e.target.value }))}
                    placeholder="User-agent: *&#10;Allow: /&#10;Disallow: /admin/"
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              <Separator />

              {/* Export/Import Actions */}
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => {
                    if (!seoFormData) return
                    const configJson = JSON.stringify(seoFormData, null, 2)
                    const blob = new Blob([configJson], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `${seoFormData.backupPrefix || 'site'}-config-${new Date().toISOString().split('T')[0]}.json`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                    showAlert('success', 'Configuration exported successfully!')
                  }}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" onClick={() => {
                    if (!seoFormData) return
                    const configJson = JSON.stringify(seoFormData, null, 2)
                    navigator.clipboard.writeText(configJson).then(() => {
                      showAlert('success', 'Configuration copied to clipboard!')
                    }).catch(() => {
                      showAlert('error', 'Failed to copy configuration')
                    })
                  }}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <Button onClick={handleSEOSubmit} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Site Configuration'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="canonical" className="space-y-6">
          <CanonicalChecker />
        </TabsContent>

        <TabsContent value="meta" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Meta Tags & Social Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ogTitle">Open Graph Title</Label>
                  <Input
                    id="ogTitle"
                    value={seoFormData.ogTitle || ''}
                    onChange={(e) => setSEOFormData(prev => ({ ...prev, ogTitle: e.target.value }))}
                    placeholder="Best Free Online Games"
                  />
                </div>
                <div>
                  <Label htmlFor="twitterHandle">Twitter Handle</Label>
                  <Input
                    id="twitterHandle"
                    value={seoFormData.twitterHandle || ''}
                    onChange={(e) => setSEOFormData(prev => ({ ...prev, twitterHandle: e.target.value }))}
                    placeholder="@yourgames"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="ogDescription">Open Graph Description</Label>
                <Textarea
                  id="ogDescription"
                  value={seoFormData.ogDescription || ''}
                  onChange={(e) => setSEOFormData(prev => ({ ...prev, ogDescription: e.target.value }))}
                  placeholder="Play the best free online games. No download required!"
                  rows={2}
                />
              </div>

              <Separator />
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Mobile & App Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="viewport">Viewport</Label>
                  <Input
                    id="viewport"
                    value={seoFormData.metaTags?.viewport || ''}
                    onChange={(e) => setSEOFormData(prev => ({
                      ...prev,
                      metaTags: { ...prev.metaTags, viewport: e.target.value }
                    }))}
                    placeholder="width=device-width, initial-scale=1.0"
                  />
                </div>
                <div>
                  <Label htmlFor="themeColor">Theme Color</Label>
                  <Input
                    id="themeColor"
                    value={seoFormData.metaTags?.themeColor || ''}
                    onChange={(e) => setSEOFormData(prev => ({
                      ...prev,
                      metaTags: { ...prev.metaTags, themeColor: e.target.value }
                    }))}
                    placeholder="#475569"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appleMobileWebAppTitle">Apple Web App Title</Label>
                  <Input
                    id="appleMobileWebAppTitle"
                    value={seoFormData.metaTags?.appleMobileWebAppTitle || ''}
                    onChange={(e) => setSEOFormData(prev => ({
                      ...prev,
                      metaTags: { ...prev.metaTags, appleMobileWebAppTitle: e.target.value }
                    }))}
                    placeholder="GAMES"
                  />
                </div>
                <div>
                  <Label htmlFor="appleMobileWebAppCapable">Apple Web App Capable</Label>
                  <Select
                    value={seoFormData.metaTags?.appleMobileWebAppCapable || 'yes'}
                    onValueChange={(value) => setSEOFormData(prev => ({
                      ...prev,
                      metaTags: { ...prev.metaTags, appleMobileWebAppCapable: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Search className="w-4 h-4" />
                Analytics & Webmaster Tools
              </h3>

              <div className="space-y-6">
                {/* Google Analytics Section */}
                <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                  <h4 className="font-semibold text-blue-900">Google Analytics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="googleAnalyticsId">Analytics Measurement ID</Label>
                      <Input
                        id="googleAnalyticsId"
                        value={seoFormData.googleAnalyticsId || ''}
                        onChange={(e) => setSEOFormData(prev => ({ ...prev, googleAnalyticsId: e.target.value }))}
                        placeholder="G-XXXXXXXXXX"
                      />
                      <p className="text-xs text-gray-600 mt-1">Google Analytics 4 Measurement ID</p>
                    </div>
                    <div>
                      <Label htmlFor="googleAnalyticsTrackingCode">Full Tracking Code (Optional)</Label>
                      <Textarea
                        id="googleAnalyticsTrackingCode"
                        value={seoFormData.googleAnalyticsTrackingCode || ''}
                        onChange={(e) => setSEOFormData(prev => ({ ...prev, googleAnalyticsTrackingCode: e.target.value }))}
                        placeholder="<!-- Google tag (gtag.js) -->"
                        rows={4}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-gray-600 mt-1">Paste complete Google Analytics tracking code here</p>
                    </div>
                  </div>
                </div>

                {/* Search Console Section */}
                <div className="bg-green-50 p-4 rounded-lg space-y-4">
                  <h4 className="font-semibold text-green-900">Google Search Console</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="googleSearchConsoleId">Search Console Verification ID</Label>
                      <Input
                        id="googleSearchConsoleId"
                        value={seoFormData.googleSearchConsoleId || ''}
                        onChange={(e) => setSEOFormData(prev => ({ ...prev, googleSearchConsoleId: e.target.value }))}
                        placeholder="google123456789abcdef"
                      />
                      <p className="text-xs text-gray-600 mt-1">Content value from meta tag verification</p>
                    </div>
                    <div>
                      <Label htmlFor="googleSearchConsoleHtmlTag">HTML Meta Tag (Optional)</Label>
                      <Textarea
                        id="googleSearchConsoleHtmlTag"
                        value={seoFormData.googleSearchConsoleHtmlTag || ''}
                        onChange={(e) => setSEOFormData(prev => ({ ...prev, googleSearchConsoleHtmlTag: e.target.value }))}
                        placeholder='<meta name="google-site-verification" content="..." />'
                        rows={2}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-gray-600 mt-1">Paste complete HTML meta tag here</p>
                    </div>
                  </div>
                </div>

                {/* Other Webmaster Tools */}
                <div className="bg-orange-50 p-4 rounded-lg space-y-4">
                  <h4 className="font-semibold text-orange-900">Other Webmaster Tools</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="bingWebmasterToolsId">Bing Webmaster ID</Label>
                      <Input
                        id="bingWebmasterToolsId"
                        value={seoFormData.bingWebmasterToolsId || ''}
                        onChange={(e) => setSEOFormData(prev => ({ ...prev, bingWebmasterToolsId: e.target.value }))}
                        placeholder="123456789ABCDEF"
                      />
                    </div>
                    <div>
                      <Label htmlFor="yandexWebmasterToolsId">Yandex Webmaster ID</Label>
                      <Input
                        id="yandexWebmasterToolsId"
                        value={seoFormData.yandexWebmasterToolsId || ''}
                        onChange={(e) => setSEOFormData(prev => ({ ...prev, yandexWebmasterToolsId: e.target.value }))}
                        placeholder="yandex123456789abcdef"
                      />
                    </div>
                    <div>
                      <Label htmlFor="baiduWebmasterToolsId">Baidu Webmaster ID</Label>
                      <Input
                        id="baiduWebmasterToolsId"
                        value={seoFormData.baiduWebmasterToolsId || ''}
                        onChange={(e) => setSEOFormData(prev => ({ ...prev, baiduWebmasterToolsId: e.target.value }))}
                        placeholder="baidu123456789abcdef"
                      />
                    </div>
                  </div>
                </div>

                {/* Custom HTML Head Tags */}
                <div className="bg-purple-50 p-4 rounded-lg space-y-4">
                  <h4 className="font-semibold text-purple-900">Custom HTML Head Tags</h4>
                  <div>
                    <Label htmlFor="customHeadTags">Additional Head Tags</Label>
                    <Textarea
                      id="customHeadTags"
                      value={seoFormData.customHeadTags || ''}
                      onChange={(e) => setSEOFormData(prev => ({ ...prev, customHeadTags: e.target.value }))}
                      placeholder="<!-- Add any additional meta tags, verification codes, or scripts here -->"
                      rows={6}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Paste any additional HTML tags for the &lt;head&gt; section (verification tags, custom analytics, etc.)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleMetaTagsSubmit} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Meta Tags Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="headings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Headings Structure (H1-H3)
              </CardTitle>
              <p className="text-sm text-gray-600">
                Optimize heading structure for better SEO. Each page should have only one H1.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Homepage Headings</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="homepageH1">H1 Template</Label>
                      <Input
                        id="homepageH1"
                        value={seoFormData.headingStructure?.homepage?.h1 || ''}
                        onChange={(e) => setSEOFormData(prev => ({
                          ...prev,
                          headingStructure: {
                            ...prev.headingStructure,
                            homepage: {
                              ...prev.headingStructure?.homepage,
                              h1: e.target.value
                            }
                          }
                        }))}
                        placeholder="{siteName} - Best Free Online Games"
                      />
                      <p className="text-xs text-gray-500 mt-1">Use {"{siteName}"} placeholder</p>
                    </div>
                    <div>
                      <Label htmlFor="homepageH2">H2 Templates (comma separated)</Label>
                      <Input
                        id="homepageH2"
                        value={seoFormData.headingStructure?.homepage?.h2?.join(', ') || ''}
                        onChange={(e) => setSEOFormData(prev => ({
                          ...prev,
                          headingStructure: {
                            ...prev.headingStructure,
                            homepage: {
                              ...prev.headingStructure?.homepage,
                              h2: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                            }
                          }
                        }))}
                        placeholder="Featured Games, New Games, Popular Categories"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Game Page Headings</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="gamePageH1">H1 Template</Label>
                      <Input
                        id="gamePageH1"
                        value={seoFormData.headingStructure?.gamePage?.h1 || ''}
                        onChange={(e) => setSEOFormData(prev => ({
                          ...prev,
                          headingStructure: {
                            ...prev.headingStructure,
                            gamePage: {
                              ...prev.headingStructure?.gamePage,
                              h1: e.target.value
                            }
                          }
                        }))}
                        placeholder="{gameName}"
                      />
                      <p className="text-xs text-gray-500 mt-1">Use {"{gameName}"} placeholder</p>
                    </div>
                    <div>
                      <Label htmlFor="gamePageH2">H2 Templates (comma separated)</Label>
                      <Input
                        id="gamePageH2"
                        value={seoFormData.headingStructure?.gamePage?.h2?.join(', ') || ''}
                        onChange={(e) => setSEOFormData(prev => ({
                          ...prev,
                          headingStructure: {
                            ...prev.headingStructure,
                            gamePage: {
                              ...prev.headingStructure?.gamePage,
                              h2: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                            }
                          }
                        }))}
                        placeholder="How to Play, Game Controls, Similar Games"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Category Page Headings</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="categoryPageH1">H1 Template</Label>
                      <Input
                        id="categoryPageH1"
                        value={seoFormData.headingStructure?.categoryPage?.h1 || ''}
                        onChange={(e) => setSEOFormData(prev => ({
                          ...prev,
                          headingStructure: {
                            ...prev.headingStructure,
                            categoryPage: {
                              ...prev.headingStructure?.categoryPage,
                              h1: e.target.value
                            }
                          }
                        }))}
                        placeholder="{categoryName} Games"
                      />
                      <p className="text-xs text-gray-500 mt-1">Use {"{categoryName}"} placeholder</p>
                    </div>
                    <div>
                      <Label htmlFor="categoryPageH2">H2 Templates (comma separated)</Label>
                      <Input
                        id="categoryPageH2"
                        value={seoFormData.headingStructure?.categoryPage?.h2?.join(', ') || ''}
                        onChange={(e) => setSEOFormData(prev => ({
                          ...prev,
                          headingStructure: {
                            ...prev.headingStructure,
                            categoryPage: {
                              ...prev.headingStructure?.categoryPage,
                              h2: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                            }
                          }
                        }))}
                        placeholder="Popular {categoryName} Games, New Releases"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">General Guidelines</h3>
                  <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm">
                    <div><strong>H1:</strong> Only one per page, main topic/title</div>
                    <div><strong>H2:</strong> Section headings, multiple allowed</div>
                    <div><strong>H3:</strong> Sub-section headings under H2</div>
                    <div><strong>Best Practice:</strong> Follow H1 → H2 → H3 hierarchy</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSEOSubmit} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Heading Structure Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structured" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Structured Data (Schema.org)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="structuredDataEnabled"
                  checked={seoFormData.structuredData?.enabled || false}
                  onCheckedChange={(checked) => setSEOFormData(prev => ({
                    ...prev,
                    structuredData: { ...prev.structuredData, enabled: checked }
                  }))}
                />
                <Label htmlFor="structuredDataEnabled">Enable Structured Data</Label>
              </div>

              {seoFormData.structuredData?.enabled && (
                <>
                  <div>
                    <Label htmlFor="organizationType">Organization Type</Label>
                    <Select
                      value={seoFormData.structuredData?.organizationType || 'WebSite'}
                      onValueChange={(value: 'Organization' | 'WebSite' | 'LocalBusiness') => setSEOFormData(prev => ({
                        ...prev,
                        structuredData: { ...prev.structuredData, organizationType: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WebSite">WebSite</SelectItem>
                        <SelectItem value="Organization">Organization</SelectItem>
                        <SelectItem value="LocalBusiness">LocalBusiness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="organizationName">Organization Name</Label>
                      <Input
                        id="organizationName"
                        value={seoFormData.structuredData?.organizationName || ''}
                        onChange={(e) => setSEOFormData(prev => ({
                          ...prev,
                          structuredData: { ...prev.structuredData, organizationName: e.target.value }
                        }))}
                        placeholder="GAMES"
                      />
                    </div>
                    <div>
                      <Label htmlFor="organizationUrl">Organization URL</Label>
                      <Input
                        id="organizationUrl"
                        value={seoFormData.structuredData?.organizationUrl || ''}
                        onChange={(e) => setSEOFormData(prev => ({
                          ...prev,
                          structuredData: { ...prev.structuredData, organizationUrl: e.target.value }
                        }))}
                        placeholder="https://yourgamesite.com"
                      />
                    </div>
                  </div>

                  <div>
                    <ImageUploader
                      label="Organization Logo"
                      value={seoFormData.structuredData?.organizationLogo || ''}
                      onChange={(url) => setSEOFormData(prev => ({
                        ...prev,
                        structuredData: { ...prev.structuredData, organizationLogo: url }
                      }))}
                      placeholder="Upload organization logo or enter URL"
                      accept="image/*"
                      helperText="For Schema.org structured data - PNG/SVG preferred"
                    />
                  </div>

                  <div>
                    <Label htmlFor="sameAs">Social Media URLs</Label>
                    <Input
                      id="sameAs"
                      value={seoFormData.structuredData?.sameAs?.join(', ') || ''}
                      onChange={(e) => handleSameAsChange(e.target.value)}
                      placeholder="https://twitter.com/yourgames, https://facebook.com/yourgames"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate URLs with commas</p>
                  </div>
                </>
              )}

              <div className="flex justify-end">
                <Button onClick={handleSEOSubmit} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Structured Data Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="game-pages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Game Page SEO Templates
              </CardTitle>
              <p className="text-sm text-gray-600">
                Configure SEO templates for individual game pages. Use placeholders like {"{gameName}"}, {"{gameDescription}"}, {"{category}"}, {"{siteName}"}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="gamePageTitleTemplate">Title Template</Label>
                <Input
                  id="gamePageTitleTemplate"
                  value={gamePageFormData.titleTemplate || ''}
                  onChange={(e) => setGamePageFormData(prev => ({ ...prev, titleTemplate: e.target.value }))}
                  placeholder="{gameName} - Play Free Online | {siteName}"
                />
              </div>

              <div>
                <Label htmlFor="gamePageDescriptionTemplate">Description Template</Label>
                <Textarea
                  id="gamePageDescriptionTemplate"
                  value={gamePageFormData.descriptionTemplate || ''}
                  onChange={(e) => setGamePageFormData(prev => ({ ...prev, descriptionTemplate: e.target.value }))}
                  placeholder="Play {gameName} for free online! {gameDescription} No download required - start playing now!"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="gamePageKeywordsTemplate">Keywords Template</Label>
                <Input
                  id="gamePageKeywordsTemplate"
                  value={gamePageFormData.keywordsTemplate || ''}
                  onChange={(e) => setGamePageFormData(prev => ({ ...prev, keywordsTemplate: e.target.value }))}
                  placeholder="{gameName}, {category}, free game, online game, browser game"
                />
              </div>

              <Separator />
              <h3 className="text-lg font-semibold">Feature Toggles</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableBreadcrumbs"
                    checked={gamePageFormData.enableBreadcrumbs || false}
                    onCheckedChange={(checked) => setGamePageFormData(prev => ({ ...prev, enableBreadcrumbs: checked }))}
                  />
                  <Label htmlFor="enableBreadcrumbs" className="text-sm">Breadcrumbs</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableRichSnippets"
                    checked={gamePageFormData.enableRichSnippets || false}
                    onCheckedChange={(checked) => setGamePageFormData(prev => ({ ...prev, enableRichSnippets: checked }))}
                  />
                  <Label htmlFor="enableRichSnippets" className="text-sm">Rich Snippets</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableOpenGraph"
                    checked={gamePageFormData.enableOpenGraph || false}
                    onCheckedChange={(checked) => setGamePageFormData(prev => ({ ...prev, enableOpenGraph: checked }))}
                  />
                  <Label htmlFor="enableOpenGraph" className="text-sm">Open Graph</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enableTwitterCards"
                    checked={gamePageFormData.enableTwitterCards || false}
                    onCheckedChange={(checked) => setGamePageFormData(prev => ({ ...prev, enableTwitterCards: checked }))}
                  />
                  <Label htmlFor="enableTwitterCards" className="text-sm">Twitter Cards</Label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleGamePageSEOSubmit} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Game Page SEO Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="category-pages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                Category Page SEO Templates
              </CardTitle>
              <p className="text-sm text-gray-600">
                Configure SEO templates for category pages. Use placeholders like {"{categoryName}"}, {"{siteName}"}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="categoryPageTitleTemplate">Title Template</Label>
                <Input
                  id="categoryPageTitleTemplate"
                  value={categoryPageFormData.titleTemplate || ''}
                  onChange={(e) => setCategoryPageFormData(prev => ({ ...prev, titleTemplate: e.target.value }))}
                  placeholder="{categoryName} Games - Free Online | {siteName}"
                />
              </div>

              <div>
                <Label htmlFor="categoryPageDescriptionTemplate">Description Template</Label>
                <Textarea
                  id="categoryPageDescriptionTemplate"
                  value={categoryPageFormData.descriptionTemplate || ''}
                  onChange={(e) => setCategoryPageFormData(prev => ({ ...prev, descriptionTemplate: e.target.value }))}
                  placeholder="Play the best {categoryName} games for free! Discover hundreds of exciting {categoryName} games."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="categoryPageKeywordsTemplate">Keywords Template</Label>
                <Input
                  id="categoryPageKeywordsTemplate"
                  value={categoryPageFormData.keywordsTemplate || ''}
                  onChange={(e) => setCategoryPageFormData(prev => ({ ...prev, keywordsTemplate: e.target.value }))}
                  placeholder="{categoryName} games, free {categoryName}, online {categoryName}"
                />
              </div>

              <Separator />
              <h3 className="text-lg font-semibold">Feature Toggles</h3>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enablePagination"
                  checked={categoryPageFormData.enablePagination || false}
                  onCheckedChange={(checked) => setCategoryPageFormData(prev => ({ ...prev, enablePagination: checked }))}
                />
                <Label htmlFor="enablePagination">Enable Pagination SEO</Label>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleCategoryPageSEOSubmit} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Category Page SEO Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {seoSettings && (
        <Card>
          <CardHeader>
            <CardTitle>SEO Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-blue-600 text-lg">{seoSettings.siteName}</h3>
              <p className="text-green-600 text-sm">{seoSettings.siteUrl}</p>
              <p className="text-gray-600 text-sm mt-1">{seoSettings.siteDescription}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}