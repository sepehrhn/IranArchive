# PowerShell script to revert 'announcement' placeholders to empty
# Revert "https://example.com/announcement" to ""

$eventsDir = "d:\FreeIran\data\events"
$files = Get-ChildItem -Path $eventsDir -Filter "ev-*.yaml"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Replace placeholder with empty string
    if ($content -match 'announcement:\s*"https://example.com/announcement"') {
        $content = $content -replace 'announcement:\s*"https://example.com/announcement"', 'announcement: ""'
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Reverted: $($file.Name)"
    } else {
        Write-Host "Skipped: $($file.Name)"
    }
}

Write-Host "`nDone! Processed $($files.Count) files."
