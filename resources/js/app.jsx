import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { MantineProvider, createTheme, ColorSchemeScript } from '@mantine/core';
import '@mantine/core/styles.css';
import { LanguageProvider } from './contexts/LanguageContext';

const theme = createTheme({
    primaryColor: 'brand',
    colors: {
        brand: [
            '#E3F0FF',
            '#B3D4FF',
            '#80B8FF',
            '#4D9BFF',
            '#2196F3',
            '#1565C0',
            '#0E4FA0',
            '#0A3A7A',
            '#0A1628',
            '#050D18',
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
