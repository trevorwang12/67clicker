"use client"

import { useAdminAuth } from "@/lib/auth"
import AdminLogin from "./AdminLogin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Shield, Loader2, Settings } from "lucide-react"
import SecuritySetupDialog from './SecuritySetupDialog'
import { lazy, Suspense } from "react"

// 动态导入管理组件，但使用更可靠的错误处理
const GamesManager = lazy(() => 
  import("./admin/GamesManager").catch(() => ({
    default: () => <div className="p-4">Games Manager failed to load. Please refresh.</div>
  }))
)

const AdsManager = lazy(() => 
  import("./admin/AdsManager").catch(() => ({
    default: () => <div className="p-4">Ads Manager failed to load. Please refresh.</div>
  }))
)


const RecommendedGamesManager = lazy(() => 
  import("./RecommendedGamesManager").catch(() => ({
    default: () => <div className="p-4">Recommendations Manager failed to load. Please refresh.</div>
  }))
)

const HomepageManager = lazy(() => 
  import("./HomepageManager").catch(() => ({
    default: () => <div className="p-4">Homepage Manager failed to load. Please refresh.</div>
  }))
)

const SEOManager = lazy(() => 
  import("./SEOManager").catch(() => ({
    default: () => <div className="p-4">SEO Manager failed to load. Please refresh.</div>
  }))
)

const FriendlyLinksManager = lazy(() => 
  import("./admin/FriendlyLinksManager").catch(() => ({
    default: () => <div className="p-4">Friendly Links Manager failed to load. Please refresh.</div>
  }))
)

const AboutManager = lazy(() => 
  import("./AboutManager").catch(() => ({
    default: () => <div className="p-4">About Manager failed to load. Please refresh.</div>
  }))
)

const ContactMessagesManager = lazy(() => 
  import("./admin/ContactMessagesManager").catch(() => ({
    default: () => <div className="p-4">Contact Messages Manager failed to load. Please refresh.</div>
  }))
)

const FooterManager = lazy(() => 
  import("./admin/FooterManager").catch(() => ({
    default: () => <div className="p-4">Footer Manager failed to load. Please refresh.</div>
  }))
)

const BackupManager = lazy(() => 
  import("./admin/BackupManager").catch(() => ({
    default: () => <div className="p-4">Backup Manager failed to load. Please refresh.</div>
  }))
)


const SitemapManager = lazy(() => 
  import("./admin/SitemapManager").catch(() => ({
    default: () => <div className="p-4">Sitemap Manager failed to load. Please refresh.</div>
  }))
)



// 改进的Loading组件
const LoadingTab = ({ title }: { title: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin mr-3" />
        <span>Loading {title}...</span>
      </div>
    </CardContent>
  </Card>
)

export default function AdminPanel() {
  const { isAuthenticated, isLoading, login, logout } = useAdminAuth()

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading Admin Panel...</p>
        </div>
      </div>
    )
  }

  // Authentication required
  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} />
  }

  // Main admin interface
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200">
      <div className="container mx-auto p-6">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Admin Panel</CardTitle>
                  <p className="text-sm text-gray-600">Manage your gaming platform</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <SecuritySetupDialog 
                  isAuthenticated={true}
                  trigger={
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>安全设置</span>
                    </Button>
                  }
                />
                <Button variant="outline" onClick={logout} className="flex items-center space-x-2">
                  <LogOut className="w-4 h-4" />
                  <span>退出</span>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Admin Tabs with Lazy Loading */}
        <Tabs defaultValue="games" className="space-y-6">
          <div className="space-y-2">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="games">Games</TabsTrigger>
              <TabsTrigger value="ads">Ads</TabsTrigger>
              <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
              <TabsTrigger value="homepage">Homepage</TabsTrigger>
              <TabsTrigger value="about">About Us</TabsTrigger>
              <TabsTrigger value="contact">Messages</TabsTrigger>
            </TabsList>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="footer">Footer</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="friendly-links">Friendly Links</TabsTrigger>
              <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
              <TabsTrigger value="backup">Backup</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="games">
            <Suspense fallback={<LoadingTab title="Games Manager" />}>
              <GamesManager />
            </Suspense>
          </TabsContent>

          
          <TabsContent value="ads">
            <Suspense fallback={<LoadingTab title="Ads Manager" />}>
              <AdsManager />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="recommendations">
            <Suspense fallback={<LoadingTab title="AI Recommendations Manager" />}>
              <RecommendedGamesManager />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="homepage">
            <Suspense fallback={<LoadingTab title="Homepage Manager" />}>
              <HomepageManager />
            </Suspense>
          </TabsContent>

          <TabsContent value="about">
            <Suspense fallback={<LoadingTab title="About Manager" />}>
              <AboutManager />
            </Suspense>
          </TabsContent>

          <TabsContent value="contact">
            <Suspense fallback={<LoadingTab title="Contact Messages Manager" />}>
              <ContactMessagesManager />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="footer">
            <Suspense fallback={<LoadingTab title="Footer Manager" />}>
              <FooterManager />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="seo">
            <Suspense fallback={<LoadingTab title="SEO Manager" />}>
              <SEOManager />
            </Suspense>
          </TabsContent>
          
          
          <TabsContent value="friendly-links">
            <Suspense fallback={<LoadingTab title="Friendly Links Manager" />}>
              <FriendlyLinksManager />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="sitemap">
            <Suspense fallback={<LoadingTab title="Sitemap Manager" />}>
              <SitemapManager />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="backup">
            <Suspense fallback={<LoadingTab title="Backup Manager" />}>
              <BackupManager />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}