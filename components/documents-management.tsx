"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileText, 
  Upload, 
  Download, 
  Edit, 
  Trash2, 
  Eye, 
  FolderOpen,
  Building2,
  Briefcase,
  Pill,
  Home,
  Globe
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { SupabaseClientDB } from "@/lib/supabase-db"

interface CRMDocument {
  id: string
  title: string
  description?: string
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  category: 'presentation_commerciale' | 'contrat'
  sub_category?: string
  version: number
  is_active: boolean
  uploaded_by: string
  created_at: string
  updated_at: string
}

const CATEGORIES = {
  presentation_commerciale: 'Présentation Commerciale',
  contrat: 'Contrat'
}

const SUB_CATEGORIES = {
  telemedecine_monde: 'Télémédecine dans le monde',
  hotel: 'Hôtel',
  entreprise: 'Entreprise', 
  pharmacie: 'Pharmacie',
  maison_retraite: 'Maison de retraite'
}

const SUB_CATEGORY_ICONS = {
  telemedecine_monde: Globe,
  hotel: Building2,
  entreprise: Briefcase,
  pharmacie: Pill,
  maison_retraite: Home
}

export function DocumentsManagement() {
  const [documents, setDocuments] = useState<CRMDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('presentation_commerciale')
  const [searchTerm, setSearchTerm] = useState("")
  
  const supabase = createClient()

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      
      const documents = await SupabaseClientDB.getCRMDocuments()
      setDocuments(documents)
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error)
      // Fallback vers les données de démo
      const demoDocuments = getDemoDocuments()
      setDocuments(demoDocuments)
    } finally {
      setLoading(false)
    }
  }

  const getDemoDocuments = (): CRMDocument[] => {
    const demoData = localStorage.getItem('demo_crm_documents')
    if (demoData) {
      return JSON.parse(demoData)
    }
    
    // Données de démo par défaut
    const defaultDocs: CRMDocument[] = [
      {
        id: '1',
        title: 'Présentation Télémédecine Globale',
        description: 'Vue d\'ensemble de la télémédecine dans le monde',
        file_name: 'telemedecine_monde.pdf',
        file_path: 'demo/telemedecine_monde.pdf',
        file_size: 2500000,
        mime_type: 'application/pdf',
        category: 'presentation_commerciale',
        sub_category: 'telemedecine_monde',
        version: 1,
        is_active: true,
        uploaded_by: 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Solution CRM pour Hôtels',
        description: 'Présentation spécialisée pour le secteur hôtelier',
        file_name: 'presentation_hotels.pdf',
        file_path: 'demo/presentation_hotels.pdf',
        file_size: 1800000,
        mime_type: 'application/pdf',
        category: 'presentation_commerciale',
        sub_category: 'hotel',
        version: 1,
        is_active: true,
        uploaded_by: 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Contrat Standard CRM',
        description: 'Modèle de contrat pour solutions CRM',
        file_name: 'contrat_standard.docx',
        file_path: 'demo/contrat_standard.docx',
        file_size: 850000,
        mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        category: 'contrat',
        version: 2,
        is_active: true,
        uploaded_by: 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
    
    localStorage.setItem('demo_crm_documents', JSON.stringify(defaultDocs))
    return defaultDocs
  }

  const handleFileUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const subCategory = formData.get('sub_category') as string

    if (!file || !title || !category) return

    try {
      setUploading(true)

      // Mode démo
      if (await SupabaseClientDB.isDemoMode()) {
        const newDoc: CRMDocument = {
          id: Math.random().toString(36).substr(2, 9),
          title,
          description,
          file_name: file.name,
          file_path: `demo/${file.name}`,
          file_size: file.size,
          mime_type: file.type,
          category: category as 'presentation_commerciale' | 'contrat',
          sub_category: subCategory || undefined,
          version: 1,
          is_active: true,
          uploaded_by: 'demo-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const currentDocs = [...documents, newDoc]
        setDocuments(currentDocs)
        localStorage.setItem('demo_crm_documents', JSON.stringify(currentDocs))
        setIsCreateModalOpen(false)
        return
      }

      // Upload vers Supabase Storage
      const fileName = `${Date.now()}_${file.name}`
      const filePath = await SupabaseClientDB.uploadCRMDocumentFile(file, fileName)

      // Créer le document
      const newDoc = await SupabaseClientDB.createCRMDocument({
        title,
        description,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        category: category as 'presentation_commerciale' | 'contrat',
        sub_category: subCategory || undefined,
        version: 1,
        is_active: true,
        uploaded_by: 'current-user'
      })

      setDocuments(prev => [newDoc, ...prev])
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      alert('Erreur lors de l\'upload du document')
    } finally {
      setUploading(false)
    }
  }

  const downloadDocument = async (doc: CRMDocument) => {
    try {
      if (await SupabaseClientDB.isDemoMode()) {
        alert('Téléchargement en mode démo - fonctionnalité non disponible')
        return
      }

      const blob = await SupabaseClientDB.downloadCRMDocumentFile(doc.file_path)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.file_name
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error)
      alert('Erreur lors du téléchargement')
    }
  }

  const deleteDocument = async (docId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return

    try {
      if (await SupabaseClientDB.isDemoMode()) {
        const updatedDocs = documents.filter(doc => doc.id !== docId)
        setDocuments(updatedDocs)
        localStorage.setItem('demo_crm_documents', JSON.stringify(updatedDocs))
        return
      }

      await SupabaseClientDB.deleteCRMDocument(docId)
      setDocuments(prev => prev.filter(doc => doc.id !== docId))
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Byte'
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString())
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const groupedDocuments = {
    presentation_commerciale: filteredDocuments.filter(doc => doc.category === 'presentation_commerciale'),
    contrat: filteredDocuments.filter(doc => doc.category === 'contrat')
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Chargement des documents...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-blue-600">Gestion des Documents</h2>
          <p className="text-muted-foreground">Gérez vos présentations commerciales et contrats</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Upload className="h-4 w-4 mr-2" />
              Nouveau Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un Document</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Titre *</label>
                <Input name="title" required placeholder="Nom du document" />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea name="description" placeholder="Description du document" />
              </div>

              <div>
                <label className="text-sm font-medium">Catégorie *</label>
                <Select name="category" required value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORIES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCategory === 'presentation_commerciale' && (
                <div>
                  <label className="text-sm font-medium">Sous-catégorie</label>
                  <Select name="sub_category">
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un secteur" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SUB_CATEGORIES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Fichier *</label>
                <Input 
                  name="file" 
                  type="file" 
                  accept=".pdf,.doc,.docx,.ppt,.pptx" 
                  required 
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Upload...' : 'Ajouter'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Barre de recherche */}
      <div className="max-w-md">
        <Input
          placeholder="Rechercher des documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Documents par catégorie */}
      <Tabs defaultValue="presentation_commerciale" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="presentation_commerciale" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Présentations Commerciales ({groupedDocuments.presentation_commerciale.length})
          </TabsTrigger>
          <TabsTrigger value="contrat" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Contrats ({groupedDocuments.contrat.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="presentation_commerciale" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedDocuments.presentation_commerciale.map((doc) => {
              const IconComponent = doc.sub_category ? SUB_CATEGORY_ICONS[doc.sub_category as keyof typeof SUB_CATEGORY_ICONS] : FolderOpen
              
              return (
                <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-sm font-medium">{doc.title}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        v{doc.version}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {doc.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{doc.description}</p>
                    )}
                    
                    {doc.sub_category && (
                      <Badge variant="outline" className="text-xs">
                        {SUB_CATEGORIES[doc.sub_category as keyof typeof SUB_CATEGORIES]}
                      </Badge>
                    )}

                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(doc.file_size)} • {doc.file_name}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadDocument(doc)}
                        className="flex-1"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Télécharger
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteDocument(doc.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            
            {groupedDocuments.presentation_commerciale.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Aucune présentation commerciale trouvée
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="contrat" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedDocuments.contrat.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      <CardTitle className="text-sm font-medium">{doc.title}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      v{doc.version}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {doc.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{doc.description}</p>
                  )}

                  <div className="text-xs text-muted-foreground">
                    {formatFileSize(doc.file_size)} • {doc.file_name}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadDocument(doc)}
                      className="flex-1"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Télécharger
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteDocument(doc.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {groupedDocuments.contrat.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Aucun contrat trouvé
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
