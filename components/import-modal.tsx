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
        { key: "name", label: "Nom", required: true },
        { key: "industry", label: "Type", required: false },
        { key: "category", label: "Categorie (etoiles)", required: false },
        { key: "region", label: "Region", required: false },
        { key: "zone_geographique", label: "Zone geographique", required: false },
        { key: "district", label: "District", required: false },
        { key: "city", label: "Ville", required: false },
        { key: "address", label: "Adresse precise", required: false },
        { key: "secteur", label: "Secteur", required: false },
        { key: "website", label: "Site web officiel", required: false },
        { key: "nb_chambres", label: "Nb de chambres", required: false },
        { key: "phone", label: "Téléphone", required: false },
        { key: "email", label: "Email", required: false },
        { key: "notes", label: "Commentaires", required: false },
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
        throw new Error("Unsupported file format. Please use CSV, XLS, or XLSX files.")
      }

      if (data.length === 0) {
        throw new Error("No data found in file or file is empty.")
      }

      console.log("[v0] Parsed data:", data.slice(0, 3))
      setParsedData(data)

      const fileColumns = Object.keys(data[0] || {})
      const expectedFields = getExpectedFields()
      const autoMapping: Record<string, string> = {}

      expectedFields.forEach((field) => {
        const matchingColumn = fileColumns.find(
          (col) =>
            col.toLowerCase().includes(field.key.toLowerCase()) ||
            field.label.toLowerCase().includes(col.toLowerCase()) ||
            (field.key === "name" && (col.includes("nom") || col.includes("name"))) ||
            (field.key === "industry" && (col.includes("type") || col.includes("activite"))) ||
            (field.key === "category" && (col.includes("categorie") || col.includes("etoiles"))) ||
            (field.key === "region" && col.includes("region")) ||
            (field.key === "zone_geographique" && (col.includes("zone") || col.includes("geographique"))) ||
            (field.key === "district" && col.includes("district")) ||
            (field.key === "city" && (col.includes("ville") || col.includes("city"))) ||
            (field.key === "address" && (col.includes("adresse") || col.includes("address"))) ||
            (field.key === "secteur" && col.includes("secteur")) ||
            (field.key === "website" && (col.includes("site") || col.includes("web") || col.includes("website"))) ||
            (field.key === "nb_chambres" && (col.includes("chambres") || col.includes("rooms"))) ||
            (field.key === "phone" && (col.includes("tel") || col.includes("phone"))) ||
            (field.key === "email" && col.includes("email")) ||
            (field.key === "notes" && (col.includes("commentaires") || col.includes("notes"))),
        )
        if (matchingColumn) {
          autoMapping[field.key] = matchingColumn
        }
      })

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
          if (sourceColumn && sourceColumn !== "" && sourceColumn !== "skip" && row[sourceColumn]) {
            mappedRow[targetField] = row[sourceColumn]
          }
        })
        return mappedRow
      })

      console.log("[v0] Mapped data:", mappedData.slice(0, 3))
      const importResult = await onImport(mappedData)
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import {type === "organizations" ? "Organizations" : "Contacts"}
            {step === "mapping" && " - Column Mapping"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {step === "upload" && (
            <>
              <div>
                <Label htmlFor="file">Select CSV or Excel file</Label>
                <Input id="file" type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="mt-1" />
                <p className="text-xs text-muted-foreground mt-1">Supported formats: CSV, Excel (.xlsx, .xls)</p>
              </div>

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
                <Button onClick={handleClose} variant="outline" className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button onClick={handleParseFile} disabled={!file || importing} className="flex-1">
                  {importing ? "Parsing..." : "Next"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}

          {step === "mapping" && (
            <>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Map the columns from your file to the expected fields. Required fields are marked with *.
                </div>

                <div className="grid gap-3">
                  {expectedFields.map((field) => (
                    <div key={field.key} className="flex items-center gap-3">
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
                            <SelectValue placeholder="Select column..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="skip">-- Skip this field --</SelectItem>
                            {fileColumns.map((column) => (
                              <SelectItem key={column} value={column || `column_${Math.random()}`}>
                                {column || "Unnamed Column"}
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
                    <Label className="text-sm font-medium">Preview (first 3 rows):</Label>
                    <div className="mt-2 text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                      <pre>{JSON.stringify(parsedData.slice(0, 3), null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep("upload")} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button onClick={handleFinalImport} disabled={importing} className="flex-1">
                  {importing ? "Importing..." : `Import ${parsedData.length} records`}
                </Button>
              </div>
            </>
          )}

          {step === "result" && result && (
            <div className="space-y-3">
              <Alert className={result.success ? "border-green-200" : "border-red-200"}>
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <AlertDescription>
                    {result.success ? `Successfully imported ${result.imported} records` : "Import failed"}
                  </AlertDescription>
                </div>
              </Alert>

              {result.errors.length > 0 && (
                <div className="text-sm text-red-600">
                  <p className="font-medium">Errors:</p>
                  <ul className="list-disc list-inside">
                    {result.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
