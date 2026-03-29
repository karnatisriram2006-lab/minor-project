$files = Get-ChildItem "src/app" -Recurse -Filter "*.tsx"
foreach ($f in $files) {
  $content = Get-Content $f.FullName -Raw
  if ($content -match "pt-24 pb-20") {
    $content = $content -replace "pt-24 pb-20", "pt-6 pb-24 sm:pt-8 sm:pb-12"
    Set-Content $f.FullName $content -NoNewline
    Write-Host "Updated: $($f.Name)"
  }
}
