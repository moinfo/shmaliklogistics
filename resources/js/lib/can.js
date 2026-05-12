import { usePage } from '@inertiajs/react';

export function checkPermission(permissions, perm) {
    if (!Array.isArray(permissions)) return false;
    if (permissions.includes('*')) return true;
    if (permissions.includes(perm)) return true;
    // module.* wildcard: "trips.*" grants "trips.view", "trips.edit", etc.
    const module = perm.split('.')[0];
    return permissions.includes(module + '.*');
}

export function useCan() {
    const { auth } = usePage().props;
    const permissions = auth?.user?.permissions ?? [];
    return (perm) => checkPermission(permissions, perm);
}
