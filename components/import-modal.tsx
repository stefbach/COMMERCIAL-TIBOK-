"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, ArrowRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { ImportResult } from "@/types/crm"

interface ImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (data: any[]) => Promise<ImportResult>
  type: "organizations" | "contacts"
}

export function ImportModal({ isOpen, onClose, onImport, type }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [step, setStep] = useState<"upload" | "mapping" | "result">("upload")
  const [parsedData, setParsedData] = useState<any[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})

  const getExpectedFields = () => {
    if (type === "organizations") {
      return [
        // Champs SEULEMENT de votre table organizations
        { key: "name", label: "Nom", required: true },
        { key: "industry", label: "Type/Industrie", required: false },
        { key: "category", label: "Catégorie (étoiles)", required: false },
        { key: "region", label: "Région", required: false },
        { key: "zone_geographique", label: "Zone géographique", required: false },
        { key: "district", label: "District", required: false },
        { key: "city", label: "Ville", required: false },
        { key: "address", label: "Adresse précise", required: false },
        { key: "secteur", label: "Secteur", required: false },
        { key: "website", label: "Site web officiel", required: false },
        { key: "nb_chambres", label: "Nombre de chambres", required: false },
        { key: "phone", label: "Téléphone", required: false },
        { key: "email", label: "Email", required: false },
        { key: "contact_principal", label: "Contact principal", required: false },
        { key: "notes", label: "Notes/Commentaires", required: false },
        { key: "status", label: "Statut", required: false },
      ]
    } else {
      return [
        { key: "firstName", label: "Prénom", required: true },
        { key: "lastName", label: "Nom", required: true },
        { key: "email", label: "Email", required: false },
        { key: "phone", label: "Téléphone", required: false },
        { key: "position", label: "Poste", required: false },
        { key: "notes", label: "Notes", required: false },
      ]
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
      setStep("upload")
    }
  }

  const parseCSV = (text: string): any[] => {
    const lines = text.split("\n").filter((line) => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
    const data = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
      const row: any = {}
      headers.forEach((header, index) => {
        row[header.toLowerCase().replace(/\s+/g, "_")] = values[index] || ""
      })
      data.push(row)
    }

    return data
  }

  const parseExcel = async (file: File): Promise<any[]> => {
    try {
      const XLSX = await import("xlsx")

      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: "array" })

      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]

      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
      }) as any[][]

      if (jsonData.length < 2) return []

      const headers = jsonData[0].map((h: any) => String(h).toLowerCase().replace(/\s+/g, "_").trim())

      const data = []
      for (let i = 1; i < jsonData.length; i++) {
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = String(jsonData[i][index] || "").trim()
        })
        if (Object.values(row).some((val) => val !== "")) {
          data.push(row)
        }
      }

      return data
    } catch (error) {
      console.error("Excel parsing error:", error)
      throw new Error(`Failed to parse Excel file: ${(error as Error).message}`)
    }
  }

  const handleParseFile = async () => {
    if (!file) return

    setImporting(true)
    try {
      let data: any[] = []

      const fileExtension = file.name.toLowerCase().split(".").pop()

      if (fileExtension === "csv") {
        const text = await file.text()
        data = parseCSV(text)
      } else if (fileExtension === "xlsx" || fileExtension === "xls") {
        data = await parseExcel(file)
      } else {
        throw new Error("Format de fichier non supporté. Utilisez des fichiers CSV, XLS ou XLSX.")
      }

      if (data.length === 0) {
        throw new Error("Aucune donnée trouvée dans le fichier ou le fichier est vide.")
      }

      console.log("[v0] Parsed data:", data.slice(0, 3))
      setParsedData(data)

      // Mapping automatique intelligent basé sur VOTRE schéma
      const fileColumns = Object.keys(data[0] || {})
      const expectedFields = getExpectedFields()
      const autoMapping: Record<string, string> = {}

      expectedFields.forEach((field) => {
        const matchingColumn = fileColumns.find((col) => {
          const colLower = col.toLowerCase()
          const fieldKeyLower = field.key.toLowerCase()
          
          // Mappings spécifiques pour votre schéma
          switch (field.key) {
            case "name":
              return colLower.includes("nom") || colLower.includes("name") || 
                     colLower.includes("etablissement") || colLower === "nom"
            case "industry":
              return colLower.includes("type") || colLower.includes("industrie") || 
                     colLower.includes("activite") || colLower.includes("industry")
            case "category":
              return colLower.includes("categorie") || colLower.includes("etoiles") || 
                     colLower.includes("category") || colLower.includes("stars")
            case "region":
              return colLower.includes("region") || colLower === "region"
            case "zone_geographique":
              return colLower.includes("zone") && colLower.includes("geographique") ||
                     colLower.includes("zone_geographique") || colLower.includes("zone")
            case "district":
              return colLower.includes("district") || colLower === "district"
            case "city":
              return colLower.includes("ville") || colLower.includes("city") || 
                     colLower === "ville" || colLower === "city"
            case "address":
              return colLower.includes("adresse") || colLower.includes("address") || 
                     colLower.includes("precise") || colLower === "adresse"
            case "secteur":
              return colLower.includes("secteur") || colLower === "secteur"
            case "website":
              return colLower.includes("site") || colLower.includes("web") || 
                     colLower.includes("website") || colLower.includes("officiel")
            case "nb_chambres":
              return colLower.includes("chambres") || colLower.includes("rooms") || 
                     colLower.includes("nb") && colLower.includes("chambres")
            case "phone":
              return colLower.includes("tel") || colLower.includes("phone") || 
                     colLower.includes("telephone") || colLower === "tel"
            case "email":
              return colLower.includes("email") || colLower.includes("mail") || 
                     colLower === "email"
            case "contact_principal":
              return colLower.includes("contact") && colLower.includes("principal") ||
                     colLower.includes("contact_principal") || colLower.includes("contact_nom") ||
                     colLower.includes("contact_name")
            case "notes":
              return colLower.includes("commentaires") || colLower.includes("notes") || 
                     colLower === "notes" || colLower === "commentaires"
            case "status":
              return colLower.includes("statut") || colLower.includes("status") || 
                     colLower === "statut"
            default:
              return colLower.includes(fieldKeyLower) || fieldKeyLower.includes(colLower)
          }
        })
        
        if (matchingColumn) {
          autoMapping[field.key] = matchingColumn
        }
      })

      console.log("[v0] Auto mapping:", autoMapping)
      setColumnMapping(autoMapping)
      setStep("mapping")
    } catch (error) {
      console.error("[v0] Parse error:", error)
      setResult({
        success: false,
        imported: 0,
        errors: [(error as Error).message],
        duplicates: 0,
      })
      setStep("result")
    } finally {
      setImporting(false)
    }
  }

  const handleFinalImport = async () => {
    setImporting(true)
    try {
      const mappedData = parsedData.map((row) => {
        const mappedRow: any = {}
        Object.entries(columnMapping).forEach(([targetField, sourceColumn]) => {
          if (sourceColumn && sourceColumn !== "" && sourceColumn !== "skip" && row[sourceColumn] !== undefined) {
            let value = row[sourceColumn]
            
            // Conversion spéciale pour nb_chambres
            if (targetField === "nb_chambres" && value) {
              const parsed = parseInt(value.toString().replace(/[^\d]/g, ''))
              mappedRow[targetField] = isNaN(parsed) ? undefined : parsed
            } else if (value && value.toString().trim() !== "") {
              mappedRow[targetField] = value.toString().trim()
            }
          }
        })
        return mappedRow
      })

      // Filtrer les lignes vides (sans nom)
      const validData = mappedData.filter(row => row.name && row.name.trim() !== "")

      console.log("[v0] Mapped data:", validData.slice(0, 3))
      console.log("[v0] Total valid records:", validData.length)
      
      const importResult = await onImport(validData)
      setResult(importResult)
      setStep("result")
    } catch (error) {
      console.error("[v0] Import error:", error)
      setResult({
        success: false,
        imported: 0,
        errors: [(error as Error).message],
        duplicates: 0,
      })
      setStep("result")
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setResult(null)
    setParsedData([])
    setColumnMapping({})
    setStep("upload")
    onClose()
  }

  const fileColumns = parsedData.length > 0 ? Object.keys(parsedData[0]) : []
  const expectedFields = getExpectedFields()
  const requiredFieldsMapped = expectedFields.filter(f => f.required).every(f => columnMapping[f.key] && columnMapping[f.key] !== "skip")

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import {type === "organizations" ? "Organisations" : "Contacts"}
            {step === "mapping" && " - Mappage des colonnes"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {step === "upload" && (
            <>
              <div>
                <Label htmlFor="file">Sélectionnez un fichier CSV ou Excel</Label>
                <Input id="file" type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">Formats supportés : CSV, Excel (.xlsx, .xls)</p>
              </div>

              {type === "organizations" && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Colonnes attendues pour les organisations :</h4>
                  <div className="text-xs text-blue-700 space-y-1">
                    <p><strong>Obligatoire :</strong> Nom</p>
                    <p><strong>Optionnel :</strong> Type/Industrie, Catégorie (étoiles), Région, Zone géographique, District, Ville, Adresse précise, Secteur, Site web, Nombre de chambres, Téléphone, Email, Contact principal, Notes, Statut</p>
                  </div>
                </div>
              )}

              {file && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm font-medium">{file.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(file.size / 1024).toFixed(1)} KB • {file.name.split(".").pop()?.toUpperCase()} file
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleClose} variant="outline" className="flex-1">
                  Annuler
                </Button>
                <Button onClick={handleParseFile} disabled={!file || importing} className="flex-1">
                  {importing ? "Analyse..." : "Suivant"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}

          {step === "mapping" && (
            <>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Mappez les colonnes de votre fichier avec les champs attendus. Les champs obligatoires sont marqués d'un *.
                </div>

                {!requiredFieldsMapped && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      Certains champs obligatoires ne sont pas mappés. Veuillez mapper au minimum le champ "Nom".
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-3 max-h-64 overflow-y-auto">
                  {expectedFields.map((field) => (
                    <div key={field.key} className="flex items-center gap-3 p-2 border rounded-lg">
                      <div className="w-1/3">
                        <Label className="text-sm font-medium">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <Select
                          value={columnMapping[field.key] || "skip"}
                          onValueChange={(value) =>
                            setColumnMapping((prev) => ({
                              ...prev,
                              [field.key]: value === "skip" ? "" : value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une colonne..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="skip">-- Ignorer ce champ --</SelectItem>
                            {fileColumns.map((column) => (
                              <SelectItem key={column} value={column || `column_${Math.random()}`}>
                                {column || "Colonne sans nom"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>

                {parsedData.length > 0 && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Aperçu (3 premières lignes) :</Label>
                    <div className="mt-2 text-xs bg-muted p-3 rounded-lg overflow-x-auto max-h-40">
                      <pre>{JSON.stringify(parsedData.slice(0, 3), null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep("upload")} variant="outline" className="flex-1">
                  Retour
                </Button>
                <Button 
                  onClick={handleFinalImport} 
                  disabled={importing || !requiredFieldsMapped} 
                  className="flex-1"
                >
                  {importing ? "Import en cours..." : `Importer ${parsedData.length} enregistrements`}
                </Button>
              </div>
            </>
          )}

          {step === "result" && result && (
            <div className="space-y-3">
              <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                    {result.success 
                      ? `${result.imported} enregistrement(s) importé(s) avec succès` 
                      : "Échec de l'importation"}
                  </AlertDescription>
                </div>
              </Alert>

              {result.errors.length > 0 && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  <p className="font-medium mb-2">Erreurs :</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <div key={index} className="text-xs">• {error}</div>
                    ))}
                  </div>
                </div>
              )}

              {result.success && result.imported > 0 && (
                <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                  <p className="font-medium">Import terminé avec succès !</p>
                  <p className="text-xs mt-1">{result.imported} organisation(s) ajoutée(s) à votre base de données.</p>
                </div>
              )}

              <Button onClick={handleClose} className="w-full">
                Fermer
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
