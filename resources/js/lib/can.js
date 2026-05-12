import { usePage } from '@inertiajs/react';

export function checkPermission(permissions, perm) {
    return Array.isArray(permissions) && permissions.includes(perm);
}

export function useCan() {
    const { auth } = usePage().props;
    const permissions = auth?.user?.permissions ?? [];
    return (perm) => checkPermission(permissions, perm);
}
