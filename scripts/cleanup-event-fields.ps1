# PowerShell script to clean deprecated fields from all event YAML files
# Removes: backup_url, recording_expected, recording_url

$eventsDir = "d:\FreeIran\data\events"
$files = Get-ChildItem -Path $eventsDir -Filter "ev-*.yaml"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Remove the deprecated fields (both with values and commented out)
    $content = $content -replace '(?m)^\s*backup_url:.*$\r?\n?', ''
    $content = $content -replace '(?m)^\s*recording_expected:.*$\r?\n?', ''
    $content = $content -replace '(?m)^\s*recording_url:.*$\r?\n?', ''
    
    # Remove commented versions  
    $content = $content -replace '(?m)^\s*#\s*backup_url:.*$\r?\n?', ''
    $content = $content -replace '(?m)^\s*#\s*recording_expected:.*$\r?\n?', ''
    $content = $content -replace '(?m)^\s*#\s*recording_url:.*$\r?\n?', ''
    
    # Clean up multiple consecutive blank lines
    $content = $content -replace '(\r?\n){3,}', "`n`n"
    
    Set-Content -Path $file.FullName -Value $content -NoNewline
    Write-Host "Cleaned: $($file.Name)"
}

Write-Host "`nDone! Cleaned $($files.Count) files."
