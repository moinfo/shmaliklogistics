import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { MantineProvider, createTheme, ColorSchemeScript } from '@mantine/core';
import '@mantine/core/styles.css';
import '../css/app.css';
import { LanguageProvider } from './contexts/LanguageContext';

const theme = createTheme({
    primaryColor: 'brand',
    colors: {
        brand: [
            '#FFF4EE',
            '#FFE0CC',
            '#FFC09A',
            '#FE9960',
            '#F97316',
            '#EA580C',
            '#C2410C',
            '#9A3412',
            '#431407',
            '#1C0800',
        ],
    },
    fontFamily: 'Inter, system-ui, sans-serif',
    headings: { fontFamily: 'Inter, system-ui, sans-serif' },
});

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.jsx', { eager: true });
        return pages[`./pages/${name}.jsx`];
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <MantineProvider theme={theme} defaultColorScheme="light">
                <LanguageProvider>
                    <App {...props} />
                </LanguageProvider>
            </MantineProvider>
        );
    },
});
