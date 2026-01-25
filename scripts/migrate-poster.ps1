# PowerShell script to rename 'poster' to 'announcement' or add it if missing

$eventsDir = "d:\FreeIran\data\events"
$files = Get-ChildItem -Path $eventsDir -Filter "ev-*.yaml"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Rename poster to announcement if present
    if ($content -match '(?m)^poster:') {
        $content = $content -replace '(?m)^poster:', 'announcement:'
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Renamed: $($file.Name)"
    }
    # Add announcement if missing
    elseif (-not ($content -match '(?m)^announcement:')) {
        # Append before 'organizer:' or at end
        if ($content -match '(?m)^organizer:') {
             $content = $content -replace '(?m)^organizer:', "announcement: ~`n`norganizer:"
        } else {
             $content += "`nannouncement: ~"
        }
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Added: $($file.Name)"
    } else {
        Write-Host "Skipped (already exists): $($file.Name)"
    }
}

Write-Host "`nDone! Processed $($files.Count) files."
