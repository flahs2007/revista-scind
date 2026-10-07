param()

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$revistasDir = Join-Path $root 'revistas'
$contentFile = Join-Path $revistasDir 'contenido.js'

if (-not (Test-Path -LiteralPath $revistasDir)) {
  New-Item -ItemType Directory -Path $revistasDir | Out-Null
}

$pdfs = Get-ChildItem -LiteralPath $revistasDir -Filter *.pdf -File | Sort-Object LastWriteTime -Descending

if ($pdfs.Count -eq 0) {
  Write-Host "No hay PDFs en la carpeta revistas/." -ForegroundColor Yellow
  Write-Host "No se hizo ningun cambio en contenido.js"
  exit 0
}

$editions = @()
for ($i = 0; $i -lt $pdfs.Count; $i++) {
  $pdf = $pdfs[$i]
  $base = [IO.Path]::GetFileNameWithoutExtension($pdf.Name)
  $title = ($base -replace '[_-]+', ' ').Trim()
  if (-not $title) { $title = $pdf.Name }
  else {
    $title = (Get-Culture).TextInfo.ToTitleCase($title.ToLower())
    $title = $title -replace '(?i)\bScind\b', 'SCIND' -replace '(?i)\bUcb\b', 'UCB' -replace '(?i)\bPdf\b', 'PDF'
  }

  $editions += [pscustomobject]@{
    current = ($i -eq 0)
    title = $title
    description = "Edicion publicada por la Sociedad Cientifica de Ingenieria Industrial."
    pdf = $pdf.Name
  }
}

$data = [pscustomobject]@{ editions = $editions }
$json = $data | ConvertTo-Json -Depth 10
$output = "window.REVISTA_CONTENIDO = $json;`r`n"
Set-Content -Encoding UTF8 -Path $contentFile -Value $output

Write-Host "Listo. Se actualizaron las ediciones automaticamente." -ForegroundColor Green
Write-Host "PDF detectados: $($pdfs.Count)"
Write-Host "Archivo generado: $contentFile"
