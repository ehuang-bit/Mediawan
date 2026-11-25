import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { mediawanApiPlugin } from './server/apiPlugin';

export default defineConfig({
  plugins: [react(), tailwindcss(), mediawanApiPlugin()],
});
