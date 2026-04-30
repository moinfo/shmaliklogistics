import { Head } from '@inertiajs/react';
import DashboardLayout from '../../../../layouts/DashboardLayout';
import EmployeeForm from './EmployeeForm';

export default function EditEmployee({ employee, statuses, departments }) {
    return (
        <DashboardLayout title="Edit Employee">
            <Head title="Edit Employee" />
            <EmployeeForm employee={employee} statuses={statuses} departments={departments} submitUrl={`/system/hr/employees/${employee.id}`} method="put" submitLabel="Save Changes" />
        </DashboardLayout>
    );
}
