# Script PowerShell para crear una nueva rama de feature
# Uso: .\scripts\git-new-feature.ps1 HU-XXX "descripcion-corta"

param(
    [Parameter(Mandatory=$true)]
    [string]$HuNumber,
    
    [Parameter(Mandatory=$true)]
    [string]$Description
)

$BranchName = "feature/$HuNumber-$Description"

Write-Host "🌿 Creando nueva rama: $BranchName" -ForegroundColor Green
Write-Host ""

# Asegurarse de estar en develop actualizado
Write-Host "📥 Actualizando develop..." -ForegroundColor Yellow
git checkout develop
git pull origin develop

# Crear y cambiar a la nueva rama
Write-Host "✨ Creando rama $BranchName..." -ForegroundColor Cyan
git checkout -b $BranchName

Write-Host ""
Write-Host "✅ ¡Listo! Estás en la rama: $BranchName" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos pasos:" -ForegroundColor Yellow
Write-Host "  1. Implementa la funcionalidad"
Write-Host "  2. Haz commits frecuentes: git commit -m 'feat(...): ...'"
Write-Host "  3. Push: git push -u origin $BranchName"
Write-Host "  4. Crea Pull Request en GitHub"
Write-Host ""
