"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Users, UserCheck } from "lucide-react"
import { SupabaseClientDB } from "@/lib/supabase-db"

interface Admin {
  id: string
  user_id: string
  email: string
  full_name: string
  created_at: string
  updated_at: string
}

interface Commercial {
  id: string
  email: string
  full_name: string
  phone?: string
  region?: string
  notes?: string
  created_at: string
  updated_at: string
}

const UsersManagement = () => {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [commerciaux, setCommerciaux] = useState<Commercial[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingAdmin, setIsAddingAdmin] = useState(false)
  const [isAddingCommercial, setIsAddingCommercial] = useState(false)

  const [newAdmin, setNewAdmin] = useState({ email: "", full_name: "" })
  const [newCommercial, setNewCommercial] = useState({
    email: "",
    full_name: "",
    phone: "",
    region: "",
    notes: "",
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const [adminsData, commerciauxData] = await Promise.all([
        SupabaseClientDB.getAdmins(),
        SupabaseClientDB.getCommerciaux(),
      ])
      setAdmins(adminsData)
      setCommerciaux(commerciauxData)
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAdmin = async () => {
    if (!newAdmin.email || !newAdmin.full_name) return

    try {
      const admin = await SupabaseClientDB.createAdmin(newAdmin)
      setAdmins([admin, ...admins])
      setNewAdmin({ email: "", full_name: "" })
      setIsAddingAdmin(false)
    } catch (error) {
      console.error("Erreur lors de la création de l'admin:", error)
    }
  }

  const handleAddCommercial = async () => {
    if (!newCommercial.email || !newCommercial.full_name) return

    try {
      const commercial = await SupabaseClientDB.createCommercial(newCommercial)
      setCommerciaux([commercial, ...commerciaux])
      setNewCommercial({ email: "", full_name: "", phone: "", region: "", notes: "" })
      setIsAddingCommercial(false)
    } catch (error) {
      console.error("Erreur lors de la création du commercial:", error)
    }
  }

  const handleDeleteAdmin = async (id: string) => {
    try {
      await SupabaseClientDB.deleteAdmin(id)
      setAdmins(admins.filter((admin) => admin.id !== id))
    } catch (error) {
      console.error("Erreur lors de la suppression de l'admin:", error)
    }
  }

  const handleDeleteCommercial = async (id: string) => {
    try {
      await SupabaseClientDB.deleteCommercial(id)
      setCommerciaux(commerciaux.filter((commercial) => commercial.id !== id))
    } catch (error) {
      console.error("Erreur lors de la suppression du commercial:", error)
    }
  }

  if (loading) {
    return <div className="p-6">Chargement des utilisateurs...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-600">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">Gérez les administrateurs et commerciaux</p>
        </div>
      </div>

      <Tabs defaultValue="admins" className="space-y-4">
        <TabsList>
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Administrateurs ({admins.length})
          </TabsTrigger>
          <TabsTrigger value="commerciaux" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Commerciaux ({commerciaux.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="admins" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-blue-600">Administrateurs</h2>
            <Dialog open={isAddingAdmin} onOpenChange={setIsAddingAdmin}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter Admin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouvel Administrateur</DialogTitle>
                  <DialogDescription>Créer un nouveau compte administrateur</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                      placeholder="admin@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-name">Nom complet</Label>
                    <Input
                      id="admin-name"
                      value={newAdmin.full_name}
                      onChange={(e) => setNewAdmin({ ...newAdmin, full_name: e.target.value })}
                      placeholder="Jean Dupont"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddingAdmin(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleAddAdmin}>Créer Admin</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {admins.map((admin) => (
              <Card key={admin.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{admin.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{admin.email}</p>
                      <Badge variant="secondary" className="mt-1">
                        Administrateur
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAdmin(admin.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="commerciaux" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-blue-600">Commerciaux</h2>
            <Dialog open={isAddingCommercial} onOpenChange={setIsAddingCommercial}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter Commercial
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau Commercial</DialogTitle>
                  <DialogDescription>Créer un nouveau compte commercial</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="commercial-email">Email</Label>
                    <Input
                      id="commercial-email"
                      type="email"
                      value={newCommercial.email}
                      onChange={(e) => setNewCommercial({ ...newCommercial, email: e.target.value })}
                      placeholder="commercial@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="commercial-name">Nom complet</Label>
                    <Input
                      id="commercial-name"
                      value={newCommercial.full_name}
                      onChange={(e) => setNewCommercial({ ...newCommercial, full_name: e.target.value })}
                      placeholder="Marie Martin"
                    />
                  </div>
                  <div>
                    <Label htmlFor="commercial-phone">Téléphone</Label>
                    <Input
                      id="commercial-phone"
                      value={newCommercial.phone}
                      onChange={(e) => setNewCommercial({ ...newCommercial, phone: e.target.value })}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                  <div>
                    <Label htmlFor="commercial-region">Région</Label>
                    <Input
                      id="commercial-region"
                      value={newCommercial.region}
                      onChange={(e) => setNewCommercial({ ...newCommercial, region: e.target.value })}
                      placeholder="Île-de-France"
                    />
                  </div>
                  <div>
                    <Label htmlFor="commercial-notes">Notes</Label>
                    <Input
                      id="commercial-notes"
                      value={newCommercial.notes}
                      onChange={(e) => setNewCommercial({ ...newCommercial, notes: e.target.value })}
                      placeholder="Spécialités, expérience..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddingCommercial(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleAddCommercial}>Créer Commercial</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {commerciaux.map((commercial) => (
              <Card key={commercial.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{commercial.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{commercial.email}</p>
                      {commercial.phone && <p className="text-sm text-muted-foreground">{commercial.phone}</p>}
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">Commercial</Badge>
                        {commercial.region && <Badge variant="secondary">{commercial.region}</Badge>}
                      </div>
                      {commercial.notes && <p className="text-xs text-muted-foreground mt-1">{commercial.notes}</p>}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCommercial(commercial.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { UsersManagement }
export default UsersManagement
