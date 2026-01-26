#!/bin/bash

# Script para crear una nueva rama de feature rápidamente
# Uso: ./scripts/git-new-feature.sh HU-XXX "descripcion-corta"

if [ $# -ne 2 ]; then
  echo "❌ Uso: ./scripts/git-new-feature.sh HU-XXX \"descripcion-corta\""
  echo "Ejemplo: ./scripts/git-new-feature.sh HU-005 \"crud-departamentos\""
  exit 1
fi

HU_NUMBER=$1
DESCRIPTION=$2
BRANCH_NAME="feature/${HU_NUMBER}-${DESCRIPTION}"

echo "🌿 Creando nueva rama: $BRANCH_NAME"
echo ""

# Asegurarse de estar en develop actualizado
echo "📥 Actualizando develop..."
git checkout develop
git pull origin develop

# Crear y cambiar a la nueva rama
echo "✨ Creando rama $BRANCH_NAME..."
git checkout -b "$BRANCH_NAME"

echo ""
echo "✅ ¡Listo! Estás en la rama: $BRANCH_NAME"
echo ""
echo "📝 Próximos pasos:"
echo "  1. Implementa la funcionalidad"
echo "  2. Haz commits frecuentes: git commit -m \"feat(...): ...\""
echo "  3. Push: git push -u origin $BRANCH_NAME"
echo "  4. Crea Pull Request en GitHub"
echo ""
