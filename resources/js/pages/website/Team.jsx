import { Head, Link } from '@inertiajs/react';
import { Box, Container, Title, Text, Stack, SimpleGrid, Badge, TextInput } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import WebsiteLayout from '../../layouts/WebsiteLayout';

const block = (e) => e.preventDefault();

export default function Team({ employees }) {
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return employees;
        return employees.filter(
            (e) => e.name.toLowerCase().includes(q) || e.roles.some((r) => r.toLowerCase().includes(q))
        );
    }, [query, employees]);

    return (
        <WebsiteLayout>
            <Head title="Our Team — Trans-Mas Logistics" />

            {/* ── Hero ── */}
            <Box style={{ position: 'relative', overflow: 'hidden', minHeight: 300, display: 'flex', alignItems: 'center', background: 'linear-gradient(135deg, #0A0400 0%, #C2410C 100%)' }}>
                <Box style={{ position: 'absolute', inset: 0, background: 'rgba(10,4,0,0.4)' }} />
                <Container size="xl" style={{ position: 'relative', zIndex: 1 }} py={72}>
                    <Stack align="center" gap="md">
                        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <Badge color="orange" variant="light" size="xl" radius="xl">Our People</Badge>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
                            <Title order={1} c="white" ta="center" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900 }}>
                                Meet the{' '}
                                <Text component="span" style={{ background: 'linear-gradient(135deg, #EA580C, #FB923C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} inherit>
                                    Team
                                </Text>
                            </Title>
                        </motion.div>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                            <Text c="gray.3" ta="center" size="md" maw={480}>
                                Scan an NFC card or tap a member to connect.
                            </Text>
                        </motion.div>
                    </Stack>
                </Container>
            </Box>

            {/* ── Search ── */}
            <Box style={{ background: isDark ? '#080f1e' : '#f0f4f8' }} pt={40} pb={0}>
                <Container size="lg">
                    <TextInput
                        placeholder="Search by name or role…"
                        value={query}
                        onChange={(e) => setQuery(e.currentTarget.value)}
                        size="md"
                        radius="xl"
                        styles={{
                            input: {
                                background: isDark ? '#1A0800' : '#fff',
                                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                                color: isDark ? '#fff' : '#111',
                                paddingLeft: 20,
                            },
                        }}
                        leftSection={<span style={{ paddingLeft: 4, color: '#888' }}>🔍</span>}
                    />
                    {query && (
                        <Text size="sm" c="dimmed" mt={8} pl={4}>
                            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{query}"
                        </Text>
                    )}
                </Container>
            </Box>

            {/* ── Grid ── */}
            <Box py={40} style={{ background: isDark ? '#080f1e' : '#f0f4f8' }}>
                <Container size="lg">
                    <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="lg">
                        {filtered.map((emp, i) => (
                            <motion.div
                                key={emp.slug}
                                initial={{ opacity: 0, y: 28 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: i * 0.06 }}
                                whileHover={{ y: -8, scale: 1.025 }}
                                style={{ cursor: 'pointer' }}
                            >
                                <Link href={`/team/${emp.slug}`} style={{ textDecoration: 'none' }}>
                                    <Box
                                        style={{
                                            borderRadius: 18,
                                            overflow: 'hidden',
                                            boxShadow: isDark
                                                ? '0 8px 40px rgba(0,0,0,0.5)'
                                                : '0 4px 24px rgba(0,0,0,0.12)',
                                            border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.06)',
                                            background: isDark ? '#1A0800' : '#fff',
                                            transition: 'box-shadow 0.25s',
                                            position: 'relative',
                                        }}
                                    >
                                        {/* Full portrait card image */}
                                        <Box style={{ width: '100%', aspectRatio: '0.63 / 1', overflow: 'hidden', background: '#0A0400', position: 'relative' }}>
                                            <img
                                                src={emp.image}
                                                alt={emp.name}
                                                draggable="false"
                                                onContextMenu={block}
                                                onDragStart={block}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block', userSelect: 'none', WebkitUserDrag: 'none' }}
                                            />
                                            <div onContextMenu={block} onDragStart={block} style={{ position: 'absolute', inset: 0, zIndex: 1, WebkitTouchCallout: 'none' }} />
                                        </Box>

                                        {/* Role badge pinned at bottom */}
                                        <Box
                                            style={{
                                                padding: '10px 12px 12px',
                                                background: isDark
                                                    ? 'linear-gradient(180deg, #1A0800 0%, #0A0400 100%)'
                                                    : 'linear-gradient(180deg, #ffffff 0%, #fff5f0 100%)',
                                                borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)',
                                            }}
                                        >
                                            <Text
                                                fw={700}
                                                size="xs"
                                                c={isDark ? 'white' : 'dark.7'}
                                                lineClamp={1}
                                                style={{ letterSpacing: 0.1 }}
                                            >
                                                {emp.name}
                                            </Text>
                                            <Text
                                                c="orange.5"
                                                size="xs"
                                                mt={3}
                                                fw={500}
                                                lineClamp={1}
                                                style={{ fontSize: 11 }}
                                            >
                                                {emp.roles.join(' · ')}
                                            </Text>
                                        </Box>
                                    </Box>
                                </Link>
                            </motion.div>
                        ))}
                    </SimpleGrid>
                </Container>
            </Box>
        </WebsiteLayout>
    );
}
