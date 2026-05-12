import { usePage } from '@inertiajs/react';

export function checkPermission(permissions, permission) {
    if (!permission) return true;
    if (!Array.isArray(permissions) || permissions.length === 0) return false;
    if (permissions.includes('*')) return true;
    if (permissions.includes(permission)) return true;
    const dot = permission.indexOf('.');
    if (dot > -1) {
        const moduleKey = permission.slice(0, dot);
        if (permissions.includes(`${moduleKey}.*`)) return true;
    }
    return false;
}

export function useCan() {
    const { props } = usePage();
    const permissions = props.auth?.user?.permissions ?? [];
    return (permission) => checkPermission(permissions, permission);
}

export function canAny(permissions, list) {
    return list.some(p => checkPermission(permissions, p));
}
