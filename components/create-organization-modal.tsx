"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Save, X } from "lucide-react"
import type { Organization } from "@/types/crm"

interface CreateOrganizationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Omit<Organization, "id" | "created_at" | "updated_at">) => Promise<void>
}

export function CreateOrganizationModal({ isOpen, onClose, onSubmit }: CreateOrganizationModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    category: "",
    region: "",
    zone_geographique: "",
    district: "",
    city: "",
    address: "",
    secteur: "",
    website: "",
    nb_chambres: "",
    phone: "",
    email: "",
    contact_principal: "",
    contact_fonction: "",
    notes: "",
    status: "Prospect" as const,
    priority: "Medium" as const,
  })

  const resetForm = () => {
    setFormData({
      name: "",
      industry: "",
      category: "",
      region: "",
      zone_geographique: "",
      district: "",
      city: "",
      address: "",
      secteur: "",
      website: "",
      nb_chambres: "",
      phone: "",
      email: "",
      contact_principal: "",
      contact_fonction: "",
      notes: "",
      status: "Prospect",
      priority: "Medium",
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert("Le nom de l'organisation est requis")
      return
    }

    setLoading(true)
    try {
      const orgData: Omit<Organization, "id" | "created_at" | "updated_at"> = {
        ...formData,
        nb_chambres: formData.nb_chambres ? parseInt(formData.nb_chambres) : undefined,
        size: "Medium", // Valeur par défaut
        country: "Maurice", // Valeur par défaut pour Maurice
        prospectStatus: "not_contacted", // Valeur par défaut
        source: "Manuel", // Indique que c'est une saisie manuelle
      }

      await onSubmit(orgData)
      resetForm()
    } catch (error) {
      console.error("Erreur lors de la création:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            Nouvelle Organisation
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Informations de base</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom de l'organisation *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Hôtel Paradise Resort"
                  required
                />
              </div>
              <div>
                <Label htmlFor="industry">Type/Industrie</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="Hôtellerie, Restaurant, Resort..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category">Catégorie (étoiles)</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 étoile">1 étoile</SelectItem>
                    <SelectItem value="2 étoiles">2 étoiles</SelectItem>
                    <SelectItem value="3 étoiles">3 étoiles</SelectItem>
                    <SelectItem value="4 étoiles">4 étoiles</SelectItem>
                    <SelectItem value="5 étoiles">5 étoiles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="secteur">Secteur</Label>
                <Input
                  id="secteur"
                  value={formData.secteur}
                  onChange={(e) => setFormData({ ...formData, secteur: e.target.value })}
                  placeholder="Tourisme, Hôtellerie..."
                />
              </div>
              <div>
                <Label htmlFor="nb_chambres">Nombre de chambres</Label>
                <Input
                  id="nb_chambres"
                  type="number"
                  value={formData.nb_chambres}
                  onChange={(e) => setFormData({ ...formData, nb_chambres: e.target.value })}
                  placeholder="120"
                />
              </div>
            </div>
          </div>

          {/* Localisation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Localisation</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="region">Région</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value) => setFormData({ ...formData, region: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nord">Nord</SelectItem>
                    <SelectItem value="Sud">Sud</SelectItem>
                    <SelectItem value="Est">Est</SelectItem>
                    <SelectItem value="Ouest">Ouest</SelectItem>
                    <SelectItem value="Centre">Centre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="Port Louis, Grand Baie..."
                />
              </div>
              <div>
                <Label htmlFor="zone_geographique">Zone géographique</Label>
                <Input
                  id="zone_geographique"
                  value={formData.zone_geographique}
                  onChange={(e) => setFormData({ ...formData, zone_geographique: e.target.value })}
                  placeholder="Zone touristique..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Grand Baie, Port Louis..."
                />
              </div>
              <div>
                <Label htmlFor="address">Adresse précise</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Royal Street, Port Louis"
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Informations de contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+230 123 4567"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@hotel.mu"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website">Site web</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.hotel.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_principal">Contact principal</Label>
                <Input
                  id="contact_principal"
                  value={formData.contact_principal}
                  onChange={(e) => setFormData({ ...formData, contact_principal: e.target.value })}
                  placeholder="Jean Dupont"
                />
              </div>
              <div>
                <Label htmlFor="contact_fonction">Fonction du contact</Label>
                <Input
                  id="contact_fonction"
                  value={formData.contact_fonction}
                  onChange={(e) => setFormData({ ...formData, contact_fonction: e.target.value })}
                  placeholder="Manager, Directeur..."
                />
              </div>
            </div>
          </div>

          {/* Qualification */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Qualification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Prospect">Prospect</SelectItem>
                    <SelectItem value="Active">Actif</SelectItem>
                    <SelectItem value="Inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priorité</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">Haute</SelectItem>
                    <SelectItem value="Medium">Moyenne</SelectItem>
                    <SelectItem value="Low">Basse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Notes</h3>
            <div>
              <Label htmlFor="notes">Commentaires</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes additionnelles sur cette organisation..."
                rows={3}
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-6 border-t">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Création..." : "Créer l'Organisation"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
