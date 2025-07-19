#!/bin/bash
# Fix missing dependencies for the build

echo "🔧 Installing missing dependencies..."

# Install the missing packages
npm install --save \
  mapbox-gl \
  @radix-ui/react-avatar \
  @radix-ui/react-slot \
  class-variance-authority

# Also install the types for mapbox-gl
npm install --save-dev @types/mapbox-gl

echo "✅ Dependencies installed!"
echo ""
echo "📝 Updated package.json with:"
echo "  - mapbox-gl (for PhilippineMap component)"
echo "  - @radix-ui/react-avatar (for Avatar UI)"
echo "  - @radix-ui/react-slot (for composable components)"
echo "  - class-variance-authority (for variant styling)"
echo ""
echo "🚀 Now you can run:"
echo "  - npm run build (locally)"
echo "  - git add ."
echo "  - git commit -m 'fix: add missing dependencies'"
echo "  - git push"
echo "  - vercel (to deploy)"