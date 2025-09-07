"use client"

import { lazy, Suspense, useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

// 动态导入各个管理模块 - 添加错误处理
const GamesManager = lazy(() => 
  import("./GamesManager").catch(err => {
    console.error('Failed to load GamesManager:', err)
    return { default: () => <div>Failed to load Games Manager</div> }
  })
)
const AdsManager = lazy(() => 
  import("./AdsManager").catch(err => {
    console.error('Failed to load AdsManager:', err)
    return { default: () => <div>Failed to load Ads Manager</div> }
  })
)
const FeaturedGamesManager = lazy(() => 
  import("./FeaturedGamesManager").catch(err => {
    console.error('Failed to load FeaturedGamesManager:', err)
    return { default: () => <div>Failed to load Featured Games Manager</div> }
  })
)
const RecommendedGamesManagerComponent = lazy(() => 
  import("../RecommendedGamesManager").catch(err => {
    console.error('Failed to load RecommendedGamesManager:', err)
    return { default: () => <div>Failed to load Recommendations Manager</div> }
  })
)
const HomepageManagerComponent = lazy(() => 
  import("../HomepageManager").catch(err => {
    console.error('Failed to load HomepageManager:', err)
    return { default: () => <div>Failed to load Homepage Manager</div> }
  })
)
const SEOManagerComponent = lazy(() => 
  import("../SEOManager").catch(err => {
    console.error('Failed to load SEOManager:', err)
    return { default: () => <div>Failed to load SEO Manager</div> }
  })
)
const ContactMessagesManager = lazy(() => 
  import("./ContactMessagesManager").catch(err => {
    console.error('Failed to load ContactMessagesManager:', err)
    return { default: () => <div>Failed to load Contact Messages Manager</div> }
  })
)
const BackupManager = lazy(() => 
  import("./BackupManager").catch(err => {
    console.error('Failed to load BackupManager:', err)
    return { default: () => <div>Failed to load Backup Manager</div> }
  })
)

// 加载组件
const LoadingCard = ({ title }: { title: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        <span>Loading {title}...</span>
      </div>
    </CardContent>
  </Card>
)

export default function AdminTabsLoader() {
  return (
    <Tabs defaultValue="games" className="space-y-6">
      <TabsList className="grid w-full grid-cols-8">
        <TabsTrigger value="games">Games</TabsTrigger>
        <TabsTrigger value="featured">Featured</TabsTrigger>
        <TabsTrigger value="ads">Ads</TabsTrigger>
        <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
        <TabsTrigger value="homepage">Homepage</TabsTrigger>
        <TabsTrigger value="seo">SEO & Config</TabsTrigger>
        <TabsTrigger value="contact">Contact</TabsTrigger>
        <TabsTrigger value="backup">Backup</TabsTrigger>
      </TabsList>
      
      <TabsContent value="games">
        <Suspense fallback={<LoadingCard title="Games Manager" />}>
          <GamesManager />
        </Suspense>
      </TabsContent>
      
      <TabsContent value="featured">
        <Suspense fallback={<LoadingCard title="Featured Games Manager" />}>
          <FeaturedGamesManager />
        </Suspense>
      </TabsContent>
      
      <TabsContent value="ads">
        <Suspense fallback={<LoadingCard title="Ads Manager" />}>
          <AdsManager />
        </Suspense>
      </TabsContent>
      
      <TabsContent value="recommendations">
        <Suspense fallback={<LoadingCard title="AI Recommendations Manager" />}>
          <RecommendedGamesManagerComponent />
        </Suspense>
      </TabsContent>
      
      <TabsContent value="homepage">
        <Suspense fallback={<LoadingCard title="Homepage Manager" />}>
          <HomepageManagerComponent />
        </Suspense>
      </TabsContent>
      
      <TabsContent value="seo">
        <Suspense fallback={<LoadingCard title="SEO Manager" />}>
          <SEOManagerComponent />
        </Suspense>
      </TabsContent>
      
      <TabsContent value="contact">
        <Suspense fallback={<LoadingCard title="Contact Messages Manager" />}>
          <ContactMessagesManager />
        </Suspense>
      </TabsContent>
      
      <TabsContent value="backup">
        <Suspense fallback={<LoadingCard title="Backup Manager" />}>
          <BackupManager />
        </Suspense>
      </TabsContent>
    </Tabs>
  )
}