# PowerShell script to force all events to be 'in_person'
# and clear 'online' fields to avoid schema ambiguity (though online is optional)

$eventsDir = "d:\FreeIran\data\events"
$files = Get-ChildItem -Path $eventsDir -Filter "ev-*.yaml"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $changed = $false

    # Change type: hybrid/online -> in_person
    if ($content -match 'type:\s*(hybrid|online)') {
        $content = $content -replace 'type:\s*(hybrid|online)', 'type: in_person'
        $changed = $true
    }

    # Optional: Clear online fields or leave them? 
    # Schema validation for in_person doesn't enforce online fields.
    # But clean data is better. User said "wrongly set as hybrid".
    # I'll let them be.

    if ($changed) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated type: $($file.Name)"
    } else {
        Write-Host "Skipped: $($file.Name)"
    }
}

Write-Host "`nDone! Processed $($files.Count) files."
