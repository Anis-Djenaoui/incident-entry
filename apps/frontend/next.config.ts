import type { NextConfig } from 'next';
import path from 'path';

/**
 * Sous-chemin de montage de l'application (reverse proxy).
 * Vide par défaut (déploiement à la racine), `/request-buat` derrière le Nginx
 * de archivage.buaa.dz. Doit commencer par `/` et ne pas finir par `/`.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
  basePath: basePath || undefined,
  // Sert les assets `_next/static` sous le même préfixe que basePath.
  assetPrefix: basePath || undefined,
  // Derrière un reverse proxy qui termine sur /request-buat/ : évite la boucle
  // 308 (Next enlève le slash) ↔ 301 (Nginx ajoute le slash).
  trailingSlash: !!basePath,
};

export default nextConfig;
