$pdfPath = (Resolve-Path '.\revistas\entrevista-scind.pdf').Path
$bytes = [System.IO.File]::ReadAllBytes($pdfPath)
$jpegStarts = New-Object System.Collections.Generic.List[int]

for ($i = 0; $i -lt $bytes.Length - 3; $i++) {
    if ($bytes[$i] -eq 0xFF -and $bytes[$i+1] -eq 0xD8 -and $bytes[$i+2] -eq 0xFF) {
        $jpegStarts.Add($i)
    }
}

Write-Host "JPEG headers found: $($jpegStarts.Count)"

$imgDir = Join-Path (Split-Path -Parent $pdfPath) 'img'
if (-not (Test-Path $imgDir)) {
    New-Item -ItemType Directory -Force -Path $imgDir | Out-Null
}

$saved = 0
for ($k = 0; $k -lt $jpegStarts.Count; $k++) {
    $start = $jpegStarts[$k]
    $end = -1
    for ($j = $start + 2; $j -lt $bytes.Length - 1; $j++) {
        if ($bytes[$j] -eq 0xFF -and $bytes[$j+1] -eq 0xD9) {
            $end = $j + 2
            break
        }
    }
    if ($end -ne -1 -and ($end - $start) -gt 50000) {
        $saved++
        $len = $end - $start
        $imgBytes = New-Object byte[] $len
        [System.Array]::Copy($bytes, $start, $imgBytes, 0, $len)
        $outPath = Join-Path $imgDir "pagina-$saved.jpg"
        [System.IO.File]::WriteAllBytes($outPath, $imgBytes)
        Write-Host "Guardado: $outPath (Tamano: $len bytes)"
    }
}
Write-Host "Total imagenes de alta resolucion guardadas: $saved"
