"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Settings, Globe, Copy, Download, Upload, RefreshCw } from "lucide-react"
import { getCurrentSiteConfig, DEFAULT_SITE_CONFIG, RULE34DLE_CONFIG } from '@/config/default-settings'

interface SiteConfigData {
  siteName: string
  siteDescription: string
  siteUrl: string
  author: string
  twitterHandle: string
  ogImage: string
  favicon: string
  siteLogo: string
  keywords: string[]
  backupPrefix: string
  titleSuffix: string
  metaTags: {
    themeColor: string
    appleMobileWebAppTitle: string
    appleMobileWebAppCapable: string
  }
}

export default function SiteConfigManager() {
  const [configData, setConfigData] = useState<SiteConfigData | null>(null)
  const [alert, setAlert] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTemplate, setActiveTemplate] = useState<'current' | 'default' | 'rule34dle'>('current')

  useEffect(() => {
    loadCurrentConfig()
  }, [])

  const loadCurrentConfig = () => {
    try {
      const currentConfig = getCurrentSiteConfig()
      setConfigData({
        siteName: currentConfig.siteName,
        siteDescription: currentConfig.siteDescription,
        siteUrl: currentConfig.siteUrl,
        author: currentConfig.author,
        twitterHandle: currentConfig.twitterHandle,
        ogImage: currentConfig.ogImage,
        favicon: currentConfig.favicon,
        siteLogo: currentConfig.siteLogo,
        keywords: currentConfig.keywords,
        backupPrefix: currentConfig.backupPrefix,
        titleSuffix: currentConfig.titleSuffix,
        metaTags: currentConfig.metaTags
      })
      setActiveTemplate('current')
    } catch (error) {
      console.error('Failed to load current config:', error)
      showAlert('error', 'Failed to load current configuration')
    }
  }

  const loadTemplate = (template: 'default' | 'rule34dle') => {
    const templateConfig = template === 'default' ? DEFAULT_SITE_CONFIG : RULE34DLE_CONFIG
    
    setConfigData({
      siteName: templateConfig.siteName,
      siteDescription: templateConfig.siteDescription,
      siteUrl: templateConfig.siteUrl,
      author: templateConfig.author,
      twitterHandle: templateConfig.twitterHandle,
      ogImage: templateConfig.ogImage,
      favicon: templateConfig.favicon,
      siteLogo: templateConfig.siteLogo,
      keywords: templateConfig.keywords,
      backupPrefix: templateConfig.backupPrefix,
      titleSuffix: templateConfig.titleSuffix,
      metaTags: templateConfig.metaTags
    })
    setActiveTemplate(template)
    showAlert('info', `Loaded ${template} template. Click save to apply changes.`)
  }

  const showAlert = (type: 'success' | 'error' | 'info', message: string) => {
    setAlert({type, message})
    setTimeout(() => setAlert(null), 5000)
  }

  const handleSave = async () => {
    if (!configData) return
    
    setIsLoading(true)
    try {
      // 这里可以调用 API 保存配置到环境变量或配置文件
      // 当前只是更新 SEO 设置
      const response = await fetch('/api/admin/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seoSettings: {
            siteName: configData.siteName,
            siteDescription: configData.siteDescription,
            siteUrl: configData.siteUrl,
            author: configData.author,
            twitterHandle: configData.twitterHandle,
            ogImage: configData.ogImage,
            ogTitle: configData.siteName,
            ogDescription: configData.siteDescription,
            favicon: configData.favicon,
            siteLogo: configData.siteLogo,
            keywords: configData.keywords,
            metaTags: configData.metaTags
          }
        })
      })

      if (response.ok) {
        showAlert('success', 'Site configuration saved successfully!')
        setActiveTemplate('current')
      } else {
        throw new Error('Failed to save configuration')
      }
    } catch (error) {
      console.error('Save error:', error)
      showAlert('error', 'Failed to save site configuration')
    } finally {
      setIsLoading(false)
    }
  }

  const exportConfig = () => {
    if (!configData) return
    
    const configJson = JSON.stringify(configData, null, 2)
    const blob = new Blob([configJson], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${configData.backupPrefix}-config-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showAlert('success', 'Configuration exported successfully!')
  }

  const copyToClipboard = () => {
    if (!configData) return
    
    const configJson = JSON.stringify(configData, null, 2)
    navigator.clipboard.writeText(configJson).then(() => {
      showAlert('success', 'Configuration copied to clipboard!')
    }).catch(() => {
      showAlert('error', 'Failed to copy configuration')
    })
  }

  if (!configData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Site Configuration...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="w-8 h-8 animate-spin mr-3" />
            <span>Loading configuration...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Site Configuration Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {alert && (
            <Alert variant={alert.type === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}

          {/* Template Selection */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Configuration Templates</Label>
            <div className="flex gap-2">
              <Button
                variant={activeTemplate === 'current' ? 'default' : 'outline'}
                size="sm"
                onClick={loadCurrentConfig}
              >
                Current
                {activeTemplate === 'current' && <Badge className="ml-2 bg-green-500">Active</Badge>}
              </Button>
              <Button
                variant={activeTemplate === 'default' ? 'default' : 'outline'}
                size="sm"
                onClick={() => loadTemplate('default')}
              >
                Generic Template
                {activeTemplate === 'default' && <Badge className="ml-2 bg-blue-500">Loaded</Badge>}
              </Button>
              <Button
                variant={activeTemplate === 'rule34dle' ? 'default' : 'outline'}
                size="sm"
                onClick={() => loadTemplate('rule34dle')}
              >
                Rule34dle Template
                {activeTemplate === 'rule34dle' && <Badge className="ml-2 bg-purple-500">Loaded</Badge>}
              </Button>
            </div>
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
                  value={configData.siteName}
                  onChange={(e) => setConfigData(prev => prev ? {...prev, siteName: e.target.value} : null)}
                  placeholder="GAMES"
                />
              </div>
              <div>
                <Label htmlFor="siteUrl">Site URL *</Label>
                <Input
                  id="siteUrl"
                  value={configData.siteUrl}
                  onChange={(e) => setConfigData(prev => prev ? {...prev, siteUrl: e.target.value} : null)}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="siteDescription">Site Description *</Label>
              <Textarea
                id="siteDescription"
                value={configData.siteDescription}
                onChange={(e) => setConfigData(prev => prev ? {...prev, siteDescription: e.target.value} : null)}
                placeholder="Best Online Gaming Platform - Play hundreds of free browser games"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={configData.author}
                  onChange={(e) => setConfigData(prev => prev ? {...prev, author: e.target.value} : null)}
                  placeholder="Gaming Platform"
                />
              </div>
              <div>
                <Label htmlFor="twitterHandle">Twitter Handle</Label>
                <Input
                  id="twitterHandle"
                  value={configData.twitterHandle}
                  onChange={(e) => setConfigData(prev => prev ? {...prev, twitterHandle: e.target.value} : null)}
                  placeholder="@gaming"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="keywords">Keywords (comma-separated)</Label>
              <Input
                id="keywords"
                value={configData.keywords.join(', ')}
                onChange={(e) => setConfigData(prev => prev ? {...prev, keywords: e.target.value.split(',').map(k => k.trim())} : null)}
                placeholder="online games, browser games, free games"
              />
            </div>
          </div>

          <Separator />

          {/* Asset URLs */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Asset URLs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="ogImage">OG Image</Label>
                <Input
                  id="ogImage"
                  value={configData.ogImage}
                  onChange={(e) => setConfigData(prev => prev ? {...prev, ogImage: e.target.value} : null)}
                  placeholder="/og-image.png"
                />
              </div>
              <div>
                <Label htmlFor="favicon">Favicon</Label>
                <Input
                  id="favicon"
                  value={configData.favicon}
                  onChange={(e) => setConfigData(prev => prev ? {...prev, favicon: e.target.value} : null)}
                  placeholder="/favicon.ico"
                />
              </div>
              <div>
                <Label htmlFor="siteLogo">Site Logo</Label>
                <Input
                  id="siteLogo"
                  value={configData.siteLogo}
                  onChange={(e) => setConfigData(prev => prev ? {...prev, siteLogo: e.target.value} : null)}
                  placeholder="/logo.png"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Technical Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Technical Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="backupPrefix">Backup Prefix</Label>
                <Input
                  id="backupPrefix"
                  value={configData.backupPrefix}
                  onChange={(e) => setConfigData(prev => prev ? {...prev, backupPrefix: e.target.value} : null)}
                  placeholder="gaming-site"
                />
              </div>
              <div>
                <Label htmlFor="titleSuffix">Title Suffix</Label>
                <Input
                  id="titleSuffix"
                  value={configData.titleSuffix}
                  onChange={(e) => setConfigData(prev => prev ? {...prev, titleSuffix: e.target.value} : null)}
                  placeholder="GAMES"
                />
              </div>
              <div>
                <Label htmlFor="themeColor">Theme Color</Label>
                <Input
                  id="themeColor"
                  value={configData.metaTags.themeColor}
                  onChange={(e) => setConfigData(prev => prev ? {...prev, metaTags: {...prev.metaTags, themeColor: e.target.value}} : null)}
                  placeholder="#475569"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={isLoading} className="flex-1">
              {isLoading ? 'Saving...' : 'Save Configuration'}
            </Button>
            <Button variant="outline" onClick={exportConfig}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" onClick={copyToClipboard}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}