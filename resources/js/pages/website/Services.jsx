import { Head, Link } from '@inertiajs/react';
import { Box, Container, Title, Text, Stack, SimpleGrid, Badge, Group, Button } from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { motion } from 'framer-motion';
import WebsiteLayout from '../../layouts/WebsiteLayout';
import { ScrollReveal, StaggerContainer, HoverCard, fadeUp, fadeLeft, fadeRight, glass, MeshBackground } from '../../components/Animate';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Services() {
    const { T } = useLanguage();
    const { colorScheme } = useMantineColorScheme();
    const isDark = colorScheme === 'dark';
    const { hero, highlights, items, cta } = T.services;

    return (
        <WebsiteLayout>
            <Head title={`${hero.title} ${hero.highlight} — Trans-Mas Logistics`} />

            {/* ── Hero ── */}
            <Box style={{ position: 'relative', overflow: 'hidden', minHeight: 420, display: 'flex', alignItems: 'center' }}>
                <Box style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1920&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                {isDark && <Box style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,4,0,0.96) 0%, rgba(194,65,12,0.85) 100%)' }} />}
                {!isDark && <Box style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.88) 30%, rgba(255,255,255,0.4) 58%, rgba(255,255,255,0.0) 78%)' }} />}
                {isDark && [...Array(3)].map((_, i) => (
                    <motion.div key={i} style={{ position: 'absolute', borderRadius: '50%', border: '1px solid rgba(234,88,12,0.15)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}
                        animate={{ width: [200 + i * 150, 250 + i * 150, 200 + i * 150], height: [200 + i * 150, 250 + i * 150, 200 + i * 150], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }} />
                ))}
                <Container size="xl" style={{ position: 'relative', zIndex: 1 }} py={80}>
                    <Stack align="center" gap="lg" style={isDark ? {} : { background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: 24, padding: '40px 48px', border: '1px solid rgba(255,255,255,0.95)', boxShadow: '0 8px 40px rgba(0,0,0,0.10)' }}>
                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                            <Badge color="brand.2" variant="light" size="xl" radius="xl">{hero.badge}</Badge>
                        </motion.div>
                        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
                            <Title order={1} c={isDark ? 'white' : '#1E293B'} ta="center" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 900 }}>
                                {hero.title}{' '}
                                <Text component="span" style={{ background: 'linear-gradient(135deg, #EA580C, #FB923C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} inherit>
                                    {hero.highlight}
                                </Text>
                            </Title>
                        </motion.div>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                            <Text c={isDark ? 'rgba(255,255,255,0.88)' : '#475569'} ta="center" maw={580} size="lg" lh={1.8}>{hero.desc}</Text>
                        </motion.div>
                    </Stack>
                </Container>
            </Box>

            {/* ── Highlights bar ── */}
            <Box style={{ background: isDark ? 'linear-gradient(90deg, #0A0400, #EA580C, #0A0400)' : 'linear-gradient(90deg, #C2410C, #EA580C, #C2410C)' }} py="xl">
                <Container size="xl">
                    <StaggerContainer delay={0.12}>
                        <SimpleGrid cols={{ base: 2, sm: 4 }}>
                            {highlights.map(h => (
                                <motion.div key={h.label} variants={fadeUp}>
                                    <Stack align="center" gap={4} py="sm">
                                        <Text size="1.6rem">{h.icon}</Text>
                                        <Text fw={900} style={{ fontSize: '2rem', color: '#ffffff' }}>{h.value}</Text>
                                        <Text c="brand.2" size="sm" fw={500}>{h.label}</Text>
                                    </Stack>
                                </motion.div>
                            ))}
                        </SimpleGrid>
                    </StaggerContainer>
                </Container>
            </Box>

            {/* ── Services Grid ── */}
            <Box py={100} style={{ background: isDark ? 'linear-gradient(135deg, #0A0400 0%, #7A2800 50%, #C2410C 100%)' : 'linear-gradient(135deg, #FFF7F0 0%, #FFE8D6 50%, #FFD5B8 100%)', position: 'relative', overflow: 'hidden' }}>
                {isDark && <MeshBackground colors={['#EA580C', '#FB923C', '#7A2800']} />}
                <Container size="xl">
                    <StaggerContainer delay={0.1}>
                        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xl">
                            {items.map((s) => (
                                <motion.div key={s.title} variants={fadeUp} style={{ height: '100%' }}>
                                    <HoverCard style={{ height: '100%' }}>
                                        <Box style={isDark ? { ...glass.white, borderRadius: 20, overflow: 'hidden', height: '100%' } : { background: '#FFFFFF', borderRadius: 20, overflow: 'hidden', height: '100%', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                                            <Box style={{ padding: '30px 28px 24px', position: 'relative', overflow: 'hidden', borderBottom: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #F1F5F9', background: isDark ? 'transparent' : 'linear-gradient(135deg, #FFF7F0, #FFE8D6)' }}>
                                                <Box style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                                                <motion.div style={{ fontSize: '3rem', display: 'inline-block' }} whileHover={{ rotate: [0, -10, 10, 0], scale: 1.2 }} transition={{ duration: 0.4 }}>
                                                    {s.icon}
                                                </motion.div>
                                                <Text fw={800} size="xl" c={isDark ? 'white' : '#1E293B'} mt="md">{s.title}</Text>
                                            </Box>
                                            <Box p="xl">
                                                <Text c={isDark ? 'gray.3' : 'dimmed'} size="sm" lh={1.8} mb="lg">{s.desc}</Text>
                                                <Stack gap={8}>
                                                    {s.features.map(f => (
                                                        <Group key={f} gap={10} align="center">
                                                            <Box style={{ width: 20, height: 20, borderRadius: '50%', background: isDark ? 'rgba(234,88,12,0.3)' : 'rgba(234,88,12,0.12)', border: '1px solid rgba(234,88,12,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                <Text c={isDark ? 'white' : 'brand.7'} size="xs" fw={700}>✓</Text>
                                                            </Box>
                                                            <Text size="sm" c={isDark ? 'gray.2' : '#475569'} fw={500}>{f}</Text>
                                                        </Group>
                                                    ))}
                                                </Stack>
                                            </Box>
                                        </Box>
                                    </HoverCard>
                                </motion.div>
                            ))}
                        </SimpleGrid>
                    </StaggerContainer>
                </Container>
            </Box>

            {/* ── CTA ── */}
            <Box py={80} style={{ background: isDark ? 'linear-gradient(135deg, #0A0400 0%, #C2410C 100%)' : 'linear-gradient(135deg, #C2410C 0%, #EA580C 100%)', position: 'relative', overflow: 'hidden' }}>
                <motion.div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(234,88,12,0.1)' }}
                    animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity }} />
                <Container size="xl" style={{ position: 'relative', zIndex: 1 }}>
                    <ScrollReveal>
                        <Stack align="center" gap="xl">
                            <Title order={2} c="white" ta="center" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)' }}>{cta.title}</Title>
                            <Text c="gray.3" ta="center" maw={500} size="lg">{cta.desc}</Text>
                            <Group gap="md">
                                <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }}>
                                    <Button component={Link} href="/contact" size="xl" radius="xl" color="white" c="brand.8" style={{ paddingInline: 48, fontWeight: 700 }}>
                                        {T.common.freeQuote}
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }}>
                                    <Button component={Link} href="/about" size="xl" radius="xl" variant="outline" color="white" style={{ paddingInline: 48 }}>
                                        {T.common.aboutUs}
                                    </Button>
                                </motion.div>
                            </Group>
                        </Stack>
                    </ScrollReveal>
                </Container>
            </Box>
        </WebsiteLayout>
    );
}
