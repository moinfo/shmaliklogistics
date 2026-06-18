import { Menu, Box } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';

/**
 * Dropdown that downloads the current report as PDF or Excel.
 *
 * Renders plain <a> links (NOT Inertia <Link>) because the response is a binary
 * file download with Content-Disposition: attachment — Inertia must not try to
 * intercept it. Current page filters are passed via `params` so the export
 * matches what the user is looking at.
 */
export default function ExportMenu({ baseUrl, params = {} }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';

    const link = (format) => {
        const q = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
            if (v !== '' && v !== null && v !== undefined) q.append(k, v);
        });
        q.append('format', format);
        return `${baseUrl}?${q.toString()}`;
    };

    return (
        <Menu shadow="md" width={190} position="bottom-end" withinPortal>
            <Menu.Target>
                <Box
                    component="button"
                    type="button"
                    style={{
                        padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: 'linear-gradient(135deg,#1565C0,#2196F3)', color: '#fff',
                        fontWeight: 600, fontSize: 13, boxShadow: '0 4px 16px rgba(33,150,243,0.30)',
                    }}
                >
                    ⬇ Export ▾
                </Box>
            </Menu.Target>
            <Menu.Dropdown style={{ background: isDark ? '#0F1E32' : '#fff' }}>
                <Menu.Item component="a" href={link('pdf')} leftSection={<span>📄</span>}>
                    PDF document
                </Menu.Item>
                <Menu.Item component="a" href={link('excel')} leftSection={<span>📊</span>}>
                    Excel (XLSX)
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
}
